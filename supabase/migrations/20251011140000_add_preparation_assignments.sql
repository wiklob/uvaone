-- Add preparation assignment type and lesson relation
-- This allows assignments to be tied to specific lessons (e.g., readings before a tutorial)

-- Drop the existing type constraint
ALTER TABLE assignment DROP CONSTRAINT IF EXISTS assignment_type_check;

-- Add the new constraint with 'preparation' included
ALTER TABLE assignment ADD CONSTRAINT assignment_type_check
  CHECK (type IN ('homework', 'essay', 'project', 'exam', 'quiz', 'presentation', 'preparation'));

-- Add lesson_id column to link preparations to specific lessons
ALTER TABLE assignment ADD COLUMN lesson_id UUID REFERENCES lesson(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_assignment_lesson ON assignment(lesson_id);

-- Add comment for documentation
COMMENT ON COLUMN assignment.lesson_id IS 'Optional link to a specific lesson. Used primarily for preparation assignments that must be completed before attending a lesson.';
