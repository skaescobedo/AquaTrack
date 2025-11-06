import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, UserPlus } from 'lucide-angular';
import { UserService } from '../../services/users';
import { UserOut, UserCreate } from '../../models/user.model';
import { AuthService } from '../../services/auth';

// Importar todos los componentes
import { UserCard } from './user-card/user-card';
import { UserWizard } from './user-wizard/user-wizard';
import { UserEditModal } from './user-edit-modal/user-edit-modal';
import { ResetPasswordModal } from './reset-password-modal/reset-password-modal';
import { ChangePermissionsModal } from './change-permissions-modal/change-permissions-modal';
import { DeactivateUserModal } from './deactivate-user-modal/deactivate-user-modal';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    UserCard,
    UserWizard,
    UserEditModal,
    ResetPasswordModal,
    ChangePermissionsModal,
    DeactivateUserModal
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class Users implements OnInit {
  readonly UserPlus = UserPlus;

  users = signal<UserOut[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Estados de modales
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showResetPasswordModal = signal(false);
  showPermissionsModal = signal(false);
  showDeactivateModal = signal(false);

  // Usuario seleccionado para operaciones
  selectedUser: UserOut | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get isAdminGlobal(): boolean {
    return this.authService.currentUser()?.is_admin_global || false;
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
        this.error.set(err.error?.detail || 'Error al cargar usuarios');
        this.loading.set(false);
      }
    });
  }

  // ==================== CREATE ====================
  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onSaveUser(user: UserCreate): void {
    this.closeCreateModal();
    this.loadUsers(); // Recargar la lista
  }

  // ==================== EDIT ====================
  onEditUser(userId: number): void {
    const user = this.users().find(u => u.usuario_id === userId);
    if (user) {
      this.selectedUser = user;
      this.showEditModal.set(true);
    }
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedUser = null;
  }

  onUserUpdated(updated: UserOut): void {
    // Actualizar en la lista
    this.users.update(users => 
      users.map(u => u.usuario_id === updated.usuario_id ? updated : u)
    );
    this.closeEditModal();
  }

  // ==================== RESET PASSWORD ====================
  onResetPassword(userId: number): void {
    const user = this.users().find(u => u.usuario_id === userId);
    if (user) {
      this.selectedUser = user;
      this.showResetPasswordModal.set(true);
    }
  }

  closeResetPasswordModal(): void {
    this.showResetPasswordModal.set(false);
    this.selectedUser = null;
  }

  // ==================== PERMISSIONS ====================
  onChangePermissions(userId: number): void {
    const user = this.users().find(u => u.usuario_id === userId);
    if (user) {
      this.selectedUser = user;
      this.showPermissionsModal.set(true);
    }
  }

  closePermissionsModal(): void {
    this.showPermissionsModal.set(false);
    this.selectedUser = null;
  }

  onPermissionsUpdated(): void {
    this.loadUsers(); // Recargar para ver cambios
  }

  // ==================== DEACTIVATE ====================
  onDeactivateUser(userId: number): void {
    const user = this.users().find(u => u.usuario_id === userId);
    if (user) {
      this.selectedUser = user;
      this.showDeactivateModal.set(true);
    }
  }

  closeDeactivateModal(): void {
    this.showDeactivateModal.set(false);
    this.selectedUser = null;
  }

  onUserDeactivated(): void {
    this.closeDeactivateModal();
    this.loadUsers(); // Recargar la lista
  }
}