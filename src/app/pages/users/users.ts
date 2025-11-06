import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, UserPlus } from 'lucide-angular';
import { UserService } from '../../services/users';
import { AuthService } from '../../services/auth';
import { UserOut, UserCreate } from '../../models/user.model';
import { UserCard } from './user-card/user-card';
import { UserWizard } from './user-wizard/user-wizard';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UserCard, UserWizard],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class Users implements OnInit {
  readonly UserPlus = UserPlus;

  users = signal<UserOut[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showCreateModal = signal(false);

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.error.set('Error al cargar los usuarios');
        this.loading.set(false);
      }
    });
  }

  openCreateModal(): void {
    console.log('🔵 Abriendo modal de crear usuario');
    this.showCreateModal.set(true);
    console.log('🔵 showCreateModal:', this.showCreateModal());
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onSaveUser(userData: UserCreate): void {
    console.log('Crear usuario:', userData);
    
    this.userService.createUser(userData).subscribe({
      next: (user) => {
        console.log('Usuario creado:', user);
        this.closeCreateModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error creando usuario:', err);
        this.error.set(err.error?.detail || 'Error al crear el usuario');
      }
    });
  }

  onEditUser(userId: number): void {
    console.log('Editar usuario:', userId);
  }

  onChangePermissions(userId: number): void {
    console.log('Cambiar permisos:', userId);
  }

  onResetPassword(userId: number): void {
    console.log('Restablecer contraseña:', userId);
  }

  onDeactivateUser(userId: number): void {
    console.log('Desactivar usuario:', userId);
  }

  get isAdminGlobal(): boolean {
    return this.authService.currentUser()?.is_admin_global || false;
  }
}