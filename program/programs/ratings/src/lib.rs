use anchor_lang::prelude::*;

declare_id!("63uX58srXmpgXzZpdZUpBjDGWJj2fje227ecoVLS1Jvx");

#[program]
pub mod ratings {
    use super::*;

    // Initialize a new project rating account
    pub fn initialize_project_rating(
        ctx: Context<InitializeProjectRating>,
        project_id: u64,
    ) -> Result<()> {
        msg!("Initializing project rating for project ID: {}", project_id);

        let project_rating = &mut ctx.accounts.project_rating;
        project_rating.project_id = project_id;
        project_rating.total_rating = 0;
        project_rating.total_votes = 0;
        project_rating.average_rating = 0.0;
        project_rating.review_count = 0;

        Ok(())
    }

    // Submit a rating (and optional text review) for a project
    pub fn submit_rating(
        ctx: Context<SubmitRating>,
        project_id: u64, // Project ID
        rating: u8, // 1-5 star rating
        review_text: Option<String>, // Optional text review
    ) -> Result<()> {
        // Validate rating is between 1 and 5
        require!(rating >= 1 && rating <= 5, RatingError::InvalidRating);

        // Validate review text length if provided (max 500 characters)
        if let Some(ref text) = review_text {
            require!(text.len() <= 500, RatingError::ReviewTooLong);
        }

        let project_rating = &mut ctx.accounts.project_rating;
        let user_rating = &mut ctx.accounts.user_rating;
        let clock = Clock::get()?;

        // Initialize project_rating if it's new
        if project_rating.project_id == 0 {
            project_rating.project_id = project_id;
            project_rating.total_rating = 0;
            project_rating.total_votes = 0;
            project_rating.average_rating = 0.0;
            project_rating.review_count = 0;
            msg!("Initialized project rating for project ID: {}", project_id);
        }

        msg!("Submitting rating {} for project ID: {}", rating, project_rating.project_id);

        // Check if user has already rated this project
        if user_rating.has_rated {
            // Update existing rating
            let old_rating = user_rating.rating;
            
            // Subtract old rating from total
            project_rating.total_rating = project_rating.total_rating
                .checked_sub(old_rating as u64)
                .ok_or(RatingError::ArithmeticError)?;
            
            // Add new rating to total
            project_rating.total_rating = project_rating.total_rating
                .checked_add(rating as u64)
                .ok_or(RatingError::ArithmeticError)?;
            
            // Update user's rating with wallet address and project ID recorded
            user_rating.user = ctx.accounts.user.key();
            user_rating.project_id = project_rating.project_id;
            user_rating.rating = rating;
            user_rating.timestamp = clock.unix_timestamp; // Update timestamp on rating change
            
            msg!("Updated existing rating from {} to {} by user {}", old_rating, rating, ctx.accounts.user.key());
        } else {
            // New rating
            project_rating.total_rating = project_rating.total_rating
                .checked_add(rating as u64)
                .ok_or(RatingError::ArithmeticError)?;
            
            project_rating.total_votes = project_rating.total_votes
                .checked_add(1)
                .ok_or(RatingError::ArithmeticError)?;
            
            // Set user rating data with wallet address and project ID
            user_rating.user = ctx.accounts.user.key();
            user_rating.project_id = project_rating.project_id;
            user_rating.rating = rating;
            user_rating.has_rated = true;
            user_rating.timestamp = clock.unix_timestamp;
            
            msg!("New rating submitted: {} votes total, rating {} by user {} for project {}", 
                 project_rating.total_votes, rating, ctx.accounts.user.key(), project_rating.project_id);
        }

        // Handle text review if provided
        if let Some(ref text) = review_text {
            let text_review = &mut ctx.accounts.text_review;
            
            // Check if this is a new review (account was just initialized)
            let default_pubkey = Pubkey::default();
            let is_new_review = text_review.user == default_pubkey || text_review.review_text.is_empty();
            
            // Set review data
            text_review.user = ctx.accounts.user.key();
            text_review.project_id = project_rating.project_id;
            text_review.review_text = text.clone();
            text_review.timestamp = clock.unix_timestamp;
            
            // Increment review count only if this is a new review
            if is_new_review {
                project_rating.review_count = project_rating.review_count
                    .checked_add(1)
                    .ok_or(RatingError::ArithmeticError)?;
            }
            
            msg!("Text review submitted by user {} for project {}", ctx.accounts.user.key(), project_rating.project_id);
        }

        // Calculate new average rating
        if project_rating.total_votes > 0 {
            project_rating.average_rating = project_rating.total_rating as f64 / project_rating.total_votes as f64;
        }

        msg!("New average rating: {:.2}", project_rating.average_rating);
        msg!("Total reviews: {}", project_rating.review_count);

        Ok(())
    }

    // Get project rating info (read-only, but useful for testing)
    pub fn get_project_rating(ctx: Context<GetProjectRating>) -> Result<()> {
        let project_rating = &ctx.accounts.project_rating;
        
        msg!("Project ID: {}", project_rating.project_id);
        msg!("Total Rating: {}", project_rating.total_rating);
        msg!("Total Votes: {}", project_rating.total_votes);
        msg!("Average Rating: {:.2}", project_rating.average_rating);

        Ok(())
    }

    // Get user rating info (read-only)
    pub fn get_user_rating(
        ctx: Context<GetUserRating>,
        _user: Pubkey,
        _project_id: u64,
    ) -> Result<()> {
        let user_rating = &ctx.accounts.user_rating;
        
        msg!("User Wallet: {}", user_rating.user);
        msg!("Project ID: {}", user_rating.project_id);
        msg!("Rating: {}", user_rating.rating);
        msg!("Has Rated: {}", user_rating.has_rated);
        msg!("Timestamp: {}", user_rating.timestamp);

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct InitializeProjectRating<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + ProjectRating::LEN,
        seeds = [b"project_rating", project_id.to_le_bytes().as_ref()],
        bump
    )]
    pub project_rating: Account<'info, ProjectRating>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(project_id: u64, rating: u8, review_text: Option<String>)]
pub struct SubmitRating<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + ProjectRating::LEN,
        seeds = [b"project_rating", project_id.to_le_bytes().as_ref()],
        bump
    )]
    pub project_rating: Account<'info, ProjectRating>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserRating::LEN,
        seeds = [b"user_rating", user.key().as_ref(), project_id.to_le_bytes().as_ref()],
        bump
    )]
    pub user_rating: Account<'info, UserRating>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + TextReview::LEN,
        seeds = [b"text_review", user.key().as_ref(), project_id.to_le_bytes().as_ref()],
        bump
    )]
    pub text_review: Account<'info, TextReview>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetProjectRating<'info> {
    #[account(
        seeds = [b"project_rating", project_rating.project_id.to_le_bytes().as_ref()],
        bump
    )]
    pub project_rating: Account<'info, ProjectRating>,
}

#[derive(Accounts)]
#[instruction(user: Pubkey, project_id: u64)]
pub struct GetUserRating<'info> {
    #[account(
        seeds = [b"user_rating", user.as_ref(), project_id.to_le_bytes().as_ref()],
        bump
    )]
    pub user_rating: Account<'info, UserRating>,
}

#[account]
pub struct ProjectRating {
    pub project_id: u64,        // 8 bytes
    pub total_rating: u64,      // 8 bytes - sum of all ratings
    pub total_votes: u64,       // 8 bytes - number of votes
    pub average_rating: f64,    // 8 bytes - calculated average
    pub review_count: u64,      // 8 bytes - number of text reviews
}

impl ProjectRating {
    pub const LEN: usize = 8 + 8 + 8 + 8 + 8; // 40 bytes
}

#[account]
pub struct UserRating {
    pub user: Pubkey,           // 32 bytes
    pub project_id: u64,        // 8 bytes
    pub rating: u8,             // 1 byte
    pub has_rated: bool,        // 1 byte
    pub timestamp: i64,         // 8 bytes
}

impl UserRating {
    pub const LEN: usize = 32 + 8 + 1 + 1 + 8; // 50 bytes
}

#[account]
pub struct TextReview {
    pub user: Pubkey,           // 32 bytes
    pub project_id: u64,        // 8 bytes
    pub review_text: String,    // 4 bytes (prefix) + up to 500 bytes
    pub timestamp: i64,         // 8 bytes
}

impl TextReview {
    pub const LEN: usize = 32 + 8 + 4 + 500 + 8; // 552 bytes (max size)
}

#[error_code]
pub enum RatingError {
    #[msg("Rating must be between 1 and 5")]
    InvalidRating,
    #[msg("Arithmetic operation failed")]
    ArithmeticError,
    #[msg("Review text is too long (max 500 characters)")]
    ReviewTooLong,
}
