import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonList,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { GamificationHeaderComponent } from '../../shared/components/gamification-header/gamification-header.component';
import { CategoryFilterComponent } from '../../shared/components/category-filter/category-filter.component';
import { TaskItemComponent } from '../../shared/components/task-item/task-item.component';
import { CreateTaskModalComponent } from '../../shared/components/create-task-modal/create-task-modal.component';
import { CategoryService, TaskService } from '../../core/services';
import { Task, Category } from '../../core/models';
import { settings, add } from 'ionicons/icons';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ScrollingModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonButton,
    IonList,
    IonFab,
    IonFabButton,
    IonIcon,
    GamificationHeaderComponent,
    CategoryFilterComponent,
    TaskItemComponent,
    CreateTaskModalComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  @ViewChild('createModal') createModal!: CreateTaskModalComponent;

  activeFilter = 'all';
  categories: Category[] = [];
  tasks: Task[] = [];
  filteredTasks: Task[] = [];

  settings = settings;
  add = add;
  readonly isDevMode = !environment.production;

  constructor() {}

  ngOnInit(): void {
    this.categoryService.categories.subscribe((cats) => {
      this.categories = cats;
      this.updateFilteredTasks();
    });

    this.taskService.tasks.subscribe((tasks) => {
      this.tasks = tasks;
      this.updateFilteredTasks();
    });
  }

  onFilterChange(filter: string): void {
    this.activeFilter = filter;
    this.updateFilteredTasks();
  }

  private updateFilteredTasks(): void {
    if (this.activeFilter === 'all') {
      this.filteredTasks = this.tasks;
    } else {
      this.filteredTasks = this.tasks.filter((t) => t.categoryId === this.activeFilter);
    }
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find((c) => c.id === id);
  }

  async onToggleTask(taskId: string): Promise<void> {
    await this.taskService.toggle(taskId);
  }

  async onDeleteTask(taskId: string): Promise<void> {
    await this.taskService.delete(taskId);
  }

  openCreateTask(): void {
    this.createModal.open();
  }

  navigateToCategories(): void {
    this.router.navigate(['/categories']);
  }

  trackByTaskId(_index: number, task: Task): string {
    return task.id;
  }

  async generateDemoTasks(): Promise<void> {
    const categoryIds = this.categories.map((category) => category.id);
    await this.taskService.seedFakeTasks(1000, categoryIds);
    this.activeFilter = 'all';
    this.updateFilteredTasks();
  }
}
