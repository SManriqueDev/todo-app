import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonItemSliding,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonBadge,
  IonItemOptions,
  IonItemOption,
} from '@ionic/angular/standalone';
import { IonIcon } from '@ionic/angular/standalone';
import { trash } from 'ionicons/icons';
import { Task, Category } from '../../../core/models';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [
    CommonModule,
    IonItemSliding,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonBadge,
    IonItemOptions,
    IonItemOption,
    IonIcon,
  ],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss',
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Input() category!: Category | undefined;
  @Output() toggleTask = new EventEmitter<string>();
  @Output() deleteTask = new EventEmitter<string>();

  trash = trash;

  onToggle(): void {
    console.log('Toggling task:', this.task.id);
    this.toggleTask.emit(this.task.id);
  }

  onDelete(): void {
    this.deleteTask.emit(this.task.id);
  }
}
