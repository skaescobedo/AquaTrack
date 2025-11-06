import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Building2, Users, User, LogOut, Menu, X } from 'lucide-angular';
import { AuthService } from '../../services/auth';

interface NavItem {
  label: string;
  icon: any;
  route: string;
  requiresAdmin?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
    LucideAngularModule
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayout {
  // Iconos disponibles en el template
  readonly Building2 = Building2;
  readonly Users = Users;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly Menu = Menu;
  readonly X = X;
  
  sidebarOpen = signal(false); // Cerrado por defecto en mobile
  isMobile = signal(false);
  
  navItems: NavItem[] = [
    { label: 'Mis Granjas', icon: Building2, route: '/farms' },
    { label: 'Gestión de Usuarios', icon: Users, route: '/users', requiresAdmin: true },
    { label: 'Mi Perfil', icon: User, route: '/profile' },
  ];

  constructor(public authService: AuthService) {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const width = window.innerWidth;
    this.isMobile.set(width < 1024);
    
    // Si cambia a desktop, abrir sidebar; si es mobile, cerrar
    if (!this.isMobile()) {
      this.sidebarOpen.set(true);
    } else {
      this.sidebarOpen.set(false);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(val => !val);
  }

  closeSidebarIfMobile(): void {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  logout(): void {
    this.authService.logout();
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  get userInitials(): string {
    const user = this.currentUser;
    if (!user) return '';
    return `${user.nombre[0]}${user.apellido1[0]}`.toUpperCase();
  }

  shouldShowNavItem(item: NavItem): boolean {
    if (item.requiresAdmin) {
      return this.currentUser?.is_admin_global || false;
    }
    return true;
  }
}