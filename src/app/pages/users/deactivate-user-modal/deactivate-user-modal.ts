// deactivate-user-modal.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, UserX, AlertTriangle } from 'lucide-angular';
import { UserOut } from '../../../models/user.model';
import { UserService } from '../../../services/users';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-deactivate-user-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ConfirmDialog],
  templateUrl: './deactivate-user-modal.html',
  styleUrls: ['./deactivate-user-modal.scss']
})
export class DeactivateUserModal {
  readonly X = X;
  readonly UserX = UserX;
  readonly AlertTriangle = AlertTriangle;

  @Input() user!: UserOut;
  @Output() close = new EventEmitter<void>();
  @Output() deactivated = new EventEmitter<void>();

  error: string | null = null;

  // Estados para el confirm dialog
  showConfirmDialog = false;
  confirmDialogData: {
    title: string;
    message: string;
    action: () => void;
  } | null = null;
  isConfirmLoading = false;

  constructor(private userService: UserService) {}

  openConfirmDialog(): void {
    this.confirmDialogData = {
      title: 'localhost:4200 dice',
      message: `¿Estás seguro de desactivar a ${this.user.nombre} ${this.user.apellido1}? No podrá iniciar sesión hasta que lo reactives.`,
      action: () => this.confirmDeactivate()
    };
    this.showConfirmDialog = true;
  }

  confirmDeactivate(): void {
    this.isConfirmLoading = true;
    this.error = null;

    this.userService.deactivateUser(this.user.usuario_id).subscribe({
      next: () => {
        this.isConfirmLoading = false;
        this.showConfirmDialog = false;
        this.confirmDialogData = null;
        this.deactivated.emit();
      },
      error: (err) => {
        this.isConfirmLoading = false;
        this.error = err.error?.detail || 'Error al desactivar usuario';
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