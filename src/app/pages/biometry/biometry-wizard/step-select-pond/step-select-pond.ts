import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pond } from '../../../../models/pond.model';

@Component({
  selector: 'app-step-select-pond',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-select-pond.html',
  styleUrl: './step-select-pond.scss'
})
export class StepSelectPond {
  @Input({ required: true }) ponds: Pond[] = [];
  @Input() selectedPondId: number | null = null;
  @Output() pondSelected = new EventEmitter<number>();

  onPondChange(pondId: string): void {
    if (pondId) {
      this.pondSelected.emit(Number(pondId));
    }
  }
}