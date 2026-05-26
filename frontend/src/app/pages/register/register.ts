import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  protected userName = '';
  protected password = '';
  protected confirmPassword = '';
  protected isRegistering = false;

  private readonly router = inject(Router);
  private readonly service = inject(UserService);

  protected async register(): Promise<void> {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    this.isRegistering = true;
    try {
      await this.service.registerUser(this.userName, this.password);
      alert('Registration successful!');
      await this.router.navigate(['/login']);
    } catch {
      alert('Registration failed!');
    } finally {
      this.isRegistering = false;
    }
  }
}
