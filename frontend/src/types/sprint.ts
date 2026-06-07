export const SPRINT_STATUSES = ['Upcoming', 'InProgress', 'Done'] as const;

export type SprintStatus = (typeof SPRINT_STATUSES)[number];

export interface Sprint {
  id: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
  joinCode?: string;
}

export interface SprintApiResponse {
  id: number | string;
  name?: string;
  startDate: string;
  endDate: string;
  status?: SprintStatus | string;
  joinCode?: string;
}
