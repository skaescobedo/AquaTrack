import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    console.log('🔐 Iniciando login...');

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso, token recibido');
        console.log('📍 Navegando a farms...');
        
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/farms';
        console.log('🎯 URL destino:', returnUrl);
        
        this.router.navigate([returnUrl]).then(success => {
          console.log('🚀 Navegación completada:', success);
          if (!success) {
            console.error('❌ La navegación falló');
          }
        });
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        this.loading.set(false);
        this.errorMessage.set(error.error?.detail || 'Credenciales inválidas');
      },
      complete: () => {
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

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}