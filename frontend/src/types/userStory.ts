export const USER_STORY_STATUSES = ['To Do', 'Blocked','In Progress', 'Code Review', 'Done'] as const;

export type UserStoryStatus = (typeof USER_STORY_STATUSES)[number];

export enum BackendUserStoryStatus {
    ToDo = 'ToDo',
    InProgress = 'InProgress',
    CodeReview = 'CodeReview',
    Blocked = 'Blocked',
    Done = 'Done',
}

export const BACKEND_STATUS_ALIASES: Record<string, BackendUserStoryStatus> = {
  todo: BackendUserStoryStatus.ToDo,
  inprogress: BackendUserStoryStatus.InProgress,
  codereview: BackendUserStoryStatus.CodeReview,
  blocked: BackendUserStoryStatus.Blocked,
  done: BackendUserStoryStatus.Done,
};

export const BACKEND_TO_UI_STATUS: Record<BackendUserStoryStatus, UserStoryStatus> = {
  [BackendUserStoryStatus.ToDo]: 'To Do',
  [BackendUserStoryStatus.InProgress]: 'In Progress',
  [BackendUserStoryStatus.CodeReview]: 'Code Review',
  [BackendUserStoryStatus.Blocked]: 'Blocked',
  [BackendUserStoryStatus.Done]: 'Done',
};

export const UI_TO_BACKEND_STATUS: Record<UserStoryStatus, BackendUserStoryStatus> = {
  'To Do': BackendUserStoryStatus.ToDo,
  'In Progress': BackendUserStoryStatus.InProgress,
  'Code Review': BackendUserStoryStatus.CodeReview,
  'Blocked': BackendUserStoryStatus.Blocked,
  'Done': BackendUserStoryStatus.Done,
};

export interface UserStory {
    id: string;
    title: string;
    description: string;
    status: UserStoryStatus;
    sprintId: string;
}

export interface UserStoryApiResponse {
    id: number | string;
    title: string;
    description: string;
    status: BackendUserStoryStatus | string;
    sprintId: number | string | null;
}