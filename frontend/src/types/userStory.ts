export const USER_STORY_STATUSES = ['To Do', 'Blocked','In Progress', 'Code Review', 'Done'] as const;

export type UserStoryStatus = (typeof USER_STORY_STATUSES)[number];

export interface UserStory {
    id: string;
    title: string;
    description: string;
    status: UserStoryStatus;
    sprintId: string;
}