import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../models';
import { StorageService } from './storage.service';
import { GamificationService } from './gamification.service';
import { FirebaseConfigService } from './firebase-config.service';

const TASKS_KEY = 'gamified_tasks';

const SEED_TASKS: Task[] = [
  {
    id: '1',
    title: 'Terminar propuesta del proyecto',
    completed: false,
    categoryId: '1',
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'Reunión de equipo a las 3 PM',
    completed: true,
    categoryId: '1',
    createdAt: Date.now(),
  },
  {
    id: '3',
    title: 'Comprar leche y huevos',
    completed: false,
    categoryId: '3',
    createdAt: Date.now(),
  },
  {
    id: '4',
    title: 'Entrenamiento matutino',
    completed: false,
    categoryId: '4',
    createdAt: Date.now(),
  },
  { id: '5', title: 'Llamar a mamá', completed: false, categoryId: '2', createdAt: Date.now() },
  {
    id: '6',
    title: 'Revisar pull requests',
    completed: false,
    categoryId: '1',
    createdAt: Date.now(),
  },
];

const LEGACY_TASK_TRANSLATIONS: Record<string, string> = {
  'Finish project proposal': 'Terminar propuesta del proyecto',
  'Team meeting at 3 PM': 'Reunión de equipo a las 3 PM',
  'Buy milk and eggs': 'Comprar leche y huevos',
  'Morning workout': 'Entrenamiento matutino',
  'Call mom': 'Llamar a mamá',
  'Review pull requests': 'Revisar pull requests',
};

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private tasks$ = new BehaviorSubject<Task[]>([]);
  readonly tasks: Observable<Task[]> = this.tasks$.asObservable();
  private readonly storageService = inject(StorageService);
  private readonly gamificationService = inject(GamificationService);
  private readonly firebaseConfigService = inject(FirebaseConfigService);

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const stored = await this.storageService.get<Task[]>(TASKS_KEY);
    if (stored && stored.length > 0) {
      const migrated = stored.map((task) => {
        const translatedTitle = LEGACY_TASK_TRANSLATIONS[task.title];
        return translatedTitle ? { ...task, title: translatedTitle } : task;
      });
      this.tasks$.next(migrated);
      await this.persistTasks(migrated);
    } else {
      this.tasks$.next(SEED_TASKS);
      await this.persistTasks(SEED_TASKS);
    }
  }

  private async persistTasks(tasks: Task[]): Promise<void> {
    await this.storageService.set(TASKS_KEY, tasks);
  }

  getAll(): Task[] {
    return this.tasks$.value;
  }

  getById(id: string): Task | undefined {
    return this.tasks$.value.find((t) => t.id === id);
  }

  async add(title: string, categoryId: string): Promise<void> {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      categoryId,
      createdAt: Date.now(),
    };
    const updated = [...this.tasks$.value, newTask];
    this.tasks$.next(updated);
    await this.persistTasks(updated);
  }

  async seedFakeTasks(count: number, categoryIds: string[]): Promise<void> {
    if (count < 1 || categoryIds.length === 0) {
      return;
    }

    const baseTimestamp = Date.now();
    const fakeTasks: Task[] = Array.from({ length: count }, (_value, index) => {
      const categoryId = categoryIds[index % categoryIds.length];
      const taskNumber = index + 1;
      const isCompleted = taskNumber % 7 === 0;
      return {
        id: `demo-${baseTimestamp}-${taskNumber}`,
        title: `Tarea demo #${taskNumber}: actividad ${((taskNumber - 1) % 25) + 1}`,
        completed: isCompleted,
        categoryId,
        createdAt: baseTimestamp - index * 60_000,
        completedAt: isCompleted ? baseTimestamp - index * 60_000 : undefined,
      };
    });

    this.tasks$.next(fakeTasks);
    await this.persistTasks(fakeTasks);
  }

  async toggle(id: string): Promise<void> {
    const task = this.getById(id);
    if (!task) return;

    const wasCompleted = task.completed;
    task.completed = !task.completed;
    task.completedAt = !wasCompleted ? Date.now() : undefined;

    const updated = this.tasks$.value.map((t) => (t.id === id ? task : t));
    this.tasks$.next(updated);
    await this.persistTasks(updated);

    // Update XP
    const xpPerTask = this.firebaseConfigService.getXpPerTask();
    const xpPenaltyOnUncheck = this.firebaseConfigService.getXpPenaltyOnUncheck();
    if (!wasCompleted) {
      this.gamificationService.addXP(xpPerTask);
    } else if (xpPenaltyOnUncheck) {
      this.gamificationService.removeXP(xpPerTask);
    }
  }

  async delete(id: string): Promise<void> {
    const updated = this.tasks$.value.filter((t) => t.id !== id);
    this.tasks$.next(updated);
    await this.persistTasks(updated);
  }

  async deleteByCategory(categoryId: string): Promise<void> {
    const updated = this.tasks$.value.filter((task) => task.categoryId !== categoryId);
    this.tasks$.next(updated);
    await this.persistTasks(updated);
  }
}
