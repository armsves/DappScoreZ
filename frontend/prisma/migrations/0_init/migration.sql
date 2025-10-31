-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "website" TEXT,
    "x" TEXT,
    "github" TEXT,
    "programId" TEXT,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "blockchain" TEXT NOT NULL DEFAULT 'solana',

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ERC20Coin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "chain" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "ERC20Coin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectMetrics" (
    "id" TEXT NOT NULL,
    "githubStars" INTEGER NOT NULL DEFAULT 0,
    "twitterFollowers" INTEGER NOT NULL DEFAULT 0,
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "ProjectMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "stellarAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserMetrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "reputationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "UserMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contracts" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "interactions" INTEGER NOT NULL DEFAULT 0,
    "last_interaction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."social_metrics" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "github_stars" INTEGER NOT NULL DEFAULT 0,
    "github_forks" INTEGER NOT NULL DEFAULT 0,
    "github_last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "twitter_followers" INTEGER NOT NULL DEFAULT 0,
    "twitter_last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "project_freshness" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "social_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ProjectCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProjectCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_name_key" ON "public"."projects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ERC20Coin_address_key" ON "public"."ERC20Coin"("address");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMetrics_projectId_key" ON "public"."ProjectMetrics"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stellarAddress_key" ON "public"."User"("stellarAddress");

-- CreateIndex
CREATE UNIQUE INDEX "UserMetrics_userId_key" ON "public"."UserMetrics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_projectId_userId_key" ON "public"."Vote"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "public"."categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_address_key" ON "public"."contracts"("address");

-- CreateIndex
CREATE INDEX "contracts_address_idx" ON "public"."contracts"("address");

-- CreateIndex
CREATE UNIQUE INDEX "social_metrics_project_id_key" ON "public"."social_metrics"("project_id");

-- CreateIndex
CREATE INDEX "social_metrics_project_freshness_idx" ON "public"."social_metrics"("project_freshness" DESC);

-- CreateIndex
CREATE INDEX "_ProjectCategories_B_index" ON "public"."_ProjectCategories"("B");

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMetrics" ADD CONSTRAINT "ProjectMetrics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserMetrics" ADD CONSTRAINT "UserMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."social_metrics" ADD CONSTRAINT "social_metrics_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProjectCategories" ADD CONSTRAINT "_ProjectCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProjectCategories" ADD CONSTRAINT "_ProjectCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

