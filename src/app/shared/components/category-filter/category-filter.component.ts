import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../core/models';
import { EmojiRenderService } from '../../../core/services';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.scss',
})
export class CategoryFilterComponent {
  private readonly emojiRenderService = inject(EmojiRenderService);

  categories = input<Category[]>([]);
  activeFilter = input('all');
  filterChange = output<string>();

  onFilterChange(filter: string): void {
    this.filterChange.emit(filter);
  }

  emojiUrl(emoji: string): string {
    return this.emojiRenderService.toSvgUrl(emoji);
  }
}
