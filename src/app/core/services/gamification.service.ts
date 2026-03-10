import { Injectable, inject, signal } from '@angular/core';
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
  private readonly statsSignal = signal<UserStats>(SEED_STATS);
  readonly stats = this.statsSignal.asReadonly();
  private readonly levelUpSignal = signal<number | null>(null);
  readonly levelUp = this.levelUpSignal.asReadonly();
  private readonly storageService = inject(StorageService);
  private readonly firebaseConfigService = inject(FirebaseConfigService);

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const stored = await this.storageService.get<UserStats>(USER_STATS_KEY);
    if (stored) {
      this.statsSignal.set(stored);
    } else {
      this.statsSignal.set(SEED_STATS);
      await this.persistStats(SEED_STATS);
    }
  }

  private async persistStats(stats: UserStats): Promise<void> {
    await this.storageService.set(USER_STATS_KEY, stats);
  }

  getStats(): UserStats {
    return this.statsSignal();
  }

  addXP(amount: number): void {
    const stats = { ...this.statsSignal() };
    const previousLevel = stats.level;
    const maxXpPerLevel = this.firebaseConfigService.getMaxXpPerLevel();
    stats.currentXP += amount;
    stats.totalXPEarned += amount;

    // Check for level up
    while (stats.currentXP >= maxXpPerLevel) {
      stats.level++;
      stats.currentXP -= maxXpPerLevel;
    }

    this.statsSignal.set(stats);
    void this.persistStats(stats);

    if (stats.level > previousLevel) {
      this.levelUpSignal.set(stats.level);
    }
  }

  removeXP(amount: number): void {
    const stats = { ...this.statsSignal() };
    stats.currentXP = Math.max(0, stats.currentXP - amount);
    stats.totalXPEarned = Math.max(0, stats.totalXPEarned - amount);

    this.statsSignal.set(stats);
    void this.persistStats(stats);
  }
}
