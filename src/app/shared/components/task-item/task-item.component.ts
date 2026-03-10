import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
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
export class TaskItemComponent implements OnChanges {
  @Input() task!: Task;
  @Input() category!: Category | undefined;
  @Output() toggleTask = new EventEmitter<string>();
  @Output() deleteTask = new EventEmitter<string>();
  @ViewChild(IonItemSliding) slidingItem?: IonItemSliding;

  trash = trash;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['task'] || changes['task'].firstChange || !this.slidingItem) {
      return;
    }
    void this.slidingItem.close();
  }

  onToggle(): void {
    this.toggleTask.emit(this.task.id);
  }

  onDelete(): void {
    void this.slidingItem?.close();
    this.deleteTask.emit(this.task.id);
  }
}
