# DappScoreZ - Solana Project Directory

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsolana-developers%2Fanchor-web3js-nextjs&root-directory=frontend&demo-title=DappScoreZ%20Solana%20Directory&demo-description=A%20beautiful%20project%20directory%20for%20Solana%20projects&demo-url=https%3A%2F%2Fdappscorez.vercel.app%2F&project-name=dappscorez&repository-name=dappscorez)

A beautiful project directory for discovering, rating, and submitting Solana projects with on-chain ratings and admin management. Built with Next.js, Prisma, and PostgreSQL.

## 🌟 Features

- **Project Discovery**: Browse and discover the best Solana projects
- **Project Submission**: Anyone can submit projects for review
- **Admin Panel**: Wallet-based admin authentication for project management
- **On-chain Ratings**: Ratings fetched directly from the blockchain (coming soon)
- **Responsive Design**: Beautiful, modern UI with Tailwind CSS
- **Database Integration**: PostgreSQL with Prisma ORM

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Vercel/Neon recommended)
- Admin wallet address for management

### Installation

1. **Clone and Install Dependencies**
```bash
cd frontend
npm install
```

2. **Environment Setup**
Create a `.env` file in the frontend directory:
```env
# Database
DATABASE_URL="postgres://default:EPQ9xokz5Rtm@ep-dawn-hat-a4v4ssp4-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require"

# Admin wallet address (only this wallet can activate/delete projects)
ADMIN_WALLET_ADDRESS="YOUR_SOLANA_WALLET_ADDRESS_HERE"

# Optional: GitHub Personal Access Token (increases API rate limit from 60 to 5000 requests/hour)
# Create one at: https://github.com/settings/tokens
# Only needs 'public_repo' scope for reading public repository data
GITHUB_TOKEN="ghp_your_token_here"

# Optional: Twitter/X RapidAPI key for checking latest tweets
# Get your API key from: https://rapidapi.com/twitter-api/api/twitter241
# Free tier available with rate limits
X_API_KEY="your_rapidapi_key_here"
```

3. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Add sample data
npm run db:seed
```

4. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your project directory!

<table>
  <tr>
    <th align="center">Phantom</th>
    <th align="center">Solflare</th>
  </tr>
  <tr>
    <td align="center">
      <video src="https://github.com/user-attachments/assets/a5897696-5cdc-4e91-9c74-1ea4a624c59e" alt="Phantom" />
    </td>
    <td align="center">
      <video src="https://github.com/user-attachments/assets/4b44b357-bc9f-410a-a024-f2cb6d4c2aee" alt="Solflare" />
    </td>
  </tr>
</table>

This template is for educational purposes and set up for devnet use only.

## 🎓 Educational Purpose

This template is designed for developers who want to learn:

- How to build Solana programs using the Anchor framework
- How to work with PDAs for state management and program signing
- How to perform Cross-Program Invocations (CPIs)
- How to create frontends that interact with Solana programs
- How to handle wallet connections and transactions on a frontend

## 📝 Program Overview

The Solana program demonstrates project rating functionality with on-chain data storage:

### Program Derived Addresses (PDAs)

1. **Project Rating PDA**

   - Stores aggregated rating data for each project
   - Derived using seeds "project_rating" + project_id
   - Tracks total rating sum, vote count, and average rating
   - Automatically initialized when first rating is submitted

2. **User Rating PDA**

   - Stores individual user ratings for projects
   - Derived using seeds "user_rating" + user_pubkey + project_id  
   - Prevents users from rating the same project multiple times
   - Contains user's rating value and timestamp

2. **Vault PDA**
   - Holds SOL tokens from user transactions
   - Derived using:
     - Seed "vault"
     - User's public key
   - Each user gets their own vault
   - Demonstrates using PDAs for CPI signing

### Cross-Program Invocations (CPIs)

The program demonstrates CPIs through SOL transfers:

- User → Vault (increment): Basic CPI to system program
- Vault → User (decrement): CPI with PDA signing

## 🏗 Project Structure

```
├── program/             # Solana program (smart contract)
│   ├── programs/        # Program source code
│   ├── tests/           # Program tests
│   └── Anchor.toml      # Anchor configuration
│
└── frontend/           # Next.js frontend
    ├── app/            # app router page and layout
    ├── components/     # React components
    └── anchor-idl/     # Program IDL
```

## 🔧 Core Features

1. **Solana Program**

   - Counter state management using PDA
   - Vault system using user-specific PDAs
   - SOL transfer demonstration using CPIs
   - PDA initialization and signing

2. **Frontend Application**
   - Wallet adapter integration
   - Real-time counter updates
   - Transaction toast notifications
   - UI with Tailwind CSS and shadcn/ui

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Rust and Solana CLI tools
- Anchor Framework

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
```

2. Install program dependencies:

```bash
cd program
pnpm install
anchor build
anchor keys sync
```

3. Install frontend dependencies:

```bash
cd frontend
pnpm install
```

### Development

1. Test the program:

```bash
cd program
anchor test
```

2. Run the frontend:

```bash
cd frontend
pnpm dev
```

## 💡 Learning Resources

### Program (Smart Contract)

- `program/programs/counter/src/lib.rs`: Core program logic
  - Instruction handling
  - PDA creation and management
  - CPI implementation

### Frontend Components

- `frontend/components/counter/`: Main dApp components
  - `CounterDisplay.tsx`: Real-time data updates
  - `IncrementButton.tsx` & `DecrementButton.tsx`: Transaction handling
  - `WalletButton.tsx`: Wallet adapter button

### Custom Hooks

- `frontend/components/counter/hooks/`:
  - `useProgram.tsx`: Program initialization and wallet management
  - `useTransactionToast.tsx`: Transaction notification

## 🔍 Key Concepts Demonstrated

1. **Program Development**

   - PDA creation and management
     - Counter state PDA
     - User-specific vault PDAs
   - Cross-Program Invocations (CPIs)
     - Basic transfers (user to vault)
     - PDA signing (vault to user)
   - State management
     - Initialize-if-needed pattern
     - Program state updates

2. **Frontend Development**
   - Wallet integration and connection
   - Transaction building and signing
   - Account subscription for real-time updates
   - Toast notifications for transaction feedback
