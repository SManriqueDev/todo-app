import { Component, OnInit, ViewChild, inject } from '@angular/core';
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
import { CategoryService, TaskService } from '../../core/services';
import { Category } from '../../core/models';
import { trash, pencil } from 'ionicons/icons';

const POPULAR_EMOJIS = [
  '💼',
  '👤',
  '🛒',
  '🏃',
  '📚',
  '🎯',
  '💡',
  '🎨',
  '🏠',
  '💪',
  '🎵',
  '✈️',
  '🍕',
  '🎮',
  '💰',
  '🌟',
  '📱',
  '⚽',
  '🎬',
  '🌱',
  '🔧',
  '📝',
  '🎓',
  '🚗',
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
  templateUrl: './manage-categories.page.html',
  styleUrl: './manage-categories.page.scss',
})
export class ManageCategoriesPage implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly taskService = inject(TaskService);
  @ViewChild('deleteAlert') deleteAlert!: IonAlert;

  categories: Category[] = [];
  newCategoryName = '';
  selectedEmoji = '💼';
  editingId: string | null = null;
  editName = '';
  editEmoji = '';
  popularEmojis = POPULAR_EMOJIS;

  pencil = pencil;
  trash = trash;

  alertButtons = [
    { text: 'Cancelar', role: 'cancel' },
    { text: 'Eliminar', role: 'destructive', handler: () => this.deleteCategory() },
  ];

  private categoryToDelete: Category | null = null;

  constructor() {}

  ngOnInit(): void {
    this.categoryService.categories.subscribe((cats) => {
      this.categories = cats;
    });
  }

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
}
