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
import { forkJoin, catchError, of } from 'rxjs';

@Component({
  selector: 'app-ponds',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PondCard, PondModal],
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
  showModal = signal(false);

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

    // Cargar granja, estanques y ciclo activo en paralelo
    forkJoin({
      farms: this.farmService.getFarms(),
      ponds: this.pondService.getPonds(this.farmId),
      activeCycle: this.cycleService.getActiveCycle(this.farmId).pipe(
        catchError(() => of(null)) // Si no hay ciclo activo, retornar null
      )
    }).subscribe({
      next: (result) => {
        // Buscar la granja actual
        const farm = result.farms.find(f => f.granja_id === this.farmId);
        this.currentFarm.set(farm || null);
        
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
      next: (pond) => {
        console.log('Estanque creado exitosamente:', pond);
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        console.error('Error creando estanque:', err);
        this.error.set(err.error?.detail || 'Error al crear el estanque');
      }
    });
  }

  get canManagePonds(): boolean {
    // TODO: Implementar verificación de permisos (gestionar_estanques)
    return this.authService.currentUser()?.is_admin_global || false;
  }

  get vigentePonds(): Pond[] {
    return this.ponds().filter(p => p.is_vigente);
  }

  get nonVigentePonds(): Pond[] {
    return this.ponds().filter(p => !p.is_vigente);
  }

  // Superficie total de la granja (en m²)
  get totalSuperficieGranja(): number {
    return this.currentFarm()?.superficie_total_m2 || 0;
  }

  // Suma de superficie vigente de los estanques (en m²)
  get superficieVigente(): number {
    return this.vigentePonds.reduce((sum, p) => sum + parseFloat(p.superficie_m2), 0);
  }

  // Superficie vigente operativa (solo estanques activos)
  get superficieOperativa(): number {
    return this.vigentePonds
      .filter(p => p.status === 'a')
      .reduce((sum, p) => sum + parseFloat(p.superficie_m2), 0);
  }

  // Porcentaje utilizado (vigente / total granja)
  get porcentajeUtilizado(): number {
    if (this.totalSuperficieGranja === 0) return 0;
    return (this.superficieVigente / this.totalSuperficieGranja) * 100;
  }

  // Helper para convertir m² a hectáreas
  m2ToHa(m2: number): string {
    return (m2 / 10000).toFixed(2);
  }

  get farmName(): string {
    return this.currentFarm()?.nombre || '';
  }
}