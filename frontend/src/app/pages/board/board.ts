import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Sprint } from '../../../types/sprint';
import { UserStory } from '../../../types/userStory';

@Component({
  selector: 'app-board',
  templateUrl: './board.html',
  styleUrl: './board.scss',
  imports: [DatePipe],
})
export class Board {
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
    }
  ]

  protected getUserStoriesForColumn(status: 'To Do' | 'In Progress' | 'Done'): UserStory[] {
    return this.userStories.filter(story => story.status === status);
  }
}
