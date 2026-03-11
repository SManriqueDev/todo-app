import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  effect,
  inject,
  input,
  output,
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
import { EmojiRenderService } from '../../../core/services';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss',
})
export class TaskItemComponent {
  task = input.required<Task>();
  category = input<Category | undefined>();
  toggleTask = output<string>();
  deleteTask = output<string>();
  @ViewChild(IonItemSliding) slidingItem?: IonItemSliding;

  trash = trash;
  private readonly emojiRenderService = inject(EmojiRenderService);

  constructor() {
    effect(() => {
      this.task();
      if (this.firstTaskEmission) {
        this.firstTaskEmission = false;
        return;
      }
      void this.slidingItem?.close();
    });
  }

  private firstTaskEmission = true;

  onToggle(): void {
    this.toggleTask.emit(this.task().id);
  }

  onDelete(): void {
    void this.slidingItem?.close();
    this.deleteTask.emit(this.task().id);
  }

  emojiUrl(emoji: string): string {
    return this.emojiRenderService.toSvgUrl(emoji);
  }
}
