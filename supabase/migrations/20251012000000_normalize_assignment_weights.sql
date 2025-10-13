-- ============================================
-- MIGRATION: Normalize Assignment Weights
-- Date: 2025-10-12
-- Purpose: Ensure all courses have assignments totaling 100% weight
-- Strategy: Add new assignments to reach 100%, always ending with a test
-- ============================================

-- ============================================
-- STEP 1: Fix NULL Weights
-- ============================================

-- Update any NULL weights to 0 for safety
UPDATE assignment
SET weight = 0
WHERE weight IS NULL AND published = true;

-- ============================================
-- STEP 2: Add Missing Assignments
-- ============================================

-- For each course, calculate how many assignments to add and their weights
-- Strategy:
--   - If deficit > 0.4: Add test (40%) + homework to fill remaining
--   - If deficit > 0.2 and <= 0.4: Add test with remaining weight
--   - If deficit > 0 and <= 0.2: Add homework with remaining weight

DO $$
DECLARE
  course_record RECORD;
  weight_needed NUMERIC;
  test_weight NUMERIC;
  homework_weight NUMERIC;
  assignment_count INT;
BEGIN
  -- Loop through all courses that need weight adjustments
  FOR course_record IN
    SELECT
      c.id as course_id,
      c.code,
      c.title,
      COALESCE(SUM(a.weight), 0) as current_weight,
      COUNT(a.id) as existing_assignments
    FROM course c
    LEFT JOIN assignment a ON c.id = a.course_id AND a.published = true
    GROUP BY c.id, c.code, c.title
    HAVING COALESCE(SUM(a.weight), 0) < 0.99  -- Allow small rounding tolerance
  LOOP
    weight_needed := 1.0 - course_record.current_weight;
    assignment_count := course_record.existing_assignments;

    RAISE NOTICE 'Processing course: % (%) - Current weight: %, Need: %',
      course_record.code, course_record.title, course_record.current_weight, weight_needed;

    -- Case 1: Need > 40% - Add test (40%) and homework assignments
    IF weight_needed > 0.4 THEN
      -- Add final test/exam (40% weight)
      INSERT INTO assignment (
        id,
        course_id,
        title,
        description,
        type,
        max_points,
        weight,
        due_date,
        submission_type,
        allows_late,
        published,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        course_record.course_id,
        'Final Exam',
        'Comprehensive final examination covering all course material.',
        'exam',
        100,
        0.4,
        (CURRENT_DATE + INTERVAL '90 days')::timestamp,
        'no_submission',
        false,
        true,
        NOW(),
        NOW()
      );

      weight_needed := weight_needed - 0.4;
      assignment_count := assignment_count + 1;

      -- Add homework assignments to fill remaining weight
      -- Distribute evenly across 2-3 assignments
      IF weight_needed > 0.3 THEN
        -- Add 3 homework assignments
        FOR i IN 1..3 LOOP
          INSERT INTO assignment (
            id,
            course_id,
            title,
            description,
            type,
            max_points,
            weight,
            due_date,
            submission_type,
            allows_late,
            published,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            course_record.course_id,
            'Homework Assignment ' || (assignment_count + i),
            'Regular homework assignment to reinforce course concepts.',
            'homework',
            100,
            ROUND((weight_needed / 3.0)::numeric, 3),
            (CURRENT_DATE + INTERVAL '30 days' * i)::timestamp,
            'file_upload',
            true,
            true,
            NOW(),
            NOW()
          );
        END LOOP;
      ELSIF weight_needed > 0.15 THEN
        -- Add 2 homework assignments
        FOR i IN 1..2 LOOP
          INSERT INTO assignment (
            id,
            course_id,
            title,
            description,
            type,
            max_points,
            weight,
            due_date,
            submission_type,
            allows_late,
            published,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            course_record.course_id,
            'Homework Assignment ' || (assignment_count + i),
            'Regular homework assignment to reinforce course concepts.',
            'homework',
            100,
            ROUND((weight_needed / 2.0)::numeric, 3),
            (CURRENT_DATE + INTERVAL '30 days' * i)::timestamp,
            'file_upload',
            true,
            true,
            NOW(),
            NOW()
          );
        END LOOP;
      ELSIF weight_needed > 0.01 THEN
        -- Add 1 homework assignment
        INSERT INTO assignment (
          id,
          course_id,
          title,
          description,
          type,
          max_points,
          weight,
          due_date,
          submission_type,
          allows_late,
          published,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          course_record.course_id,
          'Homework Assignment ' || (assignment_count + 1),
          'Regular homework assignment to reinforce course concepts.',
          'homework',
          100,
          ROUND(weight_needed::numeric, 3),
          (CURRENT_DATE + INTERVAL '30 days')::timestamp,
          'file_upload',
          true,
          true,
          NOW(),
          NOW()
        );
      END IF;

    -- Case 2: Need 20-40% - Add test with remaining weight
    ELSIF weight_needed > 0.2 AND weight_needed <= 0.4 THEN
      INSERT INTO assignment (
        id,
        course_id,
        title,
        description,
        type,
        max_points,
        weight,
        due_date,
        submission_type,
        allows_late,
        published,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        course_record.course_id,
        'Final Test',
        'Final test covering course material.',
        'exam',
        100,
        ROUND(weight_needed::numeric, 3),
        (CURRENT_DATE + INTERVAL '90 days')::timestamp,
        'no_submission',
        false,
        true,
        NOW(),
        NOW()
      );

    -- Case 3: Need < 20% - Add homework with remaining weight
    ELSIF weight_needed > 0.01 AND weight_needed <= 0.2 THEN
      INSERT INTO assignment (
        id,
        course_id,
        title,
        description,
        type,
        max_points,
        weight,
        due_date,
        submission_type,
        allows_late,
        published,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        course_record.course_id,
        'Additional Homework',
        'Additional homework assignment.',
        'homework',
        100,
        ROUND(weight_needed::numeric, 3),
        (CURRENT_DATE + INTERVAL '45 days')::timestamp,
        'file_upload',
        true,
        true,
        NOW(),
        NOW()
      );
    END IF;

  END LOOP;
END $$;

-- ============================================
-- STEP 3: Fine-Tune Rounding Errors
-- ============================================

-- Handle any minor rounding errors by adjusting the last assignment per course
DO $$
DECLARE
  course_record RECORD;
  weight_diff NUMERIC;
  last_assignment_id UUID;
  last_assignment_weight NUMERIC;
BEGIN
  FOR course_record IN
    SELECT
      c.id as course_id,
      COALESCE(SUM(a.weight), 0) as total_weight
    FROM course c
    LEFT JOIN assignment a ON c.id = a.course_id AND a.published = true
    GROUP BY c.id
    HAVING ABS(1.0 - COALESCE(SUM(a.weight), 0)) > 0.001
  LOOP
    weight_diff := 1.0 - course_record.total_weight;

    -- Get the last assignment for this course
    SELECT id, weight INTO last_assignment_id, last_assignment_weight
    FROM assignment
    WHERE course_id = course_record.course_id AND published = true
    ORDER BY created_at DESC
    LIMIT 1;

    IF last_assignment_id IS NOT NULL THEN
      UPDATE assignment
      SET weight = ROUND((last_assignment_weight + weight_diff)::numeric, 3)
      WHERE id = last_assignment_id;

      RAISE NOTICE 'Adjusted course % last assignment by %', course_record.course_id, weight_diff;
    END IF;
  END LOOP;
END $$;
