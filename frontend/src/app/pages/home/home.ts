import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import type { Sprint } from '../../../types/sprint';
import { FAKE_SPRINT_BOARDS } from '../../data/fake-sprint-boards';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [DatePipe, FormsModule],
})
export class Home {
  protected readonly sprints: Sprint[] = Object.values(FAKE_SPRINT_BOARDS).map(board => board.sprint);
  protected isCreatingSprint = false;
  protected createError = '';
  protected editSprintError = '';
  protected editingSprintId: string | null = null;
  protected editingGoal = '';
  protected editingStartDate = '';
  protected editingEndDate = '';

  protected readonly newSprintForm = {
    title: '',
    startDate: '',
    endDate: '',
  };

  private readonly router = inject(Router);

  goToSprint(sprintId: string): void {
    void this.router.navigate(['/board', sprintId]);
  }

  addSprint(): void {
    this.isCreatingSprint = true;
    this.createError = '';
    this.newSprintForm.title = '';
    this.newSprintForm.startDate = '';
    this.newSprintForm.endDate = '';
  }

  cancelSprintCreation(): void {
    this.isCreatingSprint = false;
    this.createError = '';
  }

  createSprint(): void {
    const title = this.newSprintForm.title.trim();
    const startDate = this.parseDate(this.newSprintForm.startDate);
    const endDate = this.parseDate(this.newSprintForm.endDate);

    if (!title || !startDate || !endDate) {
      this.createError = 'Please provide sprint title, start date and end date.';
      return;
    }

    if (endDate < startDate) {
      this.createError = 'End date must be on or after start date.';
      return;
    }

    const newId = this.getNextSprintId();
    const sprint: Sprint = {
      id: newId,
      goal: title,
      startDate,
      endDate,
    };

    this.sprints.push(sprint);
    FAKE_SPRINT_BOARDS[newId] = {
      sprint,
      userStories: [],
    };

    this.isCreatingSprint = false;
    this.createError = '';
  }

  startEditingGoal(sprint: Sprint): void {
    this.editingSprintId = sprint.id;
    this.editingGoal = sprint.goal;
    this.editingStartDate = this.formatDateForInput(sprint.startDate);
    this.editingEndDate = this.formatDateForInput(sprint.endDate);
    this.editSprintError = '';
  }

  cancelEditingGoal(): void {
    this.editingSprintId = null;
    this.editingGoal = '';
    this.editingStartDate = '';
    this.editingEndDate = '';
    this.editSprintError = '';
  }

  saveGoal(sprint: Sprint): void {
    const updatedGoal = this.editingGoal.trim();
    const updatedStartDate = this.parseDate(this.editingStartDate);
    const updatedEndDate = this.parseDate(this.editingEndDate);

    if (!updatedGoal || !updatedStartDate || !updatedEndDate) {
      this.editSprintError = 'Please provide sprint goal, start date and end date.';
      return;
    }

    if (updatedEndDate < updatedStartDate) {
      this.editSprintError = 'End date must be on or after start date.';
      return;
    }

    sprint.goal = updatedGoal;
    sprint.startDate = updatedStartDate;
    sprint.endDate = updatedEndDate;
    this.cancelEditingGoal();
  }

  private parseDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getNextSprintId(): string {
    let maxId = 0;

    for (const sprint of this.sprints) {
      const numericId = Number.parseInt(sprint.id, 10);

      if (!Number.isNaN(numericId) && numericId > maxId) {
        maxId = numericId;
      }
    }

    return String(maxId + 1);
  }
}
