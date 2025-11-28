// pages/ponds/ponds.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Waves, Plus } from 'lucide-angular';
import { PondService } from '../../services/ponds';
import { FarmService } from '../../services/farms';
import { CycleService } from '../../services/cycles';
import { AuthService } from '../../services/auth';
import { Pond, PondCreate } from '../../models/pond.model';
import { Farm } from '../../models/farm.model';
import { Cycle } from '../../models/cycle.model';
import { PondCard } from './pond-card/pond-card';
import { PondModal } from './pond-modal/pond-modal';
import { PondEditModal } from './pond-edit-modal/pond-edit-modal';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { forkJoin, catchError, of } from 'rxjs';

@Component({
  selector: 'app-ponds',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
    PondCard, 
    PondModal,
    PondEditModal,
    ConfirmDialog
  ],
  templateUrl: './ponds.html',
  styleUrls: ['./ponds.scss']
})
export class Ponds implements OnInit {
  readonly Waves = Waves;
  readonly Plus = Plus;

  farmId: number | null = null;
  currentFarm = signal<Farm | null>(null);
  activeCycle = signal<Cycle | null>(null);
  ponds = signal<Pond[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Modales
  showModal = signal(false);
  showEditModal = signal(false);
  selectedPond: Pond | null = null;

  // Confirm dialog
  showConfirmDialog = false;
  confirmDialogData: {
    title: string;
    message: string;
    action: () => void;
  } | null = null;
  isConfirmLoading = false;

  constructor(
    private pondService: PondService,
    private farmService: FarmService,
    private cycleService: CycleService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      this.farmId = params['farmId'] ? parseInt(params['farmId']) : null;
      
      if (this.farmId) {
        this.loadData();
      }
    });
  }

  loadData(): void {
    if (!this.farmId) return;

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      farm: this.farmService.getFarm(this.farmId),
      ponds: this.pondService.getPonds(this.farmId, true), // vigentesOnly = true
      activeCycle: this.cycleService.getActiveCycle(this.farmId).pipe(
        catchError(() => of(null))
      )
    }).subscribe({
      next: (result) => {
        this.currentFarm.set(result.farm);
        this.ponds.set(result.ponds);
        this.activeCycle.set(result.activeCycle);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.error.set('Error al cargar los datos');
        this.loading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSavePond(pondData: PondCreate): void {
    if (!this.farmId) return;

    this.pondService.createPond(this.farmId, pondData).subscribe({
      next: () => {
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        console.error('Error creando estanque:', err);
        this.closeModal();
        
        // Mostrar error en confirm dialog
        this.confirmDialogData = {
          title: 'Error al crear estanque',
          message: err.error?.detail || 'Ocurrió un error al crear el estanque',
          action: () => this.onConfirmDialogCancel()
        };
        this.showConfirmDialog = true;
      }
    });
  }

  onEditPond(pond: Pond): void {
    this.selectedPond = pond;
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedPond = null;
  }

  onPondUpdated(updated: Pond): void {
    this.closeEditModal();
    this.loadData();
  }

  onPondUpdateError(errorMessage: string): void {
    this.closeEditModal();
    
    // Mostrar error en confirm dialog
    this.confirmDialogData = {
      title: 'Error al actualizar estanque',
      message: errorMessage,
      action: () => this.onConfirmDialogCancel()
    };
    this.showConfirmDialog = true;
  }

  onDeletePond(pond: Pond): void {
    this.confirmDialogData = {
      title: '¿Eliminar estanque?',
      message: `¿Estás seguro de que deseas eliminar el estanque "${pond.nombre}"? Si tiene historial, se marcará como no vigente. Si no tiene historial, se eliminará permanentemente.`,
      action: () => this.executeDelete(pond.estanque_id)
    };
    this.showConfirmDialog = true;
  }

  executeDelete(pondId: number): void {
    this.isConfirmLoading = true;

    this.pondService.deletePond(pondId).subscribe({
      next: () => {
        this.showConfirmDialog = false;
        this.confirmDialogData = null;
        this.isConfirmLoading = false;
        this.loadData();
      },
      error: (err) => {
        this.isConfirmLoading = false;
        
        // Mostrar error en confirm dialog
        this.confirmDialogData = {
          title: 'Error al eliminar estanque',
          message: err.error?.detail || 'Ocurrió un error al eliminar el estanque',
          action: () => this.onConfirmDialogCancel()
        };
        // Ya está abierto, solo cambiar el contenido
      }
    });
  }

  onConfirmDialogConfirm(): void {
    if (this.confirmDialogData?.action) {
      this.confirmDialogData.action();
    }
  }

  onConfirmDialogCancel(): void {
    this.showConfirmDialog = false;
    this.confirmDialogData = null;
    this.isConfirmLoading = false;
  }

  get canManagePonds(): boolean {
    return this.authService.currentUser()?.is_admin_global || false;
  }

  get totalSuperficieGranja(): number {
    return this.currentFarm()?.superficie_total_m2 || 0;
  }

  get superficieVigente(): number {
    return this.ponds().reduce((sum, p) => sum + parseFloat(p.superficie_m2), 0);
  }

  get porcentajeUtilizado(): number {
    if (this.totalSuperficieGranja === 0) return 0;
    return (this.superficieVigente / this.totalSuperficieGranja) * 100;
  }

  m2ToHa(m2: number): string {
    return (m2 / 10000).toFixed(2);
  }

  get farmName(): string {
    return this.currentFarm()?.nombre || '';
  }
}