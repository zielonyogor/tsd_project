import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, type ParamMap } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import type { Sprint, SprintStatus } from '../../../types/sprint';
import { USER_STORY_STATUSES, UserStoryStatus, type UserStory } from '../../../types/userStory';
import { UserStoryCard } from './components/user-story-card/user-story-card';
import { ProgressBar } from './components/progress-bar/progress-bar';
import { SprintService } from './../../services/sprint.service';
import { RealtimeSprintService } from './../../services/realtime-sprint.service';
import type { User } from '../../../types/user';
import { getCurrentUser } from '../../data/user-storage';

@Component({
  selector: 'app-board',
  templateUrl: './board.html',
  styleUrl: './board.scss',
  imports: [DatePipe, FormsModule, UserStoryCard, ProgressBar],
})
export class Board implements OnInit, OnDestroy {
  protected currentUser: User | null = null;
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
  protected isFinishingSprint = false;
  protected finishSprintError = '';

  protected confirmDeletingStoryId: string | null = null;
  protected confirmDeletingStoryTitle = '';
  protected isDeletingStory = false;
  protected deleteStoryError = '';

  public sprint: Sprint | null = null;
  protected userStories: UserStory[] = [];
  private editingStoryId: string | null = null;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly service = inject(SprintService);
  private readonly realtime = inject(RealtimeSprintService);
  private readonly realtimeSubscriptions = new Subscription();

  ngOnInit(): void {
    this.currentUser = getCurrentUser();
    if (!this.currentUser) {
      void this.router.navigate(['/login']);
      return;
    }

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const boardId = paramMap.get('id');
      if (!boardId) {
        void this.router.navigate(['/']);
        return;
      }

      void this.loadBoard(boardId);
    });

    this.subscribeToRealtimeUpdates();
  }

  ngOnDestroy(): void {
    this.realtimeSubscriptions.unsubscribe();
    void this.realtime.leaveSprint();
  }

  private subscribeToRealtimeUpdates(): void {
    this.realtimeSubscriptions.add(
      this.realtime.onUserStoryCreated.subscribe((story: UserStory) => {
        if (!this.sprint || story.sprintId !== this.sprint.id) {
          return;
        }
        if (this.userStories.some(existing => existing.id === story.id)) {
          return;
        }
        this.userStories = [...this.userStories, story];
        this.cdr.markForCheck();
      }),
    );

    this.realtimeSubscriptions.add(
      this.realtime.onUserStoryUpdated.subscribe((story: UserStory) => {
        if (!this.sprint || story.sprintId !== this.sprint.id) {
          return;
        }
        const existing = this.userStories.find(item => item.id === story.id);
        if (!existing) {
          this.userStories = [...this.userStories, story];
        } else {
          existing.title = story.title;
          existing.description = story.description;
          existing.status = story.status;
        }
        this.cdr.markForCheck();
      }),
    );

    this.realtimeSubscriptions.add(
      this.realtime.onSprintUpdated.subscribe((updated: Sprint) => {
        if (!this.sprint || updated.id !== this.sprint.id) {
          return;
        }
        this.sprint = { ...this.sprint, ...updated };
        this.cdr.markForCheck();
      }),
    );
  }

  protected get joinUrl(): string {
    if (!this.sprint?.joinCode) {
      return '';
    }

    return `${globalThis.location.origin}/join/${this.sprint.joinCode}`;
  }

  protected sprintStatusLabel(status: SprintStatus): string {
    return status === 'InProgress' ? 'In progress' : status;
  }

  protected async finishSprint(): Promise<void> {
    if (!this.sprint || this.sprint.status === 'Done' || this.isFinishingSprint) {
      return;
    }

    this.finishSprintError = '';
    this.isFinishingSprint = true;

    try {
      this.sprint = await this.service.finishSprint(this.sprint.id);
    } catch {
      this.finishSprintError = 'Failed to finish sprint. Please try again.';
    } finally {
      this.isFinishingSprint = false;
      this.cdr.markForCheck();
    }
  }

  public getUserStoriesForColumn(status: UserStoryStatus): UserStory[] {
    return this.userStories.filter(story => story.status === status);
  }

  protected onOpenStory(story: UserStory): void {
    if (this.sprint?.status === 'Done') {
      return;
    }

    this.startEditingStory(story);
  }

  protected onAddStory(): void {
    if (this.sprint?.status === 'Done') {
      return;
    }

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

        if (!this.userStories.some(existing => existing.id === createdStory.id)) {
          this.userStories.push(createdStory);
        }

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
    if (this.sprint?.status === 'Done') {
      return;
    }

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
      const sprint = await this.service.getSprintForUser(boardId, this.currentUser!.id);
      this.sprint = sprint;
      this.userStories = await this.service.getStories(boardId);
      this.cdr.markForCheck();
      try {
        await this.realtime.joinSprint(sprint.id);
      } catch {
        // realtime is best-effort; manual refresh still works
      }
    } catch {
      this.loadError = 'Could not load sprint board from backend.';
      this.sprint = null;
      this.userStories = [];
      void this.router.navigate(['/']);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

    protected askDeleteStory(story: UserStory): void {
    this.confirmDeletingStoryId = story.id;
    this.confirmDeletingStoryTitle = story.title;
    this.deleteStoryError = '';
  }

  protected cancelDeleteStory(): void {
    this.confirmDeletingStoryId = null;
    this.confirmDeletingStoryTitle = '';
    this.deleteStoryError = '';
  }

  protected onDeleteStoryBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancelDeleteStory();
    }
  }

  protected async confirmDeleteStory(): Promise<void> {
    if (!this.confirmDeletingStoryId) {
      return;
    }

    this.isDeletingStory = true;
    this.deleteStoryError = '';

    try {
      await this.service.deleteUserStory(this.confirmDeletingStoryId);
      this.userStories = this.userStories.filter(story => story.id !== this.confirmDeletingStoryId);
      this.cancelDeleteStory();
    } catch {
      this.deleteStoryError = 'Failed to delete user story. Please try again.';
    } finally {
      this.isDeletingStory = false;
      this.cdr.markForCheck();
    }
  }
}
