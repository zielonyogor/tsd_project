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

export interface Sprint {
  id: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  joinCode?: string;
}

export interface SprintApiResponse {
  id: number | string;
  name?: string;
  startDate: string;
  endDate: string;
  joinCode?: string;
}
