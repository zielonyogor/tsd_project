import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FAKE_SPRINTS } from '../../data/fake-sprint-boards';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [DatePipe],
})
export class Home {
  protected readonly sprints = FAKE_SPRINTS;
  private readonly router = inject(Router);

  goToSprint(sprintId: string): void {
    void this.router.navigate(['/board', sprintId]);
  }

  addSprint(): void {
    console.log('Adding new sprint');
  }
}
