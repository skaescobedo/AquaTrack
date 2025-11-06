import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle } from 'lucide-angular';
import { FarmService } from '../../../../services/farms';
import { Farm } from '../../../../models/farm.model';

interface FarmRole {
  granja_id: number;
  granja_nombre: string;
  rol_id: number | null;
}

@Component({
  selector: 'app-step-farm-assignment',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './step-farm-assignment.html'
})
export class StepFarmAssignment implements OnInit {
  readonly AlertTriangle = AlertTriangle;

  @Input({ required: true }) isAdminGlobal!: boolean;
  @Output() rolesChange = new EventEmitter<FarmRole[]>();

  farms = signal<Farm[]>([]);
  farmRoles = signal<FarmRole[]>([]);

  roles = [
    { id: 1, nombre: 'Admin Granja' },
    { id: 2, nombre: 'Biólogo' },
    { id: 3, nombre: 'Operador' },
    { id: 4, nombre: 'Consultor' }
  ];

  constructor(private farmService: FarmService) {}

  ngOnInit(): void {
    this.loadFarms();
  }

  loadFarms(): void {
    this.farmService.getFarms().subscribe({
      next: (farms) => {
        this.farms.set(farms);
        this.farmRoles.set(
          farms.map(f => ({
            granja_id: f.granja_id,
            granja_nombre: f.nombre,
            rol_id: null
          }))
        );
      }
    });
  }

  updateFarmRole(granjaId: number, rolId: number | null): void {
    const roles = this.farmRoles();
    const index = roles.findIndex(fr => fr.granja_id === granjaId);
    if (index !== -1) {
      roles[index].rol_id = rolId === 0 ? null : rolId;
      this.farmRoles.set([...roles]);
      this.rolesChange.emit(roles);
    }
  }

  get hasAtLeastOneRole(): boolean {
    if (this.isAdminGlobal) return true;
    return this.farmRoles().some(fr => fr.rol_id !== null);
  }
}