import { inject, Injectable, NgZone } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
// @ts-expect-error: missing rxjs types
import { Observable, Subject } from 'rxjs';
import {
  BACKEND_STATUS_ALIASES,
  BACKEND_TO_UI_STATUS,
  BackendUserStoryStatus,
  USER_STORY_STATUSES,
  type UserStory,
  type UserStoryApiResponse,
  type UserStoryStatus,
} from '../../types/userStory';
import type { Sprint, SprintApiResponse, SprintStatus } from '../../types/sprint';

const backendUrl = (globalThis.location?.origin?.replace(':3000', ':8080') ?? 'http://localhost:8080').replace(/\/$/, '');

function toUserStoryStatus(status: BackendUserStoryStatus | string): UserStoryStatus {
  const normalized = String(status).replace(/\s+/g, '').toLowerCase();
  const backendStatus = BACKEND_STATUS_ALIASES[normalized];
  return backendStatus ? BACKEND_TO_UI_STATUS[backendStatus] : USER_STORY_STATUSES[0];
}

function toUserStory(dto: UserStoryApiResponse): UserStory {
  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description,
    status: toUserStoryStatus(dto.status),
    sprintId: dto.sprintId === null || dto.sprintId === undefined ? '' : String(dto.sprintId),
  };
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

@Injectable({ providedIn: 'root' })
export class RealtimeSprintService {
  private connection: HubConnection | null = null;
  private currentSprintId: string | null = null;
  private readonly userStoryCreated$ = new Subject<UserStory>();
  private readonly userStoryUpdated$ = new Subject<UserStory>();
  private readonly sprintUpdated$ = new Subject<Sprint>();

  private readonly zone = inject(NgZone);

  public get onUserStoryCreated(): Observable<UserStory> {
    return this.userStoryCreated$.asObservable();
  }

  public get onUserStoryUpdated(): Observable<UserStory> {
    return this.userStoryUpdated$.asObservable();
  }

  public get onSprintUpdated(): Observable<Sprint> {
    return this.sprintUpdated$.asObservable();
  }

  public async joinSprint(sprintId: string): Promise<void> {
    if (this.currentSprintId === sprintId && this.connection?.state === HubConnectionState.Connected) {
      return;
    }

    await this.ensureConnection();
    if (this.currentSprintId && this.currentSprintId !== sprintId) {
      try {
        await this.connection!.invoke('LeaveSprint', Number(this.currentSprintId));
      } catch {
        // ignore — server may already be gone or group not joined
      }
    }
    this.currentSprintId = sprintId;
    await this.connection!.invoke('JoinSprint', Number(sprintId));
  }

  public async leaveSprint(): Promise<void> {
    if (!this.connection || !this.currentSprintId) {
      return;
    }
    try {
      await this.connection.invoke('LeaveSprint', Number(this.currentSprintId));
    } catch {
      // ignore
    }
    this.currentSprintId = null;
  }

  private async ensureConnection(): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      return;
    }

    if (!this.connection) {
      this.connection = new HubConnectionBuilder()
        .withUrl(`${backendUrl}/hubs/sprint`)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build();

      this.connection.on('userStoryCreated', (dto: UserStoryApiResponse) => {
        this.zone.run(() => this.userStoryCreated$.next(toUserStory(dto)));
      });
      this.connection.on('userStoryUpdated', (dto: UserStoryApiResponse) => {
        this.zone.run(() => this.userStoryUpdated$.next(toUserStory(dto)));
      });
      this.connection.on('sprintUpdated', (dto: SprintApiResponse) => {
        this.zone.run(() => this.sprintUpdated$.next(toSprint(dto)));
      });

      this.connection.onreconnected(async () => {
        if (this.currentSprintId) {
          try {
            await this.connection!.invoke('JoinSprint', Number(this.currentSprintId));
          } catch {
            // ignore — next user action will retry
          }
        }
      });
    }

    if (this.connection.state === HubConnectionState.Disconnected) {
      await this.connection.start();
    }
  }
}
