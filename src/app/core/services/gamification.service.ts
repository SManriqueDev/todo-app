import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserStats } from '../models';
import { StorageService } from './storage.service';
import { FirebaseConfigService } from './firebase-config.service';

const USER_STATS_KEY = 'gamified_user_stats';

const SEED_STATS: UserStats = {
  level: 5,
  currentXP: 50,
  totalXPEarned: 450,
};

@Injectable({
  providedIn: 'root',
})
export class GamificationService {
  private stats$ = new BehaviorSubject<UserStats>(SEED_STATS);
  readonly stats: Observable<UserStats> = this.stats$.asObservable();
  private levelUp$ = new BehaviorSubject<number | null>(null);
  readonly levelUp: Observable<number | null> = this.levelUp$.asObservable();
  private readonly storageService = inject(StorageService);
  private readonly firebaseConfigService = inject(FirebaseConfigService);

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const stored = await this.storageService.get<UserStats>(USER_STATS_KEY);
    if (stored) {
      this.stats$.next(stored);
    } else {
      this.stats$.next(SEED_STATS);
      await this.persistStats(SEED_STATS);
    }
  }

  private async persistStats(stats: UserStats): Promise<void> {
    await this.storageService.set(USER_STATS_KEY, stats);
  }

  getStats(): UserStats {
    return this.stats$.value;
  }

  addXP(amount: number): void {
    const stats = { ...this.stats$.value };
    const previousLevel = stats.level;
    const maxXpPerLevel = this.firebaseConfigService.getMaxXpPerLevel();
    stats.currentXP += amount;
    stats.totalXPEarned += amount;

    // Check for level up
    while (stats.currentXP >= maxXpPerLevel) {
      stats.level++;
      stats.currentXP -= maxXpPerLevel;
    }

    this.stats$.next(stats);
    this.persistStats(stats);

    if (stats.level > previousLevel) {
      this.levelUp$.next(stats.level);
    }
  }

  removeXP(amount: number): void {
    const stats = { ...this.stats$.value };
    stats.currentXP = Math.max(0, stats.currentXP - amount);
    stats.totalXPEarned = Math.max(0, stats.totalXPEarned - amount);

    this.stats$.next(stats);
    this.persistStats(stats);
  }
}
