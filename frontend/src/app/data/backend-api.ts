import type { Sprint, SprintApiResponse } from '../../types/sprint';
import {
    BACKEND_STATUS_ALIASES,
    BACKEND_TO_UI_STATUS,
    BackendUserStoryStatus,
    UI_TO_BACKEND_STATUS,
    USER_STORY_STATUSES,
    type UserStory,
    type UserStoryApiResponse,
    type UserStoryStatus,
} from '../../types/userStory';

const backendUrl = (globalThis.location?.origin?.replace(':3000', ':8080') ?? 'http://localhost:8080').replace(/\/$/, '');

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${backendUrl}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function toUserStoryStatus(status: BackendUserStoryStatus | string): UserStoryStatus {
  const normalized = status.replace(/\s+/g, '').toLowerCase();
  const backendStatus = BACKEND_STATUS_ALIASES[normalized];

  return backendStatus ? BACKEND_TO_UI_STATUS[backendStatus] : USER_STORY_STATUSES[0];
}

function toSprint(dto: SprintApiResponse): Sprint {
  return {
    id: String(dto.id),
    goal: dto.name ?? 'Untitled sprint',
    startDate: new Date(dto.startDate),
    endDate: new Date(dto.endDate),
  };
}

function toUserStory(dto: UserStoryApiResponse): UserStory {
  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description,
    status: toUserStoryStatus(dto.status),
    sprintId: dto.sprintId === null ? '' : String(dto.sprintId),
  };
}

export async function getSprintsFromBackend(): Promise<Sprint[]> {
  const sprints = await fetchJson<SprintApiResponse[]>('/Sprint');
  return sprints.map(toSprint);
}

export async function getUserStoriesBySprintFromBackend(sprintId: string): Promise<UserStory[]> {
  const stories = await fetchJson<UserStoryApiResponse[]>(`/UserStory/${sprintId}`);
  return stories.map(toUserStory);
}

export async function createSprintFromBackend(sprint: Sprint): Promise<Sprint> {
  const response = await fetch(`${backendUrl}/Sprint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: sprint.goal,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create sprint: ${response.status} ${response.statusText}`);
  }

  const created = (await response.json()) as SprintApiResponse;
  return toSprint(created);
}

export async function updateSprintFromBackend(sprint: Sprint): Promise<Sprint> {
  const response = await fetch(`${backendUrl}/Sprint/${sprint.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: sprint.goal,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update sprint: ${response.status} ${response.statusText}`);
  }

  const updated = (await response.json()) as SprintApiResponse;
  return toSprint(updated);
}

export async function createUserStoryFromBackend(story: UserStory): Promise<UserStory> {
  const response = await fetch(`${backendUrl}/UserStory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: story.title,
      description: story.description,
      status: UI_TO_BACKEND_STATUS[story.status],
      sprintId: story.sprintId ? Number(story.sprintId) : null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create user story: ${response.status} ${response.statusText}`);
  }

  const created = (await response.json()) as UserStoryApiResponse;
  return toUserStory(created);
}

export async function updateUserStoryFromBackend(story: UserStory): Promise<void> {
  const response = await fetch(`${backendUrl}/UserStory/${story.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: story.title,
      description: story.description,
      status: UI_TO_BACKEND_STATUS[story.status],
      sprintId: story.sprintId ? Number(story.sprintId) : null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user story: ${response.status} ${response.statusText}`);
  }
}
