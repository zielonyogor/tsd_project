import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Sprint } from '../../../types/sprint';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [DatePipe],
})
export class Home {
  protected readonly sprints: Array<Sprint> = [
    {
      id: '1',
      goal: 'Make MVP',
      startDate: new Date(2026, 1, 1),
      endDate: new Date(2026, 1, 22)
    },
    {
      id: '2',
      goal: 'Improve UI',
      startDate: new Date(2026, 1, 23),
      endDate: new Date(2026, 2, 5)
    },
    {
      id: '2',
      goal: 'Improve UI',
      startDate: new Date(2026, 1, 23),
      endDate: new Date(2026, 2, 5)
    },
    {
      id: '2',
      goal: 'Improve UI',
      startDate: new Date(2026, 1, 23),
      endDate: new Date(2026, 2, 5)
    },
    {
      id: '2',
      goal: 'Improve UI',
      startDate: new Date(2026, 1, 23),
      endDate: new Date(2026, 2, 5)
    }
  ];

  goToSprint(sprintId: string): void {
    console.log(`Navigating to sprint with ID: ${sprintId}`);
  }

  addSprint(): void {
    console.log('Adding new sprint');
  }
}
