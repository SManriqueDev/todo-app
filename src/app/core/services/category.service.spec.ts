import { TestBed } from '@angular/core/testing';
import { Category } from '../models';
import { CategoryService } from './category.service';
import { StorageService } from './storage.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let storageService: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageService = jasmine.createSpyObj<StorageService>('StorageService', ['get', 'set']);

    TestBed.configureTestingModule({
      providers: [CategoryService, { provide: StorageService, useValue: storageService }],
    });
  });

  it('add agrega categoría y persiste en storage', async () => {
    const existingCategories: Category[] = [
      { id: 'cat-1', name: 'Trabajo', emoji: '\u{1F4BC}', createdAt: 10 },
    ];
    storageService.get.and.resolveTo(existingCategories);
    service = TestBed.inject(CategoryService);
    await service.ready;
    spyOn(Date, 'now').and.returnValue(2_000);

    await service.add('Lectura', '\u{1F4DA}');

    const created = service.getAll().find((category) => category.id === '2000');
    expect(created).toEqual({
      id: '2000',
      name: 'Lectura',
      emoji: '\u{1F4DA}',
      createdAt: 2_000,
    });
    expect(storageService.set.calls.mostRecent().args[0]).toBe('gamified_categories');
  });
});
