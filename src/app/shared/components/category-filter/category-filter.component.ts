import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.scss',
})
export class CategoryFilterComponent {
  categories = input<Category[]>([]);
  activeFilter = input('all');
  filterChange = output<string>();

  onFilterChange(filter: string): void {
    this.filterChange.emit(filter);
  }
}
