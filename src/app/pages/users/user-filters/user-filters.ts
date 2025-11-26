// user-filters.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter } from 'lucide-angular';

type FilterStatus = 'active' | 'inactive' | 'all';

@Component({
  selector: 'app-user-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './user-filters.html',
  styleUrl: './user-filters.scss'
})
export class UserFilters {
  readonly Search = Search;
  readonly Filter = Filter;

  @Output() filterChange = new EventEmitter<{ search: string; status: FilterStatus }>();

  searchTerm = '';
  filterStatus: FilterStatus = 'active';

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
}