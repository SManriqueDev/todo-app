import { ChangeDetectionStrategy, Component, ViewChild, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonInput,
} from '@ionic/angular/standalone';
import { IonIcon } from '@ionic/angular/standalone';
import { close } from 'ionicons/icons';
import { CategoryService, TaskService } from '../../../core/services';

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonInput,
    IonIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-task-modal.component.html',
  styleUrl: './create-task-modal.component.scss',
})
export class CreateTaskModalComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly taskService = inject(TaskService);
  @ViewChild('createModal') modal!: IonModal;

  taskTitle = '';
  selectedCategoryId = '';
  readonly categories = this.categoryService.categories;

  close = close;

  constructor() {
    effect(() => {
      const categories = this.categories();
      if (!this.selectedCategoryId && categories.length > 0) {
        this.selectedCategoryId = categories[0].id;
      }
    });
  }

  selectCategory(id: string): void {
    this.selectedCategoryId = id;
  }

  async onSave(): Promise<void> {
    if (this.taskTitle.trim() && this.selectedCategoryId) {
      await this.taskService.add(this.taskTitle, this.selectedCategoryId);
      this.taskTitle = '';
      this.dismiss();
    }
  }

  dismiss(): void {
    this.modal?.dismiss();
  }

  onDismiss(): void {
    this.taskTitle = '';
  }

  open(): void {
    this.modal?.present();
  }
}
