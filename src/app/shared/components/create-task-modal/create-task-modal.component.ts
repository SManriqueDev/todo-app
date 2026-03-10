import { Component, ViewChild, inject } from '@angular/core';
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
import { Category } from '../../../core/models';
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
  templateUrl: './create-task-modal.component.html',
  styleUrl: './create-task-modal.component.scss',
})
export class CreateTaskModalComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly taskService = inject(TaskService);
  @ViewChild('createModal') modal!: IonModal;

  taskTitle = '';
  selectedCategoryId = '';
  categories: Category[] = [];

  close = close;

  constructor() {
    this.categoryService.categories.subscribe((cats) => {
      this.categories = cats;
      if (!this.selectedCategoryId && cats.length > 0) {
        this.selectedCategoryId = cats[0].id;
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
