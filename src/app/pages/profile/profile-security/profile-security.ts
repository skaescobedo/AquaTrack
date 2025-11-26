// profile-security/profile-security.ts
import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Lock, Eye, EyeOff, X, Check } from 'lucide-angular';
import { User, ChangePassword } from '../../../models/user.model';
import { UserService } from '../../../services/users';

@Component({
  selector: 'app-profile-security',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './profile-security.html',
  styleUrl: './profile-security.scss'
})
export class ProfileSecurity {
  readonly Lock = Lock;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly X = X;
  readonly Check = Check;

  @Input({ required: true }) user!: User;

  isChangingPassword = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  // Form data
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Show/hide password
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(private userService: UserService) {}

  startChangingPassword(): void {
    this.isChangingPassword.set(true);
    this.error.set(null);
    this.success.set(false);
    this.resetForm();
  }

  cancelChange(): void {
    this.isChangingPassword.set(false);
    this.error.set(null);
    this.success.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  savePassword(): void {
    // Validaciones
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.error.set('Todos los campos son obligatorios');
      return;
    }

    if (this.newPassword.length < 6) {
      this.error.set('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const payload: ChangePassword = {
      current_password: this.currentPassword,
      new_password: this.newPassword
    };

    this.userService.changePassword(this.user.usuario_id, payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set(true);
        this.resetForm();
        setTimeout(() => {
          this.isChangingPassword.set(false);
          this.success.set(false);
        }, 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.detail || 'Error al cambiar contraseña');
      }
    });
  }
}