import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, KeyRound, AlertCircle, CheckCircle } from 'lucide-angular';
import { UserOut } from '../../../models/user.model';
import { UserService } from '../../../services/users';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ConfirmDialog],
  templateUrl: './reset-password-modal.html',
  styleUrls: ['./reset-password-modal.scss']
})
export class ResetPasswordModal {
  readonly X = X;
  readonly KeyRound = KeyRound;
  readonly AlertCircle = AlertCircle;
  readonly CheckCircle = CheckCircle;

  @Input() user!: UserOut;
  @Output() close = new EventEmitter<void>();

  form: FormGroup;
  isLoading = false;  // ← Mantener esta propiedad para el estado del botón
  error: string | null = null;
  success = false;
  generatedPassword = '';

  // Estados para el confirm dialog
  showConfirmDialog = false;
  confirmDialogData: {
    title: string;
    message: string;
    action: () => void;
  } | null = null;
  isConfirmLoading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.form = this.fb.group({
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('new_password')?.value;
    const confirm = g.get('confirm_password')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  generatePassword(): void {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    this.generatedPassword = password;
    this.form.patchValue({
      new_password: password,
      confirm_password: password
    });
  }

  copyPassword(): void {
    navigator.clipboard.writeText(this.generatedPassword);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Mostrar confirm dialog antes de ejecutar
    this.confirmDialogData = {
      title: 'localhost:4200 dice',
      message: `¿Restablecer la contraseña de ${this.user.nombre} ${this.user.apellido1}? Esta acción no se puede deshacer.`,
      action: () => this.confirmResetPassword()
    };
    this.showConfirmDialog = true;
  }

  confirmResetPassword(): void {
    this.isConfirmLoading = true;
    this.isLoading = true;  // ← También activar este
    this.error = null;

    this.userService.adminResetPassword(this.user.usuario_id, this.form.value.new_password).subscribe({
      next: () => {
        this.isConfirmLoading = false;
        this.isLoading = false;
        this.showConfirmDialog = false;
        this.confirmDialogData = null;
        this.success = true;
        setTimeout(() => this.close.emit(), 2000);
      },
      error: (err) => {
        this.isConfirmLoading = false;
        this.isLoading = false;
        this.error = err.error?.detail || 'Error al restablecer contraseña';
        this.showConfirmDialog = false;
        this.confirmDialogData = null;
      }
    });
  }

  onConfirmDialogCancel(): void {
    this.showConfirmDialog = false;
    this.confirmDialogData = null;
    this.isConfirmLoading = false;
  }

  onConfirmDialogConfirm(): void {
    if (this.confirmDialogData?.action) {
      this.confirmDialogData.action();
    }
  }

  onClose(): void {
    if (!this.isLoading) {
      this.close.emit();
    }
  }
}