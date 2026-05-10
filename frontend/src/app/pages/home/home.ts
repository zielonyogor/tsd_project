import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import type { Sprint } from '../../../types/sprint';
import { SprintService } from '../../services/sprint.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [DatePipe, FormsModule, CommonModule],
})
export class Home implements OnInit {
  protected sprints: Sprint[] = [];
  protected isLoading = false;
  protected loadError = '';
  private readonly todayForInput = this.formatDateForInput(new Date());
  protected isCreatingSprint = false;
  protected createError = '';
  protected editSprintError = '';
  protected editingSprintId: string | null = null;
  protected editingGoal = '';
  protected editingStartDate = '';
  protected editingEndDate = '';

  protected readonly newSprintForm = {
    title: '',
    startDate: this.todayForInput,
    endDate: this.todayForInput,
  };

  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly service = inject(SprintService);

  ngOnInit(): void {
    void this.loadSprints();
  }

  goToSprint(sprintId: string): void {
    void this.router.navigate(['/board', sprintId]);
  }

  addSprint(): void {
    this.isCreatingSprint = true;
    this.createError = '';
    this.newSprintForm.title = '';
    this.newSprintForm.startDate = this.todayForInput;
    this.newSprintForm.endDate = this.todayForInput;
  }

  cancelSprintCreation(): void {
    this.isCreatingSprint = false;
    this.createError = '';
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancelSprintCreation();
    }
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

    void (async () => {
      try {
        const createdSprint = await this.service.createSprint(sprint);
        this.sprints.push(createdSprint);
        this.isCreatingSprint = false;
        this.createError = '';
        this.cdr.markForCheck();
      } catch {
        this.createError = 'Failed to create sprint. Please try again.';
        this.cdr.markForCheck();
      }
    })();
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

    void (async () => {
      try {
        const updatedSprint = await this.service.updateSprint({
          ...sprint,
          goal: updatedGoal,
          startDate: updatedStartDate,
          endDate: updatedEndDate,
        });
        
        const index = this.sprints.findIndex(s => s.id === sprint.id);
        if (index !== -1) {
          this.sprints[index] = updatedSprint;
        }
        
        this.cancelEditingGoal();
        this.cdr.markForCheck();
      } catch {
        this.editSprintError = 'Failed to save sprint. Please try again.';
        this.cdr.markForCheck();
      }
    })();
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

  private async loadSprints(): Promise<void> {
    this.isLoading = true;
    this.loadError = '';

    try {
      this.sprints = await this.service.getSprints();
    } catch {
      this.loadError = 'Could not load sprints from backend.';
      this.sprints = [];
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
}
