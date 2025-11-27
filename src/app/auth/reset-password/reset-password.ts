import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPassword implements OnInit {
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  resetForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  token = signal<string | null>(null);
  tokenError = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  ngOnInit(): void {
    // Leer token del query param
    const tokenParam = this.route.snapshot.queryParamMap.get('token');
    
    if (!tokenParam) {
      this.tokenError.set(true);
      this.errorMessage.set('Token no encontrado. Por favor, solicita un nuevo enlace de recuperación.');
    } else {
      this.token.set(tokenParam);
    }
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword.update(show => !show);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(show => !show);
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('new_password');
    const confirmPassword = form.get('confirm_password');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token()) {
      this.markFormGroupTouched(this.resetForm);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = {
      token: this.token()!,
      new_password: this.resetForm.value.new_password
    };

    this.authService.resetPassword(payload).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.detail || 'Error al restablecer contraseña'
        );
        this.loading.set(false);
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get newPassword() {
    return this.resetForm.get('new_password');
  }

  get confirmPassword() {
    return this.resetForm.get('confirm_password');
  }

  get passwordsMatch(): boolean {
    const password = this.newPassword?.value;
    const confirm = this.confirmPassword?.value;
    return password === confirm;
  }
}