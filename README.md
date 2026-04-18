# Sprint Goal & Progress Tracking Web Application

## Getting started

To run the application, run docker compose in root directory:

```bash
docker-compose up
```

## Database models

The backend uses PostgreSQL with two main tables:

1. `Sprints`
	- `Id` (int, PK)
	- `Name` (text, required)
	- `StartDate` (timestamp with time zone)
	- `EndDate` (timestamp with time zone)

2. `UserStories`
	- `Id` (int, PK)
	- `Title` (text, required)
	- `Description` (text, required)
	- `Status` (int enum)
	- `SprintId` (int, nullable FK -> `Sprints.Id`)

`Status` values map to backend enum `UserStoryStatus`:

- `0` = `ToDo`
- `1` = `Blocked`
- `2` = `InProgress`
- `3` = `CodeReview`
- `4` = `Done`

## Populate database

A seed script is available at [db/seed.sql](db/seed.sql).

1. Start containers:

```bash
docker-compose up -d
```

2. Apply migrations (if needed):

```bash
cd backend
dotnet ef database update
cd ..
```

3. Populate database with sample data:

```bash
docker-compose exec -T db psql -U postgres -d mydb < db/seed.sql
```

The script is repeatable and first clears `UserStories` and `Sprints` before inserting fresh sample data.
