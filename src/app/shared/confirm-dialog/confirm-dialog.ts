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
        <!-- Close button -->
        <button class="close-btn" (click)="onCancel()" [disabled]="isLoading">
          <lucide-icon [img]="X" [size]="20"></lucide-icon>
        </button>

        <!-- Icon -->
        <div class="icon-wrapper">
          <lucide-icon [img]="AlertTriangle" [size]="40"></lucide-icon>
        </div>

        <!-- Content -->
        <div class="dialog-content">
          <h3 class="dialog-title">{{ title }}</h3>
          <p class="dialog-message">{{ message }}</p>
        </div>

        <!-- Actions -->
        <div class="dialog-actions">
          <button 
            class="btn btn-secondary"
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
      @apply fixed inset-0 z-50 flex items-center justify-center p-4;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease-out;
    }

    .confirm-dialog {
      @apply relative w-full max-w-md p-8 rounded-2xl shadow-2xl;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid rgba(148, 163, 184, 0.1);
      animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .close-btn {
      @apply absolute top-4 right-4 p-1.5 rounded-lg transition-all duration-200;
      @apply text-slate-400 hover:text-white hover:bg-slate-700;
      
      &:disabled {
        @apply opacity-50 cursor-not-allowed;
      }
    }

    .icon-wrapper {
      @apply w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center;
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%);
      border: 2px solid rgba(251, 191, 36, 0.2);
      animation: pulse 2s ease-in-out infinite;
      
      lucide-icon {
        @apply text-yellow-400;
        filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.4));
      }
    }

    .dialog-content {
      @apply text-center mb-8;
    }

    .dialog-title {
      @apply text-2xl font-bold text-white mb-3;
      letter-spacing: -0.02em;
    }

    .dialog-message {
      @apply text-slate-300 text-base leading-relaxed;
    }

    .dialog-actions {
      @apply flex gap-3;

      .btn {
        @apply flex-1 px-6 py-3 rounded-xl font-semibold text-base;
        @apply transition-all duration-200 transform;
        @apply flex items-center justify-center gap-2;

        &:hover:not(:disabled) {
          @apply scale-105 shadow-lg;
        }

        &:active:not(:disabled) {
          @apply scale-95;
        }

        &:disabled {
          @apply opacity-50 cursor-not-allowed;
        }
      }

      .btn-secondary {
        @apply bg-slate-700 text-slate-200;
        @apply hover:bg-slate-600 border border-slate-600;
      }

      .btn-danger {
        @apply bg-gradient-to-r from-red-600 to-red-500 text-white;
        @apply hover:from-red-500 hover:to-red-400;
        @apply shadow-lg shadow-red-500/20;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
    }

    .spinner {
      @apply inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full;
      animation: spin 0.6s linear infinite;
    }

    @keyframes fadeIn {
      from { 
        opacity: 0;
      }
      to { 
        opacity: 1;
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.05);
        opacity: 0.9;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ConfirmDialog {
  readonly AlertTriangle = AlertTriangle;
  readonly X = X;

  @Input() title = '¿Estás seguro?';
  @Input() message = 'Esta acción no se puede deshacer.';
  @Input() confirmText = 'Aceptar';
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