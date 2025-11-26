// profile-info/profile-info.ts
import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, User as UserIcon, Mail, Edit2, X, Check, Shield } from 'lucide-angular';
import { User, UserUpdate } from '../../../models/user.model';
import { UserService } from '../../../services/users';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './profile-info.html',
  styleUrl: './profile-info.scss'
})
export class ProfileInfo {
  readonly UserIcon = UserIcon;
  readonly Mail = Mail;
  readonly Edit2 = Edit2;
  readonly X = X;
  readonly Check = Check;
  readonly Shield = Shield;

  @Input({ required: true }) user!: User;
  @Output() updated = new EventEmitter<void>();

  isEditing = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Form data
  nombre = '';
  apellido1 = '';
  apellido2 = '';
  email = '';

  constructor(private userService: UserService) {}

  get userInitials(): string {
    return `${this.user.nombre[0]}${this.user.apellido1[0]}`.toUpperCase();
  }

  get fullName(): string {
    return `${this.user.nombre} ${this.user.apellido1}${this.user.apellido2 ? ' ' + this.user.apellido2 : ''}`;
  }

  startEdit(): void {
    this.nombre = this.user.nombre;
    this.apellido1 = this.user.apellido1;
    this.apellido2 = this.user.apellido2 || '';
    this.email = this.user.email;
    this.isEditing.set(true);
    this.error.set(null);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.error.set(null);
  }

  saveChanges(): void {
    if (!this.nombre.trim() || !this.apellido1.trim() || !this.email.trim()) {
      this.error.set('Nombre, apellido y email son obligatorios');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const payload: UserUpdate = {
      nombre: this.nombre.trim(),
      apellido1: this.apellido1.trim(),
      apellido2: this.apellido2.trim() || undefined,
      email: this.email.trim()
    };

    this.userService.updateUser(this.user.usuario_id, payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isEditing.set(false);
        this.updated.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.detail || 'Error al actualizar información');
      }
    });
  }
}