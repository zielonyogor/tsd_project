import type { Sprint, SprintApiResponse, SprintStatus } from '../../types/sprint';
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
  const now = new Date();
  const startDate = new Date(dto.startDate);
  const endDate = new Date(dto.endDate);
  const resolvedStatus: SprintStatus = normalizeSprintStatus(dto.status)
    ?? (endDate < now ? 'Done' : startDate <= now ? 'InProgress' : 'Upcoming');

  return {
    id: String(dto.id),
    goal: dto.name ?? 'Untitled sprint',
    startDate,
    endDate,
    status: resolvedStatus,
    joinCode: dto.joinCode ?? undefined,
  };
}

function normalizeSprintStatus(status: SprintApiResponse['status']): SprintStatus | null {
  const normalized = String(status ?? '').replace(/[-_\s]+/g, '').toLowerCase();

  if (normalized === 'upcoming') {
    return 'Upcoming';
  }

  if (normalized === 'inprogress') {
    return 'InProgress';
  }

  if (normalized === 'done') {
    return 'Done';
  }

  return null;
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

export async function createSprintFromBackend(sprint: Sprint, creatorUserId: number): Promise<Sprint> {
  const response = await fetch(`${backendUrl}/Sprint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: sprint.goal,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      status: sprint.status,
      creatorUserId: creatorUserId,
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
      status: sprint.status,
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

export async function joinSprintFromBackend(joinCode: string, userId: number): Promise<Sprint> {
  const response = await fetch(`${backendUrl}/SprintUser/Sprint/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ joinCode, userId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to join sprint: ${response.status} ${response.statusText}`);
  }

  const result = await response.json() as { Sprint?: SprintApiResponse; sprint?: SprintApiResponse };
  const sprintDto = result.Sprint ?? result.sprint;
  if (!sprintDto) {
    throw new Error('Invalid join response from backend');
  }

  return toSprint(sprintDto);
}

export async function deleteSprintFromBackend(sprintId: string): Promise<void> {
  const response = await fetch(`${backendUrl}/Sprint/${sprintId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete sprint: ${response.status} ${response.statusText}`);
  }
}

export async function deleteUserStoryFromBackend(storyId: string): Promise<void> {
  const response = await fetch(`${backendUrl}/UserStory/${storyId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete user story: ${response.status} ${response.statusText}`);
  }
}

export interface UserApiResponse {
  id: number;
  name: string;
}

export async function loginUserFromBackend(name: string, password: string): Promise<UserApiResponse> {
  const response = await fetch(`${backendUrl}/SprintUser/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  });

  if (!response.ok) {
    throw new Error(`Failed to log in: ${(await response.text()).toString()}`);
  }

  return response.json() as Promise<UserApiResponse>;
}

export async function registerUserFromBackend(name: string, password: string): Promise<UserApiResponse> {
  const response = await fetch(`${backendUrl}/SprintUser/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  });

  if (!response.ok) {
    throw new Error(`Failed to register: ${(await response.text()).toString()}`);
  }

  return response.json() as Promise<UserApiResponse>;
}

export async function getSprintsForUserFromBackend(userId: number): Promise<Sprint[]> {
  const sprints = await fetchJson<SprintApiResponse[]>(`/Sprint/user/${userId}`);
  return sprints.map(toSprint);
}

export async function getSprintForUserFromBackend(sprintId: string, userId: number): Promise<Sprint> {
  const sprint = await fetchJson<SprintApiResponse>(`/Sprint/${sprintId}/user/${userId}`);
  return toSprint(sprint);
}

export async function updateSprintStatusFromBackend(sprintId: string, status: SprintStatus): Promise<Sprint> {
  const response = await fetch(`${backendUrl}/Sprint/${sprintId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update sprint status: ${response.status} ${response.statusText}`);
  }

  const updated = (await response.json()) as SprintApiResponse;
  return toSprint(updated);
}

export async function finishSprintFromBackend(sprintId: string): Promise<Sprint> {
  const response = await fetch(`${backendUrl}/Sprint/${sprintId}/finish`, {
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error(`Failed to finish sprint: ${response.status} ${response.statusText}`);
  }

  const updated = (await response.json()) as SprintApiResponse;
  return toSprint(updated);
}
