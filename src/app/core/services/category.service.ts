import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../models';
import { StorageService } from './storage.service';

const CATEGORIES_KEY = 'gamified_categories';

const SEED_CATEGORIES: Category[] = [
  { id: '1', name: 'Trabajo', emoji: '💼', createdAt: Date.now() },
  { id: '2', name: 'Personal', emoji: '👤', createdAt: Date.now() },
  { id: '3', name: 'Compras', emoji: '🛒', createdAt: Date.now() },
  { id: '4', name: 'Ejercicio', emoji: '🏃', createdAt: Date.now() },
];

const LEGACY_CATEGORY_TRANSLATIONS: Record<string, string> = {
  Work: 'Trabajo',
  Personal: 'Personal',
  Groceries: 'Compras',
  Fitness: 'Ejercicio',
};

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private categories$ = new BehaviorSubject<Category[]>([]);
  readonly categories: Observable<Category[]> = this.categories$.asObservable();
  private readonly storageService = inject(StorageService);

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const stored = await this.storageService.get<Category[]>(CATEGORIES_KEY);
    if (stored && stored.length > 0) {
      const migrated = stored.map((category) => {
        const translatedName = LEGACY_CATEGORY_TRANSLATIONS[category.name];
        return translatedName ? { ...category, name: translatedName } : category;
      });
      this.categories$.next(migrated);
      await this.persistCategories(migrated);
    } else {
      this.categories$.next(SEED_CATEGORIES);
      await this.persistCategories(SEED_CATEGORIES);
    }
  }

  private async persistCategories(categories: Category[]): Promise<void> {
    await this.storageService.set(CATEGORIES_KEY, categories);
  }

  getAll(): Category[] {
    return this.categories$.value;
  }

  getById(id: string): Category | undefined {
    return this.categories$.value.find((c) => c.id === id);
  }

  async add(name: string, emoji: string): Promise<void> {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      emoji,
      createdAt: Date.now(),
    };
    const updated = [...this.categories$.value, newCategory];
    this.categories$.next(updated);
    await this.persistCategories(updated);
  }

  async update(id: string, name: string, emoji: string): Promise<void> {
    const updated = this.categories$.value.map((c) => (c.id === id ? { ...c, name, emoji } : c));
    this.categories$.next(updated);
    await this.persistCategories(updated);
  }

  async delete(id: string): Promise<void> {
    const updated = this.categories$.value.filter((c) => c.id !== id);
    this.categories$.next(updated);
    await this.persistCategories(updated);
  }
}
