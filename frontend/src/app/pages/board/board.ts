import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import type { Sprint } from '../../../types/sprint';
import { USER_STORY_STATUSES, UserStoryStatus, type UserStory } from '../../../types/userStory';
import { UserStoryCard } from './components/user-story-card/user-story-card';
import { FAKE_SPRINT_BOARDS } from '../../data/fake-sprint-boards';

@Component({
  selector: 'app-board',
  templateUrl: './board.html',
  styleUrl: './board.scss',
  imports: [DatePipe, UserStoryCard],
})
export class Board implements OnInit {
  protected readonly columns = USER_STORY_STATUSES;

  public sprint!: Sprint;
  private userStories: UserStory[] = [];

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public isProgressOpen = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      const boardId = paramMap.get('id');

      if (!boardId || !this.loadBoard(boardId)) {
        void this.router.navigate(['/']);
      }
    });
  }

  public getUserStoriesForColumn(status: UserStoryStatus): UserStory[] {
    return this.userStories.filter(story => story.status === status);
  }

  protected onOpenStory(story: UserStory): void {
    // Open user story modal here
    console.log('Open user story', story.id);
  }

  protected onAddStory(): void {
    // Open add user story modal here
    console.log('Add new user story to sprint', this.sprint.id);
  }

  private loadBoard(boardId: string): boolean {
    const boardData = FAKE_SPRINT_BOARDS[boardId];

    if (!boardData) {
      return false;
    }

    this.sprint = boardData.sprint;
    this.userStories = boardData.userStories;

    return true;
  }

  public toggleProgressDisplay(): void {
    this.isProgressOpen = (!this.isProgressOpen) && (this.userStories.length > 0);
  }

  public getStatusProgress() {
    const total = this.userStories.length || 1;
    return this.columns.map(status => {
      const count = this.userStories.filter(story => story.status === status).length;
      return {
        status,
        count,
        color: this.getColorForStatus(status),
        width: (count / total) * 100
      };
    }).filter(itm => itm.count > 0);
  }

  private getColorForStatus(status: string) {
    switch(status) {
      case "To Do":
        return "#757575";
      case "Blocked":
        return "#f44336";
      case "In Progress":
        return "#2196f3";
      case "Code Review":
        return "#ff9800";
      case "Done":
        return "#4caf50";
      default:
        return "#202020";
    }
  }

  public getUserStoriesProgress(): number[] {
    return this.columns.map(status => this.userStories.filter(story => story.status === status).length);
  }

  public getProgressPercentage(): number {
    const counts = this.getUserStoriesProgress();
    const idx = USER_STORY_STATUSES.indexOf("Done");
    
    if (idx === -1 || this.userStories.length === 0) {
      return 0;
    }

    return 100 * counts[idx] / this.userStories.length;
  }
}
