import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Package, Grid3x3, List } from 'lucide-angular';
import { forkJoin, catchError, of } from 'rxjs';

import { HarvestService } from '../../../services/harvest';
import { PondService } from '../../../services/ponds';

import { HarvestWaveWithItems, HarvestLineWithPondInfo, HarvestReprogram } from '../../../models/harvest.model';
import { Pond } from '../../../models/pond.model';

import { WaveDetailHeader } from './wave-detail-header/wave-detail-header';
import { HarvestFilters } from './harvest-filters/harvest-filters';
import { HarvestItem } from './harvest-item/harvest-item';
import { ConfirmHarvestModal } from './confirm-harvest-modal/confirm-harvest-modal';
import { CancelWaveModal } from './cancel-wave-modal/cancel-wave-modal';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'confirmed' | 'pending' | 'cancelled';

@Component({
  selector: 'app-wave-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    WaveDetailHeader,
    HarvestFilters,
    HarvestItem,
    ConfirmHarvestModal,
    CancelWaveModal
  ],
  templateUrl: './wave-detail.html',
  styleUrl: './wave-detail.scss'
})
export class WaveDetailPage implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Package = Package;
  readonly Grid3x3 = Grid3x3;
  readonly List = List;

  waveId: number | null = null;
  farmId: number | null = null;

  wave = signal<HarvestWaveWithItems | null>(null);
  ponds = signal<Pond[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);

  // UI State
  viewMode = signal<ViewMode>('grid');
  searchTerm = signal('');
  filterStatus = signal<FilterStatus>('all');
  showConfirmModal = signal(false);
  showCancelWaveModal = signal(false);
  selectedHarvestId = signal<number | null>(null);

  // Computed: Cosechas con información del estanque
  harvestsWithPondInfo = computed<HarvestLineWithPondInfo[]>(() => {
    const waveData = this.wave();
    const pondsData = this.ponds();

    console.log('🔄 Computed harvestsWithPondInfo');
    console.log('📦 Wave data:', waveData);
    console.log('🏊 Ponds data:', pondsData.length, 'estanques');

    if (!waveData) return [];

    return waveData.cosechas.map(h => {
      const pond = pondsData.find(p => p.estanque_id === h.estanque_id);
      console.log(`🔍 Buscando estanque ${h.estanque_id}:`, pond ? `Encontrado: ${pond.nombre}` : 'NO ENCONTRADO');
      
      return {
        ...h,
        pond_name: pond?.nombre || 'Desconocido',
        pond_superficie: pond ? parseFloat(pond.superficie_m2) : 0,
      };
    });
  });

  // Computed: Cosechas filtradas
  filteredHarvests = computed(() => {
    let harvests = this.harvestsWithPondInfo();

    // Filtro por búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      harvests = harvests.filter(h =>
        h.pond_name.toLowerCase().includes(search)
      );
    }

    // Filtro por estado
    const status = this.filterStatus();
    if (status !== 'all') {
      const statusMap: Record<FilterStatus, string> = {
        'all': '',
        'confirmed': 'c',
        'pending': 'p',
        'cancelled': 'x'
      };
      harvests = harvests.filter(h => h.status === statusMap[status]);
    }

    return harvests;
  });

  // Computed: Estadísticas
  stats = computed(() => {
    const waveData = this.wave();
    if (!waveData) return null;

    const total = waveData.cosechas.length;
    const pending = waveData.cosechas.filter(h => h.status === 'p').length;
    const confirmed = waveData.cosechas.filter(h => h.status === 'c').length;
    const cancelled = waveData.cosechas.filter(h => h.status === 'x').length;

    return {
      total,
      pending,
      confirmed,
      cancelled
    };
  });

  constructor(
    private harvestService: HarvestService,
    private pondService: PondService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🔍 WaveDetailPage - ngOnInit');
    
    // ✅ PRIMERO: Obtener farmId del árbol de rutas
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute) {
      const farmIdParam = currentRoute.snapshot.paramMap.get('farmId');
      if (farmIdParam) {
        this.farmId = parseInt(farmIdParam);
        console.log('🏭 Farm ID encontrado:', this.farmId);
        break;
      }
      currentRoute = currentRoute.parent;
    }

    if (!this.farmId) {
      console.error('❌ No se encontró farmId en la jerarquía de rutas');
    }

    // ✅ SEGUNDO: Obtener waveId y cargar datos
    this.route.params.subscribe(params => {
      console.log('📍 Route params:', params);
      this.waveId = params['waveId'] ? parseInt(params['waveId']) : null;
      console.log('🌊 Wave ID:', this.waveId);

      if (this.waveId) {
        this.loadData();
      } else {
        console.error('❌ No se encontró waveId');
        this.loading.set(false);
        this.error.set('No se pudo obtener el ID de la ola');
      }
    });
  }

  loadData(): void {
    if (!this.waveId) return;

    console.log('📦 loadData - waveId:', this.waveId);
    console.log('🏭 loadData - farmId:', this.farmId);

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      wave: this.harvestService.getWaveWithItems(this.waveId),
      ponds: this.farmId ? this.pondService.getPonds(this.farmId) : of([])
    }).subscribe({
      next: (result) => {
        console.log('✅ Wave cargada:', result.wave);
        console.log('✅ Ponds cargados:', result.ponds.length, 'estanques');
        console.log('🏊 Lista de estanques:', result.ponds.map(p => `${p.estanque_id}: ${p.nombre}`));
        
        this.wave.set(result.wave);
        this.ponds.set(result.ponds);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading wave detail:', err);
        this.error.set('Error al cargar el detalle de la ola');
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

  onConfirmHarvest(harvestId: number): void {
    this.selectedHarvestId.set(harvestId);
    this.showConfirmModal.set(true);
  }

  onHarvestConfirmed(): void {
    this.showConfirmModal.set(false);
    this.selectedHarvestId.set(null);
    this.loadData();
  }

  onReprogramHarvest(harvestId: number, data: HarvestReprogram): void {
    this.harvestService.reprogramHarvest(harvestId, data).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        console.error('Error reprogramming harvest:', err);
        this.error.set('Error al reprogramar la cosecha');
      }
    });
  }

  onCancelWave(): void {
    this.showCancelWaveModal.set(true);
  }

  onWaveCancelled(): void {
    this.showCancelWaveModal.set(false);
    // Volver a la lista de olas
    this.goBack();
  }

  goBack(): void {
    // Navegar de vuelta a la lista de olas
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  // Getters
  get hasWave(): boolean {
    return this.wave() !== null;
  }

  get selectedHarvest(): HarvestLineWithPondInfo | undefined {
    const id = this.selectedHarvestId();
    if (!id) return undefined;
    return this.harvestsWithPondInfo().find(h => h.cosecha_estanque_id === id);
  }
}