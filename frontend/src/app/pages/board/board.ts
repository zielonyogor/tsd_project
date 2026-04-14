import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, type ParamMap } from '@angular/router';
import { FormsModule } from '@angular/forms';
import type { Sprint } from '../../../types/sprint';
import { USER_STORY_STATUSES, UserStoryStatus, type UserStory } from '../../../types/userStory';
import { UserStoryCard } from './components/user-story-card/user-story-card';
import { FAKE_SPRINT_BOARDS } from '../../data/fake-sprint-boards';

@Component({
  selector: 'app-board',
  templateUrl: './board.html',
  styleUrl: './board.scss',
  imports: [DatePipe, FormsModule, UserStoryCard],
})
export class Board implements OnInit {
  protected readonly columns = USER_STORY_STATUSES;
  protected readonly newStoryForm = {
    title: '',
    description: '',
    status: USER_STORY_STATUSES[0] as UserStoryStatus,
  };
  protected readonly editStoryForm = {
    title: '',
    description: '',
    status: USER_STORY_STATUSES[0] as UserStoryStatus,
  };
  protected isCreatingStory = false;
  protected isEditingStory = false;
  protected createStoryError = '';
  protected editStoryError = '';

  public sprint!: Sprint;
  private userStories: UserStory[] = [];
  private editingStoryId: string | null = null;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
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
    this.startEditingStory(story);
  }

  protected onAddStory(): void {
    this.isCreatingStory = true;
    this.createStoryError = '';
    this.newStoryForm.title = '';
    this.newStoryForm.description = '';
    this.newStoryForm.status = USER_STORY_STATUSES[0];
  }

  protected cancelStoryCreation(): void {
    this.isCreatingStory = false;
    this.createStoryError = '';
  }

  protected cancelStoryEditing(): void {
    this.isEditingStory = false;
    this.editingStoryId = null;
    this.editStoryError = '';
  }

  protected onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cancelStoryCreation();
      this.cancelStoryEditing();
    }
  }

  protected createStory(): void {
    const title = this.newStoryForm.title.trim();
    const description = this.newStoryForm.description.trim();

    if (!title || !description) {
      this.createStoryError = 'Please provide user story title and description.';
      return;
    }

    const story: UserStory = {
      id: this.getNextStoryId(),
      title,
      description,
      status: this.newStoryForm.status,
      sprintId: this.sprint.id,
    };

    this.userStories.push(story);
    this.createStoryError = '';
    this.isCreatingStory = false;
  }

  protected saveStory(): void {
    if (!this.editingStoryId) {
      return;
    }

    const title = this.editStoryForm.title.trim();
    const description = this.editStoryForm.description.trim();

    if (!title || !description) {
      this.editStoryError = 'Please provide user story title and description.';
      return;
    }

    const story = this.userStories.find(item => item.id === this.editingStoryId);

    if (!story) {
      this.cancelStoryEditing();
      return;
    }

    story.title = title;
    story.description = description;
    story.status = this.editStoryForm.status;

    this.editStoryError = '';
    this.cancelStoryEditing();
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

  private getNextStoryId(): string {
    let maxId = 0;

    for (const board of Object.values(FAKE_SPRINT_BOARDS)) {
      for (const story of board.userStories) {
        const numericId = Number.parseInt(story.id, 10);

        if (!Number.isNaN(numericId) && numericId > maxId) {
          maxId = numericId;
        }
      }
    }

    return String(maxId + 1);
  }

  private startEditingStory(story: UserStory): void {
    this.editingStoryId = story.id;
    this.editStoryForm.title = story.title;
    this.editStoryForm.description = story.description;
    this.editStoryForm.status = story.status;
    this.editStoryError = '';
    this.isEditingStory = true;
  }
}
