// users.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, UserPlus } from 'lucide-angular';
import { UserService } from '../../services/users';
import { UserOut, UserCreate, UserListItem } from '../../models/user.model';
import { AuthService } from '../../services/auth';

// Importar todos los componentes
import { UserCard } from './user-card/user-card';
import { UserWizard } from './user-wizard/user-wizard';
import { UserEditModal } from './user-edit-modal/user-edit-modal';
import { ResetPasswordModal } from './reset-password-modal/reset-password-modal';
import { ChangePermissionsModal } from './change-permissions-modal/change-permissions-modal';
import { DeactivateUserModal } from './deactivate-user-modal/deactivate-user-modal';
import { UserFilters } from './user-filters/user-filters';

type FilterStatus = 'active' | 'inactive' | 'all';

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
    DeactivateUserModal,
    UserFilters
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class Users implements OnInit {
  readonly UserPlus = UserPlus;

  users = signal<UserListItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filtros
  searchTerm = signal('');
  filterStatus = signal<FilterStatus>('active');

  // Estados de modales
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showResetPasswordModal = signal(false);
  showPermissionsModal = signal(false);
  showDeactivateModal = signal(false);

  // Usuario seleccionado para operaciones
  selectedUser: UserOut | null = null;

  // Computed: Usuarios filtrados
  filteredUsers = computed(() => {
    let result = this.users();
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();

    // Filtrar por estado
    if (status === 'active') {
      result = result.filter(u => u.status === 'a');
    } else if (status === 'inactive') {
      result = result.filter(u => u.status === 'i');
    }
    // 'all' no filtra

    // Filtrar por búsqueda
    if (search) {
      result = result.filter(u => {
        const fullName = `${u.nombre} ${u.apellido1} ${u.apellido2 || ''}`.toLowerCase();
        const email = u.email.toLowerCase();
        const username = u.username.toLowerCase();
        
        return fullName.includes(search) || 
               email.includes(search) || 
               username.includes(search);
      });
    }

    return result;
  });

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

  onFilterChange(event: { search: string; status: FilterStatus }): void {
    this.searchTerm.set(event.search);
    this.filterStatus.set(event.status);
  }

  // Modales - Crear Usuario
  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onSaveUser(userData: UserCreate): void {
    this.userService.createUser(userData).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadUsers();
      },
      error: (err) => {
        this.error.set(err.error?.detail || 'Error al crear usuario');
      }
    });
  }

  // Modales - Editar Usuario
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

  onUserUpdated(updatedUser: UserOut): void {
    this.closeEditModal();
    this.loadUsers();
  }

  // Modales - Restablecer Contraseña
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

  // Modales - Cambiar Permisos
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
    this.loadUsers();
  }

  // Modales - Desactivar Usuario
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
    this.loadUsers();
  }
}