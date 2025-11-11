-- CreateTable
CREATE TABLE "Sitemap" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "prompt" TEXT,
    "node" JSONB NOT NULL,
    "edge" JSONB NOT NULL,
    "language" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sitemap_pkey" PRIMARY KEY ("id")
);
