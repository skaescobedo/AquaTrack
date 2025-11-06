import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, X } from 'lucide-angular';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="confirm-dialog" (click)="$event.stopPropagation()">
        <!-- Icon -->
        <div class="icon-wrapper">
          <lucide-icon [img]="AlertTriangle" [size]="32" class="text-yellow-400"></lucide-icon>
        </div>

        <!-- Content -->
        <div class="dialog-content">
          <h3 class="dialog-title">{{ title }}</h3>
          <p class="dialog-message">{{ message }}</p>
        </div>

        <!-- Actions -->
        <div class="dialog-actions">
          <button 
            class="btn btn-ghost"
            (click)="onCancel()"
            [disabled]="isLoading"
          >
            {{ cancelText }}
          </button>
          <button 
            class="btn btn-danger"
            (click)="onConfirm()"
            [disabled]="isLoading"
          >
            @if (isLoading) {
              <span class="spinner"></span>
            }
            <span>{{ confirmText }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      @apply fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4;
      animation: fadeIn 0.2s ease-out;
    }

    .confirm-dialog {
      @apply bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-700;
      animation: slideUp 0.3s ease-out;
    }

    .icon-wrapper {
      @apply w-16 h-16 mx-auto bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center mb-4;
    }

    .dialog-content {
      @apply text-center mb-6;
    }

    .dialog-title {
      @apply text-xl font-semibold text-white mb-2;
    }

    .dialog-message {
      @apply text-slate-400 text-sm leading-relaxed;
    }

    .dialog-actions {
      @apply flex gap-3 justify-center;

      button {
        @apply flex-1;
      }
    }

    .btn-danger {
      @apply bg-red-500 text-white hover:bg-red-600;

      &:disabled {
        @apply opacity-50 cursor-not-allowed;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `]
})
export class ConfirmDialog {
  readonly AlertTriangle = AlertTriangle;
  readonly X = X;

  @Input() title = '¿Estás seguro?';
  @Input() message = 'Esta acción no se puede deshacer.';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() isLoading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}