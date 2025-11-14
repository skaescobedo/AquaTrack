import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, FileText, Calendar, Send } from 'lucide-angular';
import { ProjectionDetail } from '../../../models/projection.model';

@Component({
  selector: 'app-projection-draft-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './projection-draft-card.html',
  styleUrl: './projection-draft-card.scss'
})
export class ProjectionDraftCard {
  readonly FileText = FileText;
  readonly Calendar = Calendar;
  readonly Send = Send;

  @Input({ required: true }) projection!: ProjectionDetail;
  @Output() publish = new EventEmitter<number>();

  get lastLine() {
    return this.projection.lineas[this.projection.lineas.length - 1];
  }

  get finalPP(): number {
    return this.lastLine ? +this.lastLine.pp_g : 0;
  }

  get finalSOB(): number {
    return this.lastLine ? +this.lastLine.sob_pct_linea : 0;
  }

  onPublish(): void {
    if (confirm('¿Estás seguro de que deseas publicar este borrador? Esta acción marcará la versión actual como histórica.')) {
      this.publish.emit(this.projection.proyeccion_id);
    }
  }
}