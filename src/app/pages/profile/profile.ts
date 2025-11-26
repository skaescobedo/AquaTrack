// profile.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, User as UserIcon } from 'lucide-angular';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/users';
import { User, UserFarm } from '../../models/user.model';

import { ProfileInfo } from './profile-info/profile-info';
import { ProfileSecurity } from './profile-security/profile-security';
import { ProfileFarms } from './profile-farms/profile-farms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ProfileInfo,
    ProfileSecurity,
    ProfileFarms
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  readonly UserIcon = UserIcon;

  loading = signal(true);
  error = signal<string | null>(null);
  userFarms = signal<UserFarm[]>([]);

  constructor(
    public authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserFarms();
  }

  get currentUser(): User | null {
    return this.authService.currentUser();
  }

  get userInitials(): string {
    const user = this.currentUser;
    if (!user) return '';
    return `${user.nombre[0]}${user.apellido1[0]}`.toUpperCase();
  }

  loadUserFarms(): void {
    const user = this.currentUser;
    if (!user) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.userService.getUserFarms(user.usuario_id).subscribe({
      next: (farms) => {
        this.userFarms.set(farms);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading user farms:', err);
        this.error.set('Error al cargar granjas');
        this.loading.set(false);
      }
    });
  }

  onUserUpdated(): void {
    // Recargar perfil del usuario
    this.authService.loadUserProfile().subscribe({
      next: () => {
        console.log('Perfil actualizado');
      },
      error: (err) => {
        console.error('Error recargando perfil:', err);
      }
    });
  }
}