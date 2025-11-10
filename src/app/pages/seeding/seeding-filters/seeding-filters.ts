import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Grid3x3, List, Filter } from 'lucide-angular';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'confirmed' | 'planned' | 'cancelled';

@Component({
  selector: 'app-seeding-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './seeding-filters.html',
  styleUrl: './seeding-filters.scss'
})
export class SeedingFilters {
  readonly Search = Search;
  readonly Grid3x3 = Grid3x3;
  readonly List = List;
  readonly Filter = Filter;

  @Input() viewMode: ViewMode = 'grid';
  @Output() filterChange = new EventEmitter<{ search: string; status: FilterStatus }>();
  @Output() viewModeChange = new EventEmitter<ViewMode>();

  searchTerm = '';
  filterStatus: FilterStatus = 'all';

  onSearchChange(): void {
    this.emitFilterChange();
  }

  onStatusChange(): void {
    this.emitFilterChange();
  }

  private emitFilterChange(): void {
    this.filterChange.emit({
      search: this.searchTerm,
      status: this.filterStatus
    });
  }

  onViewModeToggle(mode: ViewMode): void {
    this.viewModeChange.emit(mode);
  }
}