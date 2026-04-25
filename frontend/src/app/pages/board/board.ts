import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, type ParamMap } from '@angular/router';
import { FormsModule } from '@angular/forms';
import type { Sprint } from '../../../types/sprint';
import { USER_STORY_STATUSES, UserStoryStatus, type UserStory } from '../../../types/userStory';
import { UserStoryCard } from './components/user-story-card/user-story-card';
import { ProgressBar } from './components/progress-bar/progress-bar';
import { SprintService } from './../../services/sprint.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.html',
  styleUrl: './board.scss',
  imports: [DatePipe, FormsModule, UserStoryCard, ProgressBar],
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
  protected isLoading = false;
  protected loadError = '';

  public sprint: Sprint | null = null;
  protected userStories: UserStory[] = [];
  private editingStoryId: string | null = null;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly service = inject(SprintService);

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const boardId = paramMap.get('id');

      if (!boardId) {
        void this.router.navigate(['/']);
        return;
      }

      void this.loadBoard(boardId);
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
      id: '',
      title,
      description,
      status: this.newStoryForm.status,
      sprintId: this.sprint?.id ?? '',
    };

    void (async () => {
      try {
        const createdStory = await this.service.createUserStory(story);
        this.userStories.push(createdStory);
        this.createStoryError = '';
        this.isCreatingStory = false;
        this.cdr.markForCheck();
      } catch {
        this.createStoryError = 'Failed to create user story. Please try again.';
        this.cdr.markForCheck();
      }
    })();
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

    const updated: UserStory = {
      ...story,
      title,
      description,
      status: this.editStoryForm.status,
    };

    void (async () => {
      try {
        await this.service.updateUserStory(updated);
        story.title = updated.title;
        story.description = updated.description;
        story.status = updated.status;
        this.editStoryError = '';
        this.cancelStoryEditing();
        this.cdr.markForCheck();
      } catch {
        this.editStoryError = 'Failed to save user story. Please try again.';
        this.cdr.markForCheck();
      }
    })();
  }

  private startEditingStory(story: UserStory): void {
    this.editingStoryId = story.id;
    this.editStoryForm.title = story.title;
    this.editStoryForm.description = story.description;
    this.editStoryForm.status = story.status;
    this.editStoryError = '';
    this.isEditingStory = true;
  }

  private async loadBoard(boardId: string): Promise<void> {
    this.isLoading = true;
    this.loadError = '';

    try {
      const [sprints, userStories] = await Promise.all([
        this.service.getSprints(),
        this.service.getStories(boardId),
      ]);
      const sprint = sprints.find(item => item.id === boardId);

      if (!sprint) {
        void this.router.navigate(['/']);
        return;
      }

      this.sprint = sprint;
      this.userStories = userStories;
      this.cdr.markForCheck();
    } catch {
      this.loadError = 'Could not load sprint board from backend.';
      this.sprint = null;
      this.userStories = [];
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
}
