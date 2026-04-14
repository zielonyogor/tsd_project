import { Component, Input } from '@angular/core';
import { UserStoryStatus, type UserStory } from '../../../../../types/userStory';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
})
export class ProgressBar {
  @Input() userStories: UserStory[] = [];
  @Input() columns: readonly UserStoryStatus[] = [];

  public isProgressOpen = false;

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
    const doneIndex = this.columns.indexOf("Done" as UserStoryStatus);
    
    if (doneIndex === -1 || this.userStories.length === 0) {
      return 0;
    }

    return 100 * counts[doneIndex] / this.userStories.length;
  }
}