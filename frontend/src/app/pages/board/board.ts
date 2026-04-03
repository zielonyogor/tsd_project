import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Sprint } from '../../../types/sprint';
import { USER_STORY_STATUSES, UserStoryStatus, type UserStory } from '../../../types/userStory';
import { UserStoryCard } from './components/user-story-card/user-story-card';

@Component({
  selector: 'app-board',
  templateUrl: './board.html',
  styleUrl: './board.scss',
  imports: [DatePipe, UserStoryCard],
})
export class Board {
  protected readonly columns = USER_STORY_STATUSES;

  protected readonly sprint: Sprint = {
      id: '1',
      goal: 'Make MVP',
      startDate: new Date(2026, 1, 1),
      endDate: new Date(2026, 1, 22)
    };

  private readonly userStories: UserStory[] = [
    {
      id: '1',
      title: 'User Story 1',
      description: 'Description for User Story 1',
      status: 'To Do',
      sprintId: '1'
    },
    {
      id: '2',
      title: 'User Story 2',
      description: 'Description for User Story 2',
      status: 'In Progress',
      sprintId: '1'
    },
    {
      id: '3',
      title: 'User Story 3',
      description: 'Description for User Story 3. But this time this is a bit longer of a description heh',
      status: 'Code Review',
      sprintId: '1'
    }
  ];

  protected getUserStoriesForColumn(status: UserStoryStatus): UserStory[] {
    return this.userStories.filter(story => story.status === status);
  }

  protected onOpenStory(story: UserStory): void {
    // Open user story modal here
    console.log('Open user story', story.id);
  }
}
