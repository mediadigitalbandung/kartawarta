-- Create ENUMs
DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'CHIEF_EDITOR', 'EDITOR', 'SENIOR_JOURNALIST', 'JOURNALIST', 'CONTRIBUTOR'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "VerificationLabel" AS ENUM ('VERIFIED', 'UNVERIFIED', 'CORRECTION', 'OPINION'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ReportReason" AS ENUM ('HOAX', 'INACCURATE', 'SARA', 'DEFAMATION', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "AdType" AS ENUM ('IMAGE', 'GIF', 'HTML'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "AdSlot" AS ENUM ('HEADER', 'SIDEBAR', 'IN_ARTICLE', 'FOOTER', 'POPUP', 'FLOATING_BOTTOM'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "users" ("id" TEXT NOT NULL, "email" TEXT NOT NULL, "password" TEXT NOT NULL, "name" TEXT NOT NULL, "avatar" TEXT, "bio" TEXT, "role" "Role" NOT NULL DEFAULT 'JOURNALIST', "specialization" TEXT, "phone" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true, "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "users_pkey" PRIMARY KEY ("id"));
CREATE TABLE IF NOT EXISTS "categories" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "description" TEXT, "icon" TEXT, "order" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "categories_pkey" PRIMARY KEY ("id"));
CREATE TABLE IF NOT EXISTS "tags" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, CONSTRAINT "tags_pkey" PRIMARY KEY ("id"));
CREATE TABLE IF NOT EXISTS "articles" ("id" TEXT NOT NULL, "title" TEXT NOT NULL, "slug" TEXT NOT NULL, "content" TEXT NOT NULL, "excerpt" TEXT, "featuredImage" TEXT, "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT', "verificationLabel" "VerificationLabel" NOT NULL DEFAULT 'UNVERIFIED', "readTime" INTEGER, "viewCount" INTEGER NOT NULL DEFAULT 0, "publishedAt" TIMESTAMP(3), "scheduledAt" TIMESTAMP(3), "seoTitle" TEXT, "seoDescription" TEXT, "authorId" TEXT NOT NULL, "categoryId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "articles_pkey" PRIMARY KEY ("id"));
CREATE TABLE IF NOT EXISTS "sources" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "title" TEXT, "institution" TEXT, "url" TEXT, "articleId" TEXT NOT NULL, CONSTRAINT "sources_pkey" PRIMARY KEY ("id"));
CREATE TABLE IF NOT EXISTS "corrections" ("id" TEXT NOT NULL, "description" TEXT NOT NULL, "articleId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "corrections_pkey" PRIMARY KEY ("id"));
CREATE TABLE IF NOT EXISTS "revisions" ("id" TEXT NOT NULL, "content" TEXT NOT NULL, "title" TEXT NOT NULL, "changedBy" TEXT NOT NULL, "articleId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "revisions_pkey" PRIMARY KEY ("id"));
CREATE TABLE IF NOT EXISTS "reports" ("id" TEXT NOT NULL, "reason" "ReportReason" NOT NULL, "detail" TEXT, "email" TEXT, "status" "ReportStatus" NOT NULL DEFAULT 'PENDING', "articleId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "reports_pkey" PRIMARY KEY ("id"));
CREATE TABLE IF NOT EXISTS "ads" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "type" "AdType" NOT NULL, "imageUrl" TEXT, "htmlCode" TEXT, "targetUrl" TEXT, "slot" "AdSlot" NOT NULL, "startDate" TIMESTAMP(3) NOT NULL, "endDate" TIMESTAMP(3) NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT true, "priority" INTEGER NOT NULL DEFAULT 0, "impressions" INTEGER NOT NULL DEFAULT 0, "clicks" INTEGER NOT NULL DEFAULT 0, "targetPages" TEXT[] DEFAULT ARRAY[]::TEXT[], "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ads_pkey" PRIMARY KEY ("id"));
CREATE TABLE IF NOT EXISTS "audit_logs" ("id" TEXT NOT NULL, "action" TEXT NOT NULL, "entity" TEXT NOT NULL, "entityId" TEXT NOT NULL, "detail" TEXT, "userId" TEXT NOT NULL, "ip" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"));
CREATE TABLE IF NOT EXISTS "_ArticleToTag" ("A" TEXT NOT NULL, "B" TEXT NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "tags_name_key" ON "tags"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "tags_slug_key" ON "tags"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "articles_slug_key" ON "articles"("slug");
CREATE INDEX IF NOT EXISTS "articles_status_idx" ON "articles"("status");
CREATE INDEX IF NOT EXISTS "articles_authorId_idx" ON "articles"("authorId");
CREATE INDEX IF NOT EXISTS "articles_categoryId_idx" ON "articles"("categoryId");
CREATE INDEX IF NOT EXISTS "articles_publishedAt_idx" ON "articles"("publishedAt");
CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");
CREATE UNIQUE INDEX IF NOT EXISTS "_ArticleToTag_AB_unique" ON "_ArticleToTag"("A", "B");
CREATE INDEX IF NOT EXISTS "_ArticleToTag_B_index" ON "_ArticleToTag"("B");

ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_authorId_fkey";
ALTER TABLE "articles" ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_categoryId_fkey";
ALTER TABLE "articles" ADD CONSTRAINT "articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sources" DROP CONSTRAINT IF EXISTS "sources_articleId_fkey";
ALTER TABLE "sources" ADD CONSTRAINT "sources_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "corrections" DROP CONSTRAINT IF EXISTS "corrections_articleId_fkey";
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revisions" DROP CONSTRAINT IF EXISTS "revisions_articleId_fkey";
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reports" DROP CONSTRAINT IF EXISTS "reports_articleId_fkey";
ALTER TABLE "reports" ADD CONSTRAINT "reports_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_userId_fkey";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "_ArticleToTag" DROP CONSTRAINT IF EXISTS "_ArticleToTag_A_fkey";
ALTER TABLE "_ArticleToTag" ADD CONSTRAINT "_ArticleToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ArticleToTag" DROP CONSTRAINT IF EXISTS "_ArticleToTag_B_fkey";
ALTER TABLE "_ArticleToTag" ADD CONSTRAINT "_ArticleToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "_prisma_migrations" ("id" VARCHAR(36) NOT NULL, "checksum" VARCHAR(64) NOT NULL, "finished_at" TIMESTAMP WITH TIME ZONE, "migration_name" VARCHAR(255) NOT NULL, "logs" TEXT, "rolled_back_at" TIMESTAMP WITH TIME ZONE, "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "applied_steps_count" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id"));
