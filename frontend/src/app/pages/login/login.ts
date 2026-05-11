import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SprintService } from '../../services/sprint.service';
import { getCurrentUser, saveCurrentUser } from '../../data/user-storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
//   styleUrl: './login.scss',
  imports: [CommonModule, FormsModule],
})
export class Login implements OnInit {
  protected userName = '';
  protected loginError = '';
  protected isLoggingIn = false;

  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly service = inject(SprintService);

  ngOnInit(): void {
    const existingUser = getCurrentUser();
    if (existingUser) {
      void this.router.navigate(['/']);
    }
  }

  protected async login(): Promise<void> {
    const name = this.userName.trim();
    if (!name) {
      this.loginError = 'Enter your username.';
      return;
    }

    this.loginError = '';
    this.isLoggingIn = true;

    try {
      const user = await this.service.createUser(name);
      saveCurrentUser(user);
      void this.router.navigate(['/']);
    } catch {
      this.loginError = 'Could not log in. Please try again.';
    } finally {
      this.isLoggingIn = false;
      this.cdr.markForCheck();
    }
  }
}