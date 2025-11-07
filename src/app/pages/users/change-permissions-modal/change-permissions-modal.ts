import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Shield, Building2, Trash2, AlertCircle, Plus, Edit } from 'lucide-angular';
import { UserOut, UserFarm, AssignUserToFarm } from '../../../models/user.model';
import { UserService } from '../../../services/users';
import { FarmService } from '../../../services/farms';
import { Farm } from '../../../models/farm.model';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

interface Role {
  id: number;
  nombre: string;
  description: string;
}

@Component({
  selector: 'app-change-permissions-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, ConfirmDialog],
  templateUrl: './change-permissions-modal.html',
  styleUrls: ['./change-permissions-modal.scss']
})
export class ChangePermissionsModal implements OnInit {
  readonly X = X;
  readonly Shield = Shield;
  readonly Building2 = Building2;
  readonly Trash2 = Trash2;
  readonly AlertCircle = AlertCircle;
  readonly Plus = Plus;
  readonly Edit = Edit;

  @Input() user!: UserOut;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  userFarms: UserFarm[] = [];
  allFarms: Farm[] = [];
  availableFarms: Farm[] = [];
  
  // Roles disponibles (deben coincidir con tu BD)
  roles: Role[] = [
    { id: 1, nombre: 'Admin granja', description: 'Control total de la granja' },
    { id: 2, nombre: 'Biologo', description: 'Gestión de ciclos y biometrías' },
    { id: 3, nombre: 'Operador', description: 'Operaciones diarias y tareas' },
    { id: 4, nombre: 'Consultor', description: 'Solo lectura de información' }
  ];

  isLoading = true;
  error: string | null = null;
  
  // Estados para asignación y edición
  showAssignForm = false;
  selectedFarmId: number | null = null;
  selectedRoleId: number | null = null;
  editingFarmId: number | null = null;
  newRoleId: number | null = null;

  // Estados para el confirm dialog
  showConfirmDialog = false;
  confirmDialogData: {
    title: string;
    message: string;
    action: () => void;
  } | null = null;
  isConfirmLoading = false;

  constructor(
    private userService: UserService,
    private farmService: FarmService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    // Cargar granjas del usuario
    this.userService.getUserFarms(this.user.usuario_id).subscribe({
      next: (userFarms) => {
        this.userFarms = userFarms;
        this.loadAllFarms();
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al cargar permisos del usuario';
        this.isLoading = false;
      }
    });
  }

  loadAllFarms(): void {
    // Cargar todas las granjas disponibles
    this.farmService.getFarms().subscribe({
      next: (farms) => {
        this.allFarms = farms;
        // Filtrar granjas disponibles (no asignadas)
        const assignedIds = this.userFarms.map(uf => uf.granja_id);
        this.availableFarms = farms.filter(f => !assignedIds.includes(f.granja_id) && f.is_active);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al cargar granjas';
        this.isLoading = false;
      }
    });
  }

  getRoleName(rolId: number): string {
    return this.roles.find(r => r.id === rolId)?.nombre || 'Desconocido';
  }

  // ==================== ASIGNAR A NUEVA GRANJA ====================
  openAssignForm(): void {
    this.showAssignForm = true;
    this.selectedFarmId = this.availableFarms[0]?.granja_id || null;
    this.selectedRoleId = 1; // Admin granja por defecto
  }

  cancelAssign(): void {
    this.showAssignForm = false;
    this.selectedFarmId = null;
    this.selectedRoleId = null;
  }

  assignToFarm(): void {
    if (!this.selectedFarmId || !this.selectedRoleId) return;

    const payload: AssignUserToFarm = {
      granja_id: this.selectedFarmId,
      rol_id: this.selectedRoleId,
      additional_scopes: []
    };

    this.userService.assignToFarm(this.user.usuario_id, payload).subscribe({
      next: () => {
        this.cancelAssign();
        this.loadData(); // Recargar datos
        this.updated.emit();
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al asignar usuario a granja';
      }
    });
  }

  // ==================== CAMBIAR ROL ====================
  startEditRole(userFarm: UserFarm): void {
    this.editingFarmId = userFarm.granja_id;
    this.newRoleId = userFarm.rol_id;
  }

  cancelEditRole(): void {
    this.editingFarmId = null;
    this.newRoleId = null;
  }

  saveRoleChange(granjaId: number): void {
    if (!this.newRoleId) return;

    const payload = { rol_id: this.newRoleId };

    // Llamar al endpoint PATCH /users/{usuario_id}/farms/{granja_id}
    this.userService.updateUserFarmRole(this.user.usuario_id, granjaId, payload).subscribe({
      next: () => {
        this.cancelEditRole();
        this.loadData(); // Recargar datos
        this.updated.emit();
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al cambiar rol';
      }
    });
  }

  // ==================== QUITAR DE GRANJA ====================
  removeFromFarm(userFarm: UserFarm): void {
    const farmName = userFarm.granja_nombre;
    
    // Configurar el diálogo de confirmación
    this.confirmDialogData = {
      title: 'localhost:4200 dice',
      message: `¿Quitar acceso de ${this.user.nombre} a "${farmName}"?`,
      action: () => this.confirmRemoveFromFarm(userFarm)
    };
    this.showConfirmDialog = true;
  }

  confirmRemoveFromFarm(userFarm: UserFarm): void {
    this.isConfirmLoading = true;

    this.userService.removeFromFarm(this.user.usuario_id, userFarm.granja_id).subscribe({
      next: () => {
        this.isConfirmLoading = false;
        this.showConfirmDialog = false;
        this.confirmDialogData = null;
        this.loadData(); // Recargar datos
        this.updated.emit();
      },
      error: (err) => {
        this.isConfirmLoading = false;
        this.error = err.error?.detail || 'Error al quitar acceso';
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
    this.close.emit();
  }
}