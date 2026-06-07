BEGIN;

-- Reset known project data (repeatable seed).
TRUNCATE TABLE "UserStories", "Sprints" RESTART IDENTITY CASCADE;

DO $$
BEGIN
  IF to_regclass('public."Users"') IS NOT NULL THEN
    EXECUTE 'TRUNCATE TABLE "Users" RESTART IDENTITY CASCADE';
  END IF;
END $$;

INSERT INTO "Sprints" ("Name", "StartDate", "EndDate")
VALUES
  ('Sprint 1 - Foundation', '2026-04-01T00:00:00Z', '2026-04-14T23:59:59Z'),
  ('Sprint 2 - Delivery',   '2026-04-15T00:00:00Z', '2026-04-28T23:59:59Z'),
  ('Sprint 3 - Hardening',  '2026-04-29T00:00:00Z', '2026-05-12T23:59:59Z');

-- Status mapping:
-- 0 ToDo, 1 Blocked, 2 InProgress, 3 CodeReview, 4 Done
INSERT INTO "UserStories" ("Title", "Description", "Status", "SprintId")
VALUES
  ('Set up CI pipeline', 'Create build and test pipeline for backend and frontend.', 4, 1),
  ('Add sprint listing endpoint', 'Expose GET endpoint returning all sprints.', 4, 1),
  ('Handle nullable sprint assignment', 'Allow user stories to exist in backlog without sprint.', 4, 1),
  ('Implement story filtering', 'Support filtering stories by status.', 3, 2),
  ('Add story validation', 'Validate request DTOs with data annotations.', 2, 2),
  ('Implement pagination', 'Add page/pageSize for story list.', 2, 2),
  ('Add optimistic locking', 'Prevent lost updates in concurrent edits.', 1, 3),
  ('Audit log for status changes', 'Track who changed story status and when.', 0, 3),
  ('Backlog: define report export', 'Research CSV/PDF export requirements.', 0, NULL),
  ('Backlog: role permissions', 'Define Admin/Developer/Viewer capabilities.', 0, NULL);

COMMIT;