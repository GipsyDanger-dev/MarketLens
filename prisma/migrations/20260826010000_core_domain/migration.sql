-- CreateEnum
CREATE TYPE "ResearchStatus" AS ENUM ('DRAFT', 'QUEUED', 'COLLECTING', 'NORMALIZING', 'ANALYZING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "category" TEXT,
    "locationQuery" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusMeters" INTEGER NOT NULL,
    "maxResults" INTEGER NOT NULL DEFAULT 250,
    "status" "ResearchStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchJob" (
    "id" TEXT NOT NULL,
    "researchProjectId" TEXT NOT NULL,
    "status" "ResearchStatus" NOT NULL DEFAULT 'QUEUED',
    "totalDiscovered" INTEGER NOT NULL DEFAULT 0,
    "totalProcessed" INTEGER NOT NULL DEFAULT 0,
    "totalFailed" INTEGER NOT NULL DEFAULT 0,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "ResearchJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "researchProjectId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "category" TEXT,
    "providerTypes" TEXT[],
    "address" TEXT,
    "city" TEXT,
    "district" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "phone" TEXT,
    "website" TEXT,
    "sourceUrl" TEXT,
    "businessStatus" TEXT,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaceSnapshot" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketMetrics" (
    "id" TEXT NOT NULL,
    "researchProjectId" TEXT NOT NULL,
    "totalBusinesses" INTEGER NOT NULL,
    "averageRating" DOUBLE PRECISION,
    "medianRating" DOUBLE PRECISION,
    "averageReviewCount" DOUBLE PRECISION,
    "medianReviewCount" DOUBLE PRECISION,
    "competitionScore" DOUBLE PRECISION,
    "densityScore" DOUBLE PRECISION,
    "metricJson" JSONB NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorScore" (
    "id" TEXT NOT NULL,
    "researchProjectId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "componentScores" JSONB NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "CompetitorScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" TEXT NOT NULL,
    "researchProjectId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "insightJson" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "researchProjectId" TEXT NOT NULL,
    "reportData" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ResearchProject_userId_idx" ON "ResearchProject"("userId");

-- CreateIndex
CREATE INDEX "ResearchProject_status_idx" ON "ResearchProject"("status");

-- CreateIndex
CREATE INDEX "ResearchJob_researchProjectId_status_idx" ON "ResearchJob"("researchProjectId", "status");

-- CreateIndex
CREATE INDEX "Place_researchProjectId_normalizedName_idx" ON "Place"("researchProjectId", "normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "Place_researchProjectId_providerId_externalId_key" ON "Place"("researchProjectId", "providerId", "externalId");

-- CreateIndex
CREATE INDEX "PlaceSnapshot_placeId_capturedAt_idx" ON "PlaceSnapshot"("placeId", "capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MarketMetrics_researchProjectId_key" ON "MarketMetrics"("researchProjectId");

-- CreateIndex
CREATE INDEX "CompetitorScore_researchProjectId_overallScore_idx" ON "CompetitorScore"("researchProjectId", "overallScore");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorScore_researchProjectId_placeId_key" ON "CompetitorScore"("researchProjectId", "placeId");

-- CreateIndex
CREATE INDEX "AIInsight_researchProjectId_generatedAt_idx" ON "AIInsight"("researchProjectId", "generatedAt");

-- CreateIndex
CREATE INDEX "Report_researchProjectId_generatedAt_idx" ON "Report"("researchProjectId", "generatedAt");

-- AddForeignKey
ALTER TABLE "ResearchProject" ADD CONSTRAINT "ResearchProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchJob" ADD CONSTRAINT "ResearchJob_researchProjectId_fkey" FOREIGN KEY ("researchProjectId") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_researchProjectId_fkey" FOREIGN KEY ("researchProjectId") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceSnapshot" ADD CONSTRAINT "PlaceSnapshot_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketMetrics" ADD CONSTRAINT "MarketMetrics_researchProjectId_fkey" FOREIGN KEY ("researchProjectId") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorScore" ADD CONSTRAINT "CompetitorScore_researchProjectId_fkey" FOREIGN KEY ("researchProjectId") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorScore" ADD CONSTRAINT "CompetitorScore_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_researchProjectId_fkey" FOREIGN KEY ("researchProjectId") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_researchProjectId_fkey" FOREIGN KEY ("researchProjectId") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
