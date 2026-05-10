BEGIN;

-- Reset data and identity values so the script is repeatable.
TRUNCATE TABLE "UserStories", "Sprints" RESTART IDENTITY CASCADE;

INSERT INTO "Sprints" ("Name", "StartDate", "EndDate")
VALUES
  ('Sprint 1 - Foundation', '2026-04-01T00:00:00Z', '2026-04-14T23:59:59Z'),
  ('Sprint 2 - Delivery', '2026-04-15T00:00:00Z', '2026-04-28T23:59:59Z');

-- Status mapping (int):
-- 0 ToDo, 1 Blocked, 2 InProgress, 3 CodeReview, 4 Done
INSERT INTO "UserStories" ("Title", "Description", "Status", "SprintId")
VALUES
  ('Set up CI pipeline', 'Create build and test pipeline for backend and frontend.', 2, 1),
  ('Add sprint listing endpoint', 'Expose GET endpoint returning all sprints.', 4, 1),
  ('Handle nullable sprint assignment', 'Allow user stories to exist in backlog without sprint.', 3, 1),
  ('Implement story filtering', 'Support filtering stories by status.', 0, 2),
  ('Add story validation', 'Validate request DTOs with data annotations.', 1, 2),
  ('Backlog: define report export', 'Research CSV/PDF export requirements.', 0, NULL);

COMMIT;