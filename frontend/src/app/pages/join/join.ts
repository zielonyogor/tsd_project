import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, type ParamMap } from '@angular/router';
import { SprintService } from '../../services/sprint.service';
import type { User } from '../../../types/user';
import { getCurrentUser } from '../../data/user-storage';

@Component({
  selector: 'app-join',
  templateUrl: './join.html',
  styleUrl: './join.scss',
  imports: [CommonModule, FormsModule],
})
export class Join implements OnInit {
  protected joinCode = '';
  protected joinError = '';
  protected isJoining = false;
  protected currentUser: User | null = null;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly service = inject(SprintService);

  ngOnInit(): void {
    this.currentUser = getCurrentUser();
    if (!this.currentUser) {
      void this.router.navigate(['/login']);
      return;
    }

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const code = paramMap.get('code');
      if (code) {
        this.joinCode = code;
      }
    });
  }

  protected async joinSprint(): Promise<void> {
    if (!this.currentUser) {
      this.joinError = 'Log in first.';
      return;
    }

    const code = this.joinCode.trim();
    if (!code) {
      this.joinError = 'Enter a sprint join code.';
      return;
    }

    this.joinError = '';
    this.isJoining = true;

    try {
      const sprint = await this.service.joinSprint(code, this.currentUser.id);
      void this.router.navigate(['/board', sprint.id]);
    } catch (error) {
      console.error('Join sprint failed', error);
      this.joinError = 'Could not join sprint. See console for details.';
    } finally {
      this.isJoining = false;
      this.cdr.markForCheck();
    }
  }

  protected goBack(): void {
    void this.router.navigate(['/']);
  }
}