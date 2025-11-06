import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, User, Mail, AlertCircle } from 'lucide-angular';
import { UserOut, UserUpdate } from '../../../models/user.model';
import { UserService } from '../../../services/users';

@Component({
  selector: 'app-user-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './user-edit-modal.html',
  styleUrls: ['./user-edit-modal.scss']
})
export class UserEditModal implements OnInit {
  readonly X = X;
  readonly User = User;
  readonly Mail = Mail;
  readonly AlertCircle = AlertCircle;

  @Input() user!: UserOut;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<UserOut>();

  form!: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: [this.user.nombre, [Validators.required, Validators.minLength(2)]],
      apellido1: [this.user.apellido1, [Validators.required, Validators.minLength(2)]],
      apellido2: [this.user.apellido2 || ''],
      email: [this.user.email, [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const payload: UserUpdate = this.form.value;

    this.userService.updateUser(this.user.usuario_id, payload).subscribe({
      next: (updated) => {
        this.saved.emit(updated);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al actualizar usuario';
        this.isLoading = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}