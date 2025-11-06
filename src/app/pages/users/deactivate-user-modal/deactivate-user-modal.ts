import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, UserX, AlertTriangle } from 'lucide-angular';
import { UserOut } from '../../../models/user.model';
import { UserService } from '../../../services/users';

@Component({
  selector: 'app-deactivate-user-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
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

  isLoading = false;
  error: string | null = null;

  constructor(private userService: UserService) {}

  onConfirm(): void {
    this.isLoading = true;
    this.error = null;

    this.userService.deactivateUser(this.user.usuario_id).subscribe({
      next: () => {
        this.deactivated.emit();
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al desactivar usuario';
        this.isLoading = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}