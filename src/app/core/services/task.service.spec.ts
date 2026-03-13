import { TestBed } from '@angular/core/testing';
import { Task } from '../models';
import { FirebaseConfigService } from './firebase-config.service';
import { GamificationService } from './gamification.service';
import { StorageService } from './storage.service';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let storageService: jasmine.SpyObj<StorageService>;
  let gamificationService: jasmine.SpyObj<GamificationService>;
  let firebaseConfigService: jasmine.SpyObj<FirebaseConfigService>;

  beforeEach(() => {
    storageService = jasmine.createSpyObj<StorageService>('StorageService', ['get', 'set']);
    gamificationService = jasmine.createSpyObj<GamificationService>('GamificationService', [
      'addXP',
      'removeXP',
    ]);
    firebaseConfigService = jasmine.createSpyObj<FirebaseConfigService>('FirebaseConfigService', [
      'getXpPerTask',
      'getXpPenaltyOnUncheck',
    ]);
    firebaseConfigService.getXpPerTask.and.returnValue(50);
    firebaseConfigService.getXpPenaltyOnUncheck.and.returnValue(true);

    TestBed.configureTestingModule({
      providers: [
        TaskService,
        { provide: StorageService, useValue: storageService },
        { provide: GamificationService, useValue: gamificationService },
        { provide: FirebaseConfigService, useValue: firebaseConfigService },
      ],
    });
  });

  it('toggle completa tarea, asigna completedAt y suma XP', async () => {
    const storedTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Tarea inicial',
        completed: false,
        categoryId: 'cat-1',
        createdAt: 100,
      },
    ];
    storageService.get.and.resolveTo(storedTasks);
    service = TestBed.inject(TaskService);
    await service.ready;
    spyOn(Date, 'now').and.returnValue(123_456);

    await service.toggle('task-1');

    const updatedTask = service.getById('task-1');
    expect(updatedTask?.completed).toBeTrue();
    expect(updatedTask?.completedAt).toBe(123_456);
    expect(gamificationService.addXP).toHaveBeenCalledWith(50);
    expect(gamificationService.removeXP).not.toHaveBeenCalled();
    expect(storageService.set.calls.mostRecent().args[0]).toBe('gamified_tasks');
  });

  it('toggle desmarca tarea y aplica penalización de XP cuando corresponde', async () => {
    const storedTasks: Task[] = [
      {
        id: 'task-2',
        title: 'Tarea hecha',
        completed: true,
        categoryId: 'cat-1',
        createdAt: 100,
        completedAt: 1_000,
      },
    ];
    storageService.get.and.resolveTo(storedTasks);
    service = TestBed.inject(TaskService);
    await service.ready;

    await service.toggle('task-2');

    const updatedTask = service.getById('task-2');
    expect(updatedTask?.completed).toBeFalse();
    expect(updatedTask?.completedAt).toBeUndefined();
    expect(gamificationService.removeXP).toHaveBeenCalledWith(50);
  });

  it('deleteByCategory elimina solo tareas de la categoría indicada', async () => {
    const storedTasks: Task[] = [
      { id: 'task-a', title: 'A', completed: false, categoryId: 'cat-a', createdAt: 1 },
      { id: 'task-b', title: 'B', completed: false, categoryId: 'cat-b', createdAt: 2 },
    ];
    storageService.get.and.resolveTo(storedTasks);
    service = TestBed.inject(TaskService);
    await service.ready;

    await service.deleteByCategory('cat-a');

    expect(service.getAll().map((task) => task.id)).toEqual(['task-b']);
    expect(storageService.set.calls.mostRecent().args[0]).toBe('gamified_tasks');
  });
});
