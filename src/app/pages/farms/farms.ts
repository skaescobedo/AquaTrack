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

  constructor(
    private farmService: FarmService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFarms();
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