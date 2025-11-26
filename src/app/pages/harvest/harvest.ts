import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, Package, Plus, Grid3x3, List, Calendar } from 'lucide-angular';

import { HarvestService } from '../../services/harvest';
import { CycleService } from '../../services/cycles';
import { FarmService } from '../../services/farms';

import { HarvestWave } from '../../models/harvest.model';
import { Cycle } from '../../models/cycle.model';

import { HarvestHeader } from './harvest-header/harvest-header';
import { WaveCard } from './wave-card/wave-card';
import { CreateWaveModal } from './create-wave-modal/create-wave-modal';

type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-harvest',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    HarvestHeader,
    WaveCard,
    CreateWaveModal
  ],
  templateUrl: './harvest.html',
  styleUrl: './harvest.scss'
})
export class HarvestPage implements OnInit {
  readonly Package = Package;
  readonly Plus = Plus;
  readonly Grid3x3 = Grid3x3;
  readonly List = List;
  readonly Calendar = Calendar;

  farmId: number | null = null;
  farmName = signal<string>('');
  
  waves = signal<HarvestWave[]>([]);
  activeCycle = signal<Cycle | null>(null);
  
  loading = signal(true);
  error = signal<string | null>(null);

  // UI State
  viewMode = signal<ViewMode>('grid');
  showCreateWaveModal = signal(false);

  constructor(
    private harvestService: HarvestService,
    private cycleService: CycleService,
    private farmService: FarmService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🔍 HarvestPage - ngOnInit');
    
    this.route.parent?.params.subscribe(params => {
      console.log('📍 Parent params:', params);
      this.farmId = params['farmId'] ? parseInt(params['farmId']) : null;
      console.log('🏭 Farm ID:', this.farmId);

      if (this.farmId) {
        this.loadFarmName();
        this.loadActiveCycle();
      } else {
        console.error('❌ No se encontró farmId');
        this.loading.set(false);
        this.error.set('No se pudo obtener el ID de la granja');
      }
    });
  }

  loadFarmName(): void {
    if (!this.farmId) return;

    this.farmService.getFarm(this.farmId).subscribe({
      next: (farm) => {
        this.farmName.set(farm.nombre);
      },
      error: (err) => {
        console.error('Error loading farm:', err);
      }
    });
  }

  loadActiveCycle(): void {
    if (!this.farmId) return;

    this.cycleService.getActiveCycle(this.farmId).subscribe({
      next: (cycle) => {
        this.activeCycle.set(cycle);
        if (cycle) {
          this.loadWaves(cycle.ciclo_id);
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading active cycle:', err);
        this.loading.set(false);
      }
    });
  }

  loadWaves(cycleId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.harvestService.getWaves(cycleId).subscribe({
      next: (waves) => {
        this.waves.set(waves);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading waves:', err);
        this.error.set('Error al cargar las olas de cosecha');
        this.loading.set(false);
      }
    });
  }

  // Handlers de eventos
  onViewModeChange(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  onCreateWave(): void {
    this.showCreateWaveModal.set(true);
  }

  onWaveCreated(): void {
    this.showCreateWaveModal.set(false);
    const cycle = this.activeCycle();
    if (cycle) {
      this.loadWaves(cycle.ciclo_id);
    }
  }

  onWaveClick(waveId: number): void {
    // Navegar al detalle de la ola
    this.router.navigate(['wave', waveId], { relativeTo: this.route });
  }

  onCancelWave(waveId: number): void {
    if (!confirm('¿Estás seguro de cancelar esta ola? Esta acción no se puede deshacer.')) {
      return;
    }

    this.harvestService.cancelWave(waveId).subscribe({
      next: () => {
        const cycle = this.activeCycle();
        if (cycle) {
          this.loadWaves(cycle.ciclo_id);
        }
      },
      error: (err) => {
        console.error('Error cancelling wave:', err);
        alert('Error al cancelar la ola: ' + (err.error?.detail || 'Error desconocido'));
      }
    });
  }

  // Getters
  get hasActiveCycle(): boolean {
    return this.activeCycle() !== null;
  }

  get hasWaves(): boolean {
    return this.waves().length > 0;
  }
}