import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Plus, Grid3x3, List, Calendar } from 'lucide-angular';
import { forkJoin, catchError, of } from 'rxjs';

import { SeedingService } from '../../services/seeding';
import { PondService } from '../../services/ponds';
import { FarmService } from '../../services/farms';
import { CycleService } from '../../services/cycles';

import { SeedingPlanWithItems, SeedingWithPondInfo } from '../../models/seeding.model';
import { Pond } from '../../models/pond.model';
import { Cycle } from '../../models/cycle.model';

import { SeedingHeader } from './seeding-header/seeding-header';
import { SeedingFilters } from './seeding-filters/seeding-filters';
import { SeedingItem } from './seeding-item/seeding-item';
import { CreatePlanModal } from './create-plan-modal/create-plan-modal';
import { ConfirmSeedingModal } from './confirm-seeding-modal/confirm-seeding-modal';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'confirmed' | 'planned' | 'cancelled';

@Component({
  selector: 'app-seeding',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    SeedingHeader,
    SeedingFilters,
    SeedingItem,
    CreatePlanModal,
    ConfirmSeedingModal
  ],
  templateUrl: './seeding.html',
  styleUrl: './seeding.scss'
})
export class SeedingPage implements OnInit {
  readonly Search = Search;
  readonly Plus = Plus;
  readonly Grid3x3 = Grid3x3;
  readonly List = List;
  readonly Calendar = Calendar;

  farmId: number | null = null;
  farmName = signal<string>('');
  
  plan = signal<SeedingPlanWithItems | null>(null);
  ponds = signal<Pond[]>([]);
  activeCycle = signal<Cycle | null>(null);
  
  loading = signal(true);
  error = signal<string | null>(null);

  // UI State
  viewMode = signal<ViewMode>('grid');
  searchTerm = signal('');
  filterStatus = signal<FilterStatus>('all');
  showCreatePlanModal = signal(false);
  showConfirmModal = signal(false);
  selectedSeedingId = signal<number | null>(null);

  // Computed: Siembras con información del estanque
  seedingsWithPondInfo = computed<SeedingWithPondInfo[]>(() => {
    const planData = this.plan();
    const pondsData = this.ponds();

    if (!planData) return [];

    return planData.siembras.map(s => {
      const pond = pondsData.find(p => p.estanque_id === s.estanque_id);
      return {
        ...s,
        pond_name: pond?.nombre || 'Desconocido',
        pond_superficie: pond ? parseFloat(pond.superficie_m2) : 0,
        densidad_efectiva: s.densidad_override_org_m2 ?? planData.densidad_org_m2,
        talla_inicial_efectiva: s.talla_inicial_override_g ?? planData.talla_inicial_g
      };
    });
  });

  // Computed: Siembras filtradas
  filteredSeedings = computed(() => {
    let seedings = this.seedingsWithPondInfo();

    // Filtro por búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      seedings = seedings.filter(s =>
        s.pond_name.toLowerCase().includes(search)
      );
    }

    // Filtro por estado
    const status = this.filterStatus();
    if (status !== 'all') {
      const statusMap: Record<FilterStatus, string> = {
        'all': '',
        'confirmed': 'f',
        'planned': 'p',
        'cancelled': 'c'
      };
      seedings = seedings.filter(s => s.status === statusMap[status]);
    }

    return seedings;
  });

  constructor(
    private seedingService: SeedingService,
    private pondService: PondService,
    private farmService: FarmService,
    private cycleService: CycleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      this.farmId = params['farmId'] ? parseInt(params['farmId']) : null;

      if (this.farmId) {
        this.loadFarmName();
        this.loadActiveCycle();
      }
    });
  }

  // ✅ NUEVO CÓDIGO
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
          this.loadData(cycle.ciclo_id);
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

  loadData(cycleId: number): void {
    if (!this.farmId) return;

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      plan: this.seedingService.getPlan(cycleId).pipe(
        catchError(() => of(null))
      ),
      ponds: this.pondService.getPonds(this.farmId)
    }).subscribe({
      next: (result) => {
        this.plan.set(result.plan);
        this.ponds.set(result.ponds);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading seeding data:', err);
        this.error.set('Error al cargar los datos de siembras');
        this.loading.set(false);
      }
    });
  }

  // Handlers de eventos
  onFilterChange(event: { search: string; status: FilterStatus }): void {
    this.searchTerm.set(event.search);
    this.filterStatus.set(event.status);
  }

  onViewModeChange(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  onCreatePlan(): void {
    this.showCreatePlanModal.set(true);
  }

  onPlanCreated(): void {
    this.showCreatePlanModal.set(false);
    const cycle = this.activeCycle();
    if (cycle) {
      this.loadData(cycle.ciclo_id);
    }
  }

  onConfirmSeeding(seedingId: number): void {
    this.selectedSeedingId.set(seedingId);
    this.showConfirmModal.set(true);
  }

  onSeedingConfirmed(): void {
    this.showConfirmModal.set(false);
    this.selectedSeedingId.set(null);
    const cycle = this.activeCycle();
    if (cycle) {
      this.loadData(cycle.ciclo_id);
    }
  }

  onReprogramSeeding(seedingId: number, data: any): void {
    this.seedingService.reprogramSeeding(seedingId, data).subscribe({
      next: () => {
        const cycle = this.activeCycle();
        if (cycle) {
          this.loadData(cycle.ciclo_id);
        }
      },
      error: (err) => {
        console.error('Error reprogramming seeding:', err);
        this.error.set('Error al reprogramar la siembra');
      }
    });
  }

  // Getters
  get hasPlan(): boolean {
    return this.plan() !== null;
  }

  get hasActiveCycle(): boolean {
    return this.activeCycle() !== null;
  }
}