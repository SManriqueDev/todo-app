import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonBackButton,
  IonList,
  IonItem,
  IonIcon,
  IonInput,
  IonCard,
  IonCardContent,
  IonAlert,
} from '@ionic/angular/standalone';
import { CategoryService, EmojiRenderService, TaskService } from '../../core/services';
import { Category } from '../../core/models';
import { trash, pencil, checkmark, close } from 'ionicons/icons';

const POPULAR_EMOJIS = [
  '\u{1F4BC}',
  '\u{1F464}',
  '\u{1F6D2}',
  '\u{1F3C3}',
  '\u{1F4DA}',
  '\u{1F3AF}',
  '\u{1F4A1}',
  '\u{1F3A8}',
  '\u{1F3E0}',
  '\u{1F4AA}',
  '\u{1F3B5}',
  '\u2708\uFE0F',
  '\u{1F355}',
  '\u{1F3AE}',
  '\u{1F4B0}',
  '\u{1F31F}',
  '\u{1F4F1}',
  '\u26BD',
  '\u{1F3AC}',
  '\u{1F331}',
  '\u{1F527}',
  '\u{1F4DD}',
  '\u{1F393}',
  '\u{1F697}',
];

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonBackButton,
    IonList,
    IonItem,
    IonIcon,
    IonInput,
    IonCard,
    IonCardContent,
    IonAlert,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manage-categories.page.html',
  styleUrl: './manage-categories.page.scss',
})
export class ManageCategoriesPage {
  private readonly categoryService = inject(CategoryService);
  private readonly taskService = inject(TaskService);
  private readonly emojiRenderService = inject(EmojiRenderService);
  @ViewChild('deleteAlert') deleteAlert!: IonAlert;

  readonly categories = this.categoryService.categories;
  newCategoryName = '';
  selectedEmoji = '\u{1F4BC}';
  editingId: string | null = null;
  editName = '';
  editEmoji = '';
  popularEmojis = POPULAR_EMOJIS;

  pencil = pencil;
  trash = trash;
  checkmark = checkmark;
  close = close;

  alertButtons = [
    { text: 'Cancelar', role: 'cancel' },
    { text: 'Eliminar', role: 'destructive', handler: () => this.deleteCategory() },
  ];

  private categoryToDelete: Category | null = null;

  constructor() {}

  selectEmoji(emoji: string): void {
    this.selectedEmoji = emoji;
  }

  cycleEmoji(): void {
    const currentIndex = POPULAR_EMOJIS.indexOf(this.editEmoji);
    const nextIndex = (currentIndex + 1) % POPULAR_EMOJIS.length;
    this.editEmoji = POPULAR_EMOJIS[nextIndex];
  }

  async addCategory(): Promise<void> {
    if (this.newCategoryName.trim()) {
      await this.categoryService.add(this.newCategoryName, this.selectedEmoji);
      this.newCategoryName = '';
      this.selectedEmoji = POPULAR_EMOJIS[0];
    }
  }

  startEdit(category: Category): void {
    this.editingId = category.id;
    this.editName = category.name;
    this.editEmoji = category.emoji;
  }

  async saveEdit(): Promise<void> {
    if (this.editingId && this.editName.trim()) {
      await this.categoryService.update(this.editingId, this.editName, this.editEmoji);
      this.editingId = null;
    }
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  confirmDelete(category: Category): void {
    this.categoryToDelete = category;
    this.deleteAlert.present();
  }

  async deleteCategory(): Promise<void> {
    if (this.categoryToDelete) {
      await this.taskService.deleteByCategory(this.categoryToDelete.id);
      await this.categoryService.delete(this.categoryToDelete.id);
      this.categoryToDelete = null;
    }
  }

  emojiUrl(emoji: string): string {
    return this.emojiRenderService.toSvgUrl(emoji);
  }
}
