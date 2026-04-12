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
}
