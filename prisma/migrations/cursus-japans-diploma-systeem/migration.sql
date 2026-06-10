-- Migration: Cursus Japans diploma systeem
-- Changes: Update CourseProgress unique constraint to allow multiple belt levels per user
-- Run this in Neon Console SQL editor

-- Step 1: Drop the old unique constraint
ALTER TABLE "CourseProgress" 
  DROP CONSTRAINT IF EXISTS "CourseProgress.userId_courseName_unique";

-- Step 2: Add the new unique constraint (userId + courseName + beltLevel)
ALTER TABLE "CourseProgress" 
  ADD CONSTRAINT "CourseProgress.userId_courseName_beltLevel_unique" 
  UNIQUE ("userId", "courseName", "beltLevel");
