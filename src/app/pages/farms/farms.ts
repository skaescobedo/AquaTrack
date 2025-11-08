import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Building2, Plus } from 'lucide-angular';
import { FarmService } from '../../services/farms';
import { AuthService } from '../../services/auth';
import { Farm, FarmCreate } from '../../models/farm.model';
import { FarmCard } from './farm-card/farm-card';
import { FarmModal } from './farm-modal/farm-modal';

@Component({
  selector: 'app-farms',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FarmCard, FarmModal],
  templateUrl: './farms.html',
  styleUrls: ['./farms.scss']
})
export class Farms implements OnInit {
  readonly Building2 = Building2;
  readonly Plus = Plus;
  
  farms = signal<Farm[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showModal = signal(false);
  userLoading = signal(true);

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

  get isAdminGlobal(): boolean {
    return this.authService.currentUser()?.is_admin_global || false;
  }

  get activeFarms(): Farm[] {
    return this.farms().filter(f => f.is_active);
  }

  get inactiveFarms(): Farm[] {
    return this.farms().filter(f => !f.is_active);
  }
}