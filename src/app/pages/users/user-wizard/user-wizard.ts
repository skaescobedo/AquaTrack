import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, X, ArrowLeft, ArrowRight } from 'lucide-angular';
import { UserCreate } from '../../../models/user.model';
import { StepUserData } from './step-user-data/step-user-data';
import { StepFarmAssignment } from './step-farm-assignment/step-farm-assignment';

type StepType = 'data' | 'roles';

interface FarmRole {
  granja_id: number;
  granja_nombre: string;
  rol_id: number | null;
}

@Component({
  selector: 'app-user-wizard',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    LucideAngularModule,
    StepUserData,
    StepFarmAssignment
  ],
  templateUrl: './user-wizard.html',
  styleUrls: ['./user-wizard.scss']
})
export class UserWizard {
  readonly X = X;
  readonly ArrowLeft = ArrowLeft;
  readonly ArrowRight = ArrowRight;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<UserCreate>();

  activeStep = signal<StepType>('data');
  userForm: FormGroup;
  farmRoles = signal<FarmRole[]>([]);

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      nombre: ['', [Validators.required]],
      apellido1: ['', [Validators.required]],
      apellido2: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      is_admin_global: [false]
    });
  }

  get isAdminGlobal() { 
    return this.userForm.get('is_admin_global')?.value; 
  }

  get hasAtLeastOneRole(): boolean {
    if (this.isAdminGlobal) return true;
    return this.farmRoles().some(fr => fr.rol_id !== null);
  }

  onRolesChange(roles: FarmRole[]): void {
    this.farmRoles.set(roles);
  }

  goToRoles(): void {
    this.activeStep.set('roles');
  }

  goBack(): void {
    this.activeStep.set('data');
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (!this.hasAtLeastOneRole) return;

    const formValue = this.userForm.value;
    const selectedFarm = this.farmRoles().find(fr => fr.rol_id !== null);

    const userData: UserCreate = {
      username: formValue.username,
      nombre: formValue.nombre,
      apellido1: formValue.apellido1,
      apellido2: formValue.apellido2 || undefined,
      email: formValue.email,
      password: formValue.password,
      is_admin_global: formValue.is_admin_global,
      granja_id: selectedFarm?.granja_id,
      rol_id: selectedFarm?.rol_id || undefined
    };

    this.save.emit(userData);
  }
}