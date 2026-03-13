import { TestBed } from '@angular/core/testing';
import { UserStats } from '../models';
import { FirebaseConfigService } from './firebase-config.service';
import { GamificationService } from './gamification.service';
import { StorageService } from './storage.service';

describe('GamificationService', () => {
  let service: GamificationService;
  let storageService: jasmine.SpyObj<StorageService>;
  let firebaseConfigService: jasmine.SpyObj<FirebaseConfigService>;

  beforeEach(() => {
    storageService = jasmine.createSpyObj<StorageService>('StorageService', ['get', 'set']);
    firebaseConfigService = jasmine.createSpyObj<FirebaseConfigService>('FirebaseConfigService', [
      'getMaxXpPerLevel',
    ]);
    firebaseConfigService.getMaxXpPerLevel.and.returnValue(300);

    TestBed.configureTestingModule({
      providers: [
        GamificationService,
        { provide: StorageService, useValue: storageService },
        { provide: FirebaseConfigService, useValue: firebaseConfigService },
      ],
    });
  });

  it('addXP sube de nivel al superar el umbral y actualiza estadísticas', async () => {
    const storedStats: UserStats = {
      level: 1,
      currentXP: 290,
      totalXPEarned: 290,
    };
    storageService.get.and.resolveTo(storedStats);
    service = TestBed.inject(GamificationService);
    await service.ready;

    service.addXP(20);

    expect(service.getStats()).toEqual({
      level: 2,
      currentXP: 10,
      totalXPEarned: 310,
    });
    expect(service.levelUp()).toBe(2);
    expect(storageService.set.calls.mostRecent().args[0]).toBe('gamified_user_stats');
  });
});
