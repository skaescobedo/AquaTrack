// profile-farms/profile-farms.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Building2, Shield } from 'lucide-angular';
import { User, UserFarm } from '../../../models/user.model';

@Component({
  selector: 'app-profile-farms',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './profile-farms.html',
  styleUrl: './profile-farms.scss'
})
export class ProfileFarms {
  readonly Building2 = Building2;
  readonly Shield = Shield;

  @Input({ required: true }) user!: User;
  @Input({ required: true }) userFarms!: UserFarm[];
}