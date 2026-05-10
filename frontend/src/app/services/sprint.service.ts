import { Injectable } from '@angular/core';
import * as api from '../data/backend-api';
import { Sprint } from '../../types/sprint';
import { UserStory } from '../../types/userStory';

@Injectable({ providedIn: 'root' })
export class SprintService {
    getSprints() { return api.getSprintsFromBackend(); }
    getStories(id: string) { return api.getUserStoriesBySprintFromBackend(id); }
    createSprint(sprint: Sprint) {
        return api.createSprintFromBackend(sprint);
    }
    updateSprint(sprint: Sprint) { return api.updateSprintFromBackend(sprint); }
    createUserStory(story: UserStory) {
        return api.createUserStoryFromBackend(story);
    }
    updateUserStory(story: UserStory) {
        return api.updateUserStoryFromBackend(story);
    }
}