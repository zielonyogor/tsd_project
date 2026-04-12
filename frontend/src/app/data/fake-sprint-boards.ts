import type { Sprint } from '../../types/sprint';
import type { UserStory } from '../../types/userStory';

export interface SprintBoardData {
  sprint: Sprint;
  userStories: UserStory[];
}

export const FAKE_SPRINT_BOARDS: Record<string, SprintBoardData> = {
  '1': {
    sprint: {
      id: '1',
      goal: 'Make MVP',
      startDate: new Date(2026, 1, 1),
      endDate: new Date(2026, 1, 22),
    },
    userStories: [
      {
        id: '1',
        title: 'User Story 1',
        description: 'Description for User Story 1',
        status: 'To Do',
        sprintId: '1',
      },
      {
        id: '2',
        title: 'User Story 2',
        description: 'Description for User Story 2',
        status: 'In Progress',
        sprintId: '1',
      },
      {
        id: '3',
        title: 'User Story 3',
        description: 'Description for User Story 3. But this time this is a bit longer of a description heh',
        status: 'Code Review',
        sprintId: '1',
      },
    ],
  },
  '2': {
    sprint: {
      id: '2',
      goal: 'Improve UI',
      startDate: new Date(2026, 1, 23),
      endDate: new Date(2026, 2, 5),
    },
    userStories: [
      {
        id: '4',
        title: 'User Story 4',
        description: 'Description for User Story 4',
        status: 'Blocked',
        sprintId: '2',
      },
      {
        id: '5',
        title: 'User Story 5',
        description: 'Description for User Story 5',
        status: 'To Do',
        sprintId: '2',
      },
      {
        id: '6',
        title: 'User Story 6',
        description: 'Description for User Story 6',
        status: 'Done',
        sprintId: '2',
      },
    ],
  },
};

export const FAKE_SPRINTS: Sprint[] = Object.values(FAKE_SPRINT_BOARDS).map(board => board.sprint);