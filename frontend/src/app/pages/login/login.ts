import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { getCurrentUser, saveCurrentUser } from '../../data/user-storage';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [CommonModule, FormsModule, RouterLink],
})
export class Login implements OnInit {
  protected userName = '';
  protected password = '';
  protected loginError = '';
  protected isLoggingIn = false;

  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly service = inject(UserService);

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
      const user = await this.service.loginUser(name, this.password);
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