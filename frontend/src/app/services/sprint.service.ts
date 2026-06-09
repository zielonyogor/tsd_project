import { Injectable } from '@angular/core';
import * as api from '../data/backend-api';
import { Sprint, type SprintStatus } from '../../types/sprint';
import { UserStory } from '../../types/userStory';

@Injectable({ providedIn: 'root' })
export class SprintService {
    getSprints() { return api.getSprintsFromBackend(); }
    getSprintsForUser(userId: number) { return api.getSprintsForUserFromBackend(userId); }
    getSprintForUser(sprintId: string, userId: number) { return api.getSprintForUserFromBackend(sprintId, userId); }
    getStories(id: string) { return api.getUserStoriesBySprintFromBackend(id); }
    createSprint(sprint: Sprint, creatorUserId: number) { return api.createSprintFromBackend(sprint, creatorUserId); }
    updateSprint(sprint: Sprint) { return api.updateSprintFromBackend(sprint); }
    updateSprintStatus(sprintId: string, status: SprintStatus) { return api.updateSprintStatusFromBackend(sprintId, status); }
    finishSprint(sprintId: string) { return api.finishSprintFromBackend(sprintId); }
    createUserStory(story: UserStory) {
        return api.createUserStoryFromBackend(story);
    }
    updateUserStory(story: UserStory) {
        return api.updateUserStoryFromBackend(story);
    }
    joinSprint(joinCode: string, userId: number) { return api.joinSprintFromBackend(joinCode, userId); }
    
    deleteSprint(sprintId: string) {
        return api.deleteSprintFromBackend(sprintId);
    }

    deleteUserStory(userStoryId: string) {
        return api.deleteUserStoryFromBackend(userStoryId);
    }
}