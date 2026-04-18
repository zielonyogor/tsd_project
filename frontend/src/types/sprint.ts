export interface Sprint {
  id: string;
  goal: string;
  startDate: Date;
  endDate: Date;
}

export interface SprintApiResponse {
  id: number | string;
  name?: string;
  startDate: string;
  endDate: string;
}
