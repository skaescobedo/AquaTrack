import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Building2, Plus } from 'lucide-angular';
import { FarmService } from '../../services/farms';
import { AuthService } from '../../services/auth';
import { Farm, FarmCreate } from '../../models/farm.model';
import { FarmCard } from './farm-card/farm-card';
import { FarmModal } from './farm-modal/farm-modal';
import { FarmEditModal } from './farm-edit-modal/farm-edit-modal';
import { FarmFilters } from './farm-filters/farm-filters';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

type FilterStatus = 'active' | 'inactive' | 'all';

@Component({
  selector: 'app-farms',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
    FarmCard, 
    FarmModal,
    FarmEditModal,
    FarmFilters,
    ConfirmDialog
  ],
  templateUrl: './farms.html',
  styleUrls: ['./farms.scss']
})
export class Farms implements OnInit {
  readonly Building2 = Building2;
  readonly Plus = Plus;
  
  farms = signal<Farm[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  userLoading = signal(true);

  // Filtros
  searchTerm = signal('');
  filterStatus = signal<FilterStatus>('active');

  // Estados de modales
  showModal = signal(false);
  showEditModal = signal(false);
  selectedFarm: Farm | null = null;

  // Confirm dialog
  showConfirmDialog = false;
  confirmDialogData: {
    title: string;
    message: string;
    action: () => void;
  } | null = null;
  isConfirmLoading = false;

  // Computed: Granjas filtradas
  filteredFarms = computed(() => {
    let result = this.farms();
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();

    if (status === 'active') {
      result = result.filter(f => f.is_active);
    } else if (status === 'inactive') {
      result = result.filter(f => !f.is_active);
    }

    if (search) {
      result = result.filter(f => {
        const nombre = f.nombre.toLowerCase();
        const ubicacion = (f.ubicacion || '').toLowerCase();
        const descripcion = (f.descripcion || '').toLowerCase();
        
        return nombre.includes(search) || 
               ubicacion.includes(search) || 
               descripcion.includes(search);
      });
    }

    return result;
  });

  constructor(
    private farmService: FarmService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.waitForUserThenLoadFarms();
  }

  /**
   * Esperar a que el usuario se cargue antes de cargar las granjas
   */
  private waitForUserThenLoadFarms(): void {
    // Si el usuario ya está cargado, proceder directamente
    if (this.authService.currentUser()) {
      this.userLoading.set(false);
      this.loadFarms();
      return;
    }

    // Si ya se intentó cargar pero falló, reintentar
    if (this.authService.hasAttemptedProfileLoad && !this.authService.currentUser()) {
      console.log('⚠️ Usuario no cargado, reintentando...');
      this.authService.retryLoadProfile().subscribe({
        next: () => {
          this.userLoading.set(false);
          this.loadFarms();
        },
        error: (err) => {
          console.error('Error recargando perfil:', err);
          this.userLoading.set(false);
          this.error.set('Error al cargar el perfil de usuario');
        }
      });
      return;
    }

    // Esperar a que el perfil se cargue (máximo 3 segundos)
    let attempts = 0;
    const maxAttempts = 30; // 30 * 100ms = 3 segundos
    
    const checkUser = setInterval(() => {
      attempts++;
      
      if (this.authService.currentUser()) {
        clearInterval(checkUser);
        this.userLoading.set(false);
        this.loadFarms();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkUser);
        console.warn('⚠️ Timeout esperando usuario');
        this.userLoading.set(false);
        // Intentar recargar el perfil una vez
        this.authService.retryLoadProfile().subscribe({
          next: () => {
            this.loadFarms();
          },
          error: (err) => {
            console.error('Error cargando perfil:', err);
            this.error.set('Error al cargar el perfil de usuario');
          }
        });
      }
    }, 100);
  }

  loadFarms(): void {
    this.loading.set(true);
    this.error.set(null);

    this.farmService.getFarms().subscribe({
      next: (farms) => {
        this.farms.set(farms);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando granjas:', err);
        this.error.set('Error al cargar las granjas');
        this.loading.set(false);
      }
    });
  }

  onFilterChange(event: { search: string; status: FilterStatus }): void {
    this.searchTerm.set(event.search);
    this.filterStatus.set(event.status);
  }

  viewFarmPanel(farmId: number): void {
    this.router.navigate(['/farms', farmId]);
  }

  openCreateModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSaveFarm(farmData: FarmCreate): void {
    console.log('Crear granja:', farmData);
    
    this.farmService.createFarm(farmData).subscribe({
      next: (farm) => {
        console.log('Granja creada exitosamente:', farm);
        this.closeModal();
        this.loadFarms();
      },
      error: (err) => {
        console.error('Error creando granja:', err);
        this.error.set(err.error?.detail || 'Error al crear la granja');
      }
    });
  }

  onEditFarm(farm: Farm): void {
    this.selectedFarm = farm;
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedFarm = null;
  }

  onFarmUpdated(updatedFarm: Farm): void {
    this.farms.update(farms => 
      farms.map(f => f.granja_id === updatedFarm.granja_id ? updatedFarm : f)
    );
    this.closeEditModal();
  }

  // Desactivar Granja con confirm-dialog
  onDeactivateFarm(farmId: number): void {
    const farm = this.farms().find(f => f.granja_id === farmId);
    if (farm) {
      this.confirmDialogData = {
        title: 'localhost:4200 dice',
        message: `¿Desactivar la granja "${farm.nombre}"? No aparecerá en la lista de granjas activas.`,
        action: () => this.confirmDeactivate(farmId)
      };
      this.showConfirmDialog = true;
    }
  }

  confirmDeactivate(farmId: number): void {
    this.isConfirmLoading = true;

    this.farmService.updateFarm(farmId, { is_active: false }).subscribe({
      next: () => {
        this.isConfirmLoading = false;
        this.showConfirmDialog = false;
        this.confirmDialogData = null;
        this.loadFarms();
      },
      error: (err) => {
        this.isConfirmLoading = false;
        
        // Si es error de ciclo activo, mostrar confirm-dialog informativo
        if (err.status === 409 && err.error?.detail?.includes('ciclo activo')) {
          this.confirmDialogData = {
            title: 'No se puede desactivar',
            message: err.error.detail,
            action: () => this.onConfirmDialogCancel()
          };
        } else {
          // Para otros errores, cerrar dialog y mostrar error
          this.showConfirmDialog = false;
          this.confirmDialogData = null;
          this.error.set(err.error?.detail || 'Error al desactivar granja');
        }
      }
    });
  }

  // Activar Granja con confirm-dialog
  onActivateFarm(farmId: number): void {
    const farm = this.farms().find(f => f.granja_id === farmId);
    if (farm) {
      this.confirmDialogData = {
        title: 'localhost:4200 dice',
        message: `¿Activar la granja "${farm.nombre}"?`,
        action: () => this.confirmActivate(farmId)
      };
      this.showConfirmDialog = true;
    }
  }

  confirmActivate(farmId: number): void {
    this.isConfirmLoading = true;

    this.farmService.updateFarm(farmId, { is_active: true }).subscribe({
      next: () => {
        this.isConfirmLoading = false;
        this.showConfirmDialog = false;
        this.confirmDialogData = null;
        this.loadFarms();
      },
      error: (err) => {
        this.isConfirmLoading = false;
        this.error.set(err.error?.detail || 'Error al activar granja');
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

  get isAdminGlobal(): boolean {
    return this.authService.currentUser()?.is_admin_global || false;
  }

  get activeFarms(): Farm[] {
    return this.filteredFarms().filter(f => f.is_active);
  }

  get inactiveFarms(): Farm[] {
    return this.filteredFarms().filter(f => !f.is_active);
  }
}