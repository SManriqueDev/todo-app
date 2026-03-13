import { Injectable, inject, signal } from '@angular/core';
import { Category } from '../models';
import { StorageService } from './storage.service';

const CATEGORIES_KEY = 'gamified_categories';

const SEED_CATEGORIES: Category[] = [
  { id: '1', name: 'Trabajo', emoji: '\u{1F4BC}', createdAt: Date.now() },
  { id: '2', name: 'Personal', emoji: '\u{1F464}', createdAt: Date.now() },
  { id: '3', name: 'Compras', emoji: '\u{1F6D2}', createdAt: Date.now() },
  { id: '4', name: 'Ejercicio', emoji: '\u{1F3C3}', createdAt: Date.now() },
];

const LEGACY_CATEGORY_TRANSLATIONS: Record<string, string> = {
  Work: 'Trabajo',
  Personal: 'Personal',
  Groceries: 'Compras',
  Fitness: 'Ejercicio',
};

const DEFAULT_EMOJI_BY_NAME: Record<string, string> = {
  Trabajo: '\u{1F4BC}',
  Personal: '\u{1F464}',
  Compras: '\u{1F6D2}',
  Ejercicio: '\u{1F3C3}',
};

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly categoriesSignal = signal<Category[]>([]);
  readonly categories = this.categoriesSignal.asReadonly();
  private readonly storageService = inject(StorageService);
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    const stored = await this.storageService.get<Category[]>(CATEGORIES_KEY);
    if (stored && stored.length > 0) {
      const migrated = stored.map((category) => {
        const translatedName = LEGACY_CATEGORY_TRANSLATIONS[category.name];
        const normalizedName = translatedName ?? category.name;
        const fallbackEmoji = DEFAULT_EMOJI_BY_NAME[normalizedName];
        const normalizedEmoji =
          (category.emoji === '?' || category.emoji === '\uFFFD') && fallbackEmoji
            ? fallbackEmoji
            : category.emoji;

        return {
          ...category,
          name: normalizedName,
          emoji: normalizedEmoji,
        };
      });
      this.categoriesSignal.set(migrated);
      await this.persistCategories(migrated);
    } else {
      this.categoriesSignal.set(SEED_CATEGORIES);
      await this.persistCategories(SEED_CATEGORIES);
    }
  }

  private async persistCategories(categories: Category[]): Promise<void> {
    await this.storageService.set(CATEGORIES_KEY, categories);
  }

  getAll(): Category[] {
    return this.categoriesSignal();
  }

  getById(id: string): Category | undefined {
    return this.categoriesSignal().find((c) => c.id === id);
  }

  async add(name: string, emoji: string): Promise<void> {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      emoji,
      createdAt: Date.now(),
    };
    const updated = [...this.categoriesSignal(), newCategory];
    this.categoriesSignal.set(updated);
    await this.persistCategories(updated);
  }

  async update(id: string, name: string, emoji: string): Promise<void> {
    const updated = this.categoriesSignal().map((c) => (c.id === id ? { ...c, name, emoji } : c));
    this.categoriesSignal.set(updated);
    await this.persistCategories(updated);
  }

  async delete(id: string): Promise<void> {
    const updated = this.categoriesSignal().filter((c) => c.id !== id);
    this.categoriesSignal.set(updated);
    await this.persistCategories(updated);
  }
}
