import type { Sprint, SprintApiResponse, SprintSessionApiResponse } from '../../types/sprint';
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

function resolveBackendUrls(): string[] {
  const origin = globalThis.location?.origin;

  if (!origin) {
    return ['http://localhost:8080', 'http://localhost:5036'];
  }

  const url = new URL(origin);

  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    if (url.port === '5036') {
      return [`${url.protocol}//${url.hostname}:5036`, `${url.protocol}//${url.hostname}:8080`];
    }

    return [`${url.protocol}//${url.hostname}:8080`, `${url.protocol}//${url.hostname}:5036`];
  }

  return ['http://localhost:8080'];
}

const backendUrls = resolveBackendUrls();
const sessionTokenKey = 'sprint-session-token';

function isRetryableNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

function getSessionToken(): string | null {
  return globalThis.localStorage?.getItem(sessionTokenKey) ?? null;
}

function setSessionToken(token: string): void {
  globalThis.localStorage?.setItem(sessionTokenKey, token);
}

function authHeaders(init?: HeadersInit): HeadersInit {
  const headers = new Headers(init);
  const token = getSessionToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  for (const backendUrl of backendUrls) {
    try {
      const response = await fetch(`${backendUrl}${path}`, init);

      if (!response.ok) {
        throw new Error(`Request failed for ${path}: ${response.status} ${response.statusText}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (!isRetryableNetworkError(error)) {
        throw error;
      }
    }
  }

  throw new Error(`Unable to reach backend for ${path}`);
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
    sessionCode: dto.sessionCode,
  };
}

function toSprintSession(dto: SprintSessionApiResponse): { sprint: Sprint; accessToken: string; joinUrl: string } {
  return {
    sprint: toSprint(dto.sprint),
    accessToken: dto.accessToken,
    joinUrl: new URL(dto.joinUrl, backendUrls[0]).toString(),
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
  const stories = await fetchJson<UserStoryApiResponse[]>(`/UserStory/${sprintId}`, {
    headers: authHeaders(),
  });
  return stories.map(toUserStory);
}

export async function createSprintFromBackend(sprint: Sprint): Promise<{ sprint: Sprint; accessToken: string; joinUrl: string }> {
  for (const backendUrl of backendUrls) {
    try {
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
        throw new Error(`Failed to create sprint session: ${response.status} ${response.statusText}`);
      }

      const created = (await response.json()) as SprintSessionApiResponse;
      const session = toSprintSession(created);
      setSessionToken(session.accessToken);
      return session;
    } catch (error) {
      if (!isRetryableNetworkError(error)) {
        throw error;
      }
    }
  }

  throw new Error('Failed to create sprint session');
}

export async function joinSprintSessionFromBackend(sessionCode: string): Promise<{ sprint: Sprint; accessToken: string; joinUrl: string }> {
  for (const backendUrl of backendUrls) {
    try {
      const response = await fetch(`${backendUrl}/Sprint/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionCode }),
      });

      if (!response.ok) {
        throw new Error(`Failed to join sprint session: ${response.status} ${response.statusText}`);
      }

      const joined = (await response.json()) as SprintSessionApiResponse;
      const session = toSprintSession(joined);
      setSessionToken(session.accessToken);
      return session;
    } catch (error) {
      if (!isRetryableNetworkError(error)) {
        throw error;
      }
    }
  }

  throw new Error('Failed to join sprint session');
}

export async function updateSprintFromBackend(sprint: Sprint): Promise<Sprint> {
  for (const backendUrl of backendUrls) {
    try {
      const response = await fetch(`${backendUrl}/Sprint/${sprint.id}`, {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
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
    } catch (error) {
      if (!isRetryableNetworkError(error)) {
        throw error;
      }
    }
  }

  throw new Error('Failed to update sprint');
}

export async function createUserStoryFromBackend(story: UserStory): Promise<UserStory> {
  for (const backendUrl of backendUrls) {
    try {
      const response = await fetch(`${backendUrl}/UserStory`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
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
    } catch (error) {
      if (!isRetryableNetworkError(error)) {
        throw error;
      }
    }
  }

  throw new Error('Failed to create user story');
}

export async function updateUserStoryFromBackend(story: UserStory): Promise<void> {
  for (const backendUrl of backendUrls) {
    try {
      const response = await fetch(`${backendUrl}/UserStory/${story.id}`, {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
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

      return;
    } catch (error) {
      if (!isRetryableNetworkError(error)) {
        throw error;
      }
    }
  }

  throw new Error('Failed to update user story');
}
