/*
  Warnings:

  - You are about to drop the column `edge` on the `Sitemap` table. All the data in the column will be lost.
  - You are about to drop the column `node` on the `Sitemap` table. All the data in the column will be lost.
  - Added the required column `edges` to the `Sitemap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nodes` to the `Sitemap` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sitemap" DROP COLUMN "edge",
DROP COLUMN "node",
ADD COLUMN     "edges" JSONB NOT NULL,
ADD COLUMN     "nodes" JSONB NOT NULL;
