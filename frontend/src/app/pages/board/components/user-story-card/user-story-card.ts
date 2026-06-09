import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { UserStory } from '../../../../../types/userStory';

@Component({
  selector: 'app-user-story-card',
  templateUrl: './user-story-card.html',
  styleUrl: './user-story-card.scss',
})
export class UserStoryCard {
  @Input({ required: true }) story!: UserStory;

  @Output() readonly openStory = new EventEmitter<UserStory>();
  @Output() readonly deleteStory = new EventEmitter<UserStory>();

  protected onOpenStory(): void {
    this.openStory.emit(this.story);
  }

  protected onDeleteStory(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteStory.emit(this.story);
  }
}