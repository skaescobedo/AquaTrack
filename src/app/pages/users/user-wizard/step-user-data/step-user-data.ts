import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-step-user-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-user-data.html'
})
export class StepUserData {
  @Input({ required: true }) form!: FormGroup;
  @Output() next = new EventEmitter<void>();

  get nombre() { return this.form.get('nombre'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }
  get confirmPassword() { return this.form.get('confirmPassword'); }

  get passwordsMatch(): boolean {
    const pwd = this.password?.value;
    const confirm = this.confirmPassword?.value;
    return pwd === confirm;
  }

  onNext(): void {
    if (this.form.invalid || !this.passwordsMatch) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }
    this.next.emit();
  }
}