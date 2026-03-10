import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.scss',
})
export class CategoryFilterComponent {
  @Input() categories: Category[] = [];
  @Input() activeFilter: string = 'all';
  @Output() filterChange = new EventEmitter<string>();

  onFilterChange(filter: string): void {
    this.filterChange.emit(filter);
  }
}
