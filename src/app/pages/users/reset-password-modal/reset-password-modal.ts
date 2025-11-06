import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, KeyRound, AlertCircle, CheckCircle } from 'lucide-angular';
import { UserOut } from '../../../models/user.model';
import { UserService } from '../../../services/users';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
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
  isLoading = false;
  error: string | null = null;
  success = false;
  generatedPassword = '';

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

    this.isLoading = true;
    this.error = null;

    // Nota: Este endpoint debe ser implementado en el backend
    // Por ahora usaremos el changePassword pero necesitarás uno específico para admin reset
    const payload = { new_password: this.form.value.new_password };

    // TODO: Implementar endpoint específico para admin reset password
    // this.userService.adminResetPassword(this.user.usuario_id, payload).subscribe({
    //   next: () => {
    //     this.success = true;
    //     setTimeout(() => this.close.emit(), 2000);
    //   },
    //   error: (err) => {
    //     this.error = err.error?.detail || 'Error al restablecer contraseña';
    //     this.isLoading = false;
    //   }
    // });

    // Por ahora simulamos éxito
    setTimeout(() => {
      this.success = true;
      this.isLoading = false;
      setTimeout(() => this.close.emit(), 2000);
    }, 1000);
  }

  onClose(): void {
    this.close.emit();
  }
}