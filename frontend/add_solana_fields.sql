-- AlterTable
ALTER TABLE "projects" ADD COLUMN "icon" TEXT;
ALTER TABLE "projects" ADD COLUMN "x" TEXT;
ALTER TABLE "projects" ADD COLUMN "github" TEXT;
ALTER TABLE "projects" ADD COLUMN "programId" TEXT;
ALTER TABLE "projects" ADD COLUMN "activated" BOOLEAN NOT NULL DEFAULT false;

-- Update existing records to copy data from old columns to new ones
UPDATE "projects" SET "x" = "twitter_url" WHERE "twitter_url" IS NOT NULL;
UPDATE "projects" SET "github" = "github_url" WHERE "github_url" IS NOT NULL;

-- Set blockchain to solana for new records
ALTER TABLE "projects" ALTER COLUMN "blockchain" SET DEFAULT 'solana';
