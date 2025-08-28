/*
  Warnings:

  - The values [REJECTED] on the enum `PostStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PUBLISHED,HIDDEN] on the enum `ReviewStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PostStatus_new" AS ENUM ('PENDING', 'APPROVED', 'PUBLISHED');
ALTER TABLE "public"."posts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."posts" ALTER COLUMN "status" TYPE "public"."PostStatus_new" USING ("status"::text::"public"."PostStatus_new");
ALTER TYPE "public"."PostStatus" RENAME TO "PostStatus_old";
ALTER TYPE "public"."PostStatus_new" RENAME TO "PostStatus";
DROP TYPE "public"."PostStatus_old";
ALTER TABLE "public"."posts" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ReviewStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."post_reviews" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."post_reviews" ALTER COLUMN "status" TYPE "public"."ReviewStatus_new" USING ("status"::text::"public"."ReviewStatus_new");
ALTER TYPE "public"."ReviewStatus" RENAME TO "ReviewStatus_old";
ALTER TYPE "public"."ReviewStatus_new" RENAME TO "ReviewStatus";
DROP TYPE "public"."ReviewStatus_old";
ALTER TABLE "public"."post_reviews" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
