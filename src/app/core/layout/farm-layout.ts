import { Component, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Home, ArrowLeft, Menu, X, Waves, Sprout, Activity, Package, TrendingUp, FileText, History, ListChecks } from 'lucide-angular';
import { AuthService } from '../../services/auth';
import { FarmService } from '../../services/farms';
import { Farm } from '../../models/farm.model';
import { map } from 'rxjs/operators';

interface FarmNavItem {
  label: string;
  icon: any;
  route: string;
}

@Component({
  selector: 'app-farm-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './farm-layout.html',
  styleUrls: ['./farm-layout.scss']
})
export class FarmLayout implements OnInit {
  readonly Home = Home;
  readonly ArrowLeft = ArrowLeft;
  readonly Menu = Menu;
  readonly X = X;

  sidebarOpen = signal(false);
  isMobile = signal(false);
  currentFarm = signal<Farm | null>(null);
  farmId: number | null = null;

  farmNavItems: FarmNavItem[] = [
    { label: 'Panel de Ciclo', icon: Home, route: 'dashboard' },
    { label: 'Estanques', icon: Waves, route: 'ponds' },
    { label: 'Siembras', icon: Sprout, route: 'seedings' },
    { label: 'Biometrías', icon: Activity, route: 'biometrics' },
    { label: 'Cosechas', icon: Package, route: 'harvests' },
    { label: 'Proyecciones', icon: TrendingUp, route: 'projections' },
    { label: 'Reportes', icon: FileText, route: 'reports' },
    { label: 'Historial de Ciclos', icon: History, route: 'history' },
    { label: 'Bitácora de Tareas', icon: ListChecks, route: 'tasks' },
  ];

  constructor(
    public authService: AuthService,
    private farmService: FarmService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.farmId = params['farmId'] ? parseInt(params['farmId']) : null;
      if (this.farmId) {
        this.loadFarmData();
      }
    });
  }

  loadFarmData(): void {
    if (!this.farmId) return;

    // Obtener todas las granjas y filtrar la actual
    this.farmService.getFarms().pipe(
      map(farms => farms.find(f => f.granja_id === this.farmId) || null)
    ).subscribe({
      next: (farm) => {
        if (farm) {
          this.currentFarm.set(farm);
        } else {
          console.error('Granja no encontrada');
          this.router.navigate(['/farms']);
        }
      },
      error: (err) => {
        console.error('Error cargando granja:', err);
        this.router.navigate(['/farms']);
      }
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const width = window.innerWidth;
    this.isMobile.set(width < 1024);
    this.sidebarOpen.set(!this.isMobile());
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(val => !val);
  }

  closeSidebarIfMobile(): void {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  goBackToFarms(): void {
    this.router.navigate(['/farms']);
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  get userInitials(): string {
    const user = this.currentUser;
    if (!user) return '';
    return `${user.nombre[0]}${user.apellido1[0]}`.toUpperCase();
  }
}