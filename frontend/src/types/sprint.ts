export interface Sprint {
  id: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  sessionCode: string;
}

export interface SprintApiResponse {
  id: number | string;
  name?: string;
  startDate: string;
  endDate: string;
  sessionCode: string;
}

export interface SprintSessionApiResponse {
  sprint: SprintApiResponse;
  accessToken: string;
  joinUrl: string;
}
