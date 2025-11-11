import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { forkJoin, catchError, of } from 'rxjs';

import { BiometryService } from '../../services/biometry';
import { PondService } from '../../services/ponds';
import { CycleService } from '../../services/cycles';
import { FarmService } from '../../services/farms';

import { BiometryList } from '../../models/biometry.model';
import { Pond } from '../../models/pond.model';
import { Cycle } from '../../models/cycle.model';

import { BiometryTable } from './biometry-table/biometry-table';
import { BiometryWizard } from './biometry-wizard/biometry-wizard';

@Component({
  selector: 'app-biometry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    BiometryTable,
    BiometryWizard
  ],
  templateUrl: './biometry.html',
  styleUrl: './biometry.scss'
})
export class Biometry implements OnInit {
  readonly Plus = Plus;

  farmId: number | null = null;
  farmName = signal<string>('');
  activeCycle = signal<Cycle | null>(null);
  ponds = signal<Pond[]>([]);
  biometries = signal<BiometryList[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);

  // UI State
  selectedPondId = signal<number | null>(null);
  showWizard = signal(false);

  // Computed: Biometrías filtradas
  filteredBiometries = computed(() => {
    const all = this.biometries();
    const pondId = this.selectedPondId();

    if (!pondId) return all;

    // Filtrar por estanque (necesitarás agregar estanque_id al modelo BiometryList)
    return all;
  });

  constructor(
    private biometryService: BiometryService,
    private pondService: PondService,
    private cycleService: CycleService,
    private farmService: FarmService,
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

  loadFarmName(): void {
    if (!this.farmId) return;

    this.farmService.getFarms().subscribe({
      next: (farms) => {
        const farm = farms.find(f => f.granja_id === this.farmId);
        if (farm) {
          this.farmName.set(farm.nombre);
        }
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
        this.error.set('Error al cargar el ciclo activo');
        this.loading.set(false);
      }
    });
  }

  loadData(cycleId: number): void {
    if (!this.farmId) return;

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      ponds: this.pondService.getPonds(this.farmId, true).pipe(
        catchError(err => {
          console.error('Error loading ponds:', err);
          return of([]);
        })
      ),
      biometries: this.biometryService.getCycleHistory(cycleId).pipe(
        catchError(err => {
          console.error('Error loading biometries:', err);
          return of([]);
        })
      )
    }).subscribe({
      next: ({ ponds, biometries }) => {
        this.ponds.set(ponds);
        this.biometries.set(biometries);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error.set('Error al cargar los datos');
        this.loading.set(false);
      }
    });
  }

  onOpenWizard(): void {
    this.showWizard.set(true);
  }

  onCloseWizard(): void {
    this.showWizard.set(false);
  }

  onBiometryCreated(): void {
    this.showWizard.set(false);
    const cycleId = this.activeCycle()?.ciclo_id;
    if (cycleId) {
      this.loadData(cycleId);
    }
  }

  onFilterChange(pondId: number | null): void {
    this.selectedPondId.set(pondId);
    
    const cycle = this.activeCycle();
    if (!cycle) return;

    if (pondId) {
      // Cargar biometrías de un estanque específico
      this.biometryService.getHistory(cycle.ciclo_id, pondId).subscribe({
        next: (biometries) => {
          this.biometries.set(biometries);
        },
        error: (err) => {
          console.error('Error loading pond biometries:', err);
        }
      });
    } else {
      // Cargar todas las biometrías del ciclo
      this.biometryService.getCycleHistory(cycle.ciclo_id).subscribe({
        next: (biometries) => {
          this.biometries.set(biometries);
        },
        error: (err) => {
          console.error('Error loading cycle biometries:', err);
        }
      });
    }
  }

  // Helper para convertir string a number
  toNumber(value: string): number {
    return Number(value);
  }
}