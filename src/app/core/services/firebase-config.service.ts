import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { initializeApp, getApps } from 'firebase/app';
import { fetchAndActivate, getBoolean, getNumber, getRemoteConfig } from 'firebase/remote-config';
import { environment } from '../../../environments/environment';

const DEFAULT_XP_PER_TASK = 50;
const DEFAULT_MAX_XP_PER_LEVEL = 300;
const DEFAULT_XP_PENALTY_ON_UNCHECK = true;

@Injectable({
  providedIn: 'root',
})
export class FirebaseConfigService {
  private gamificationEnabled$ = new BehaviorSubject<boolean>(true);
  readonly gamificationEnabled: Observable<boolean> = this.gamificationEnabled$.asObservable();
  private xpPerTask$ = new BehaviorSubject<number>(DEFAULT_XP_PER_TASK);
  private maxXpPerLevel$ = new BehaviorSubject<number>(DEFAULT_MAX_XP_PER_LEVEL);
  private xpPenaltyOnUncheck$ = new BehaviorSubject<boolean>(DEFAULT_XP_PENALTY_ON_UNCHECK);

  constructor() {}

  async init(): Promise<void> {
    try {
      if (!environment.firebase.apiKey) {
        console.warn(
          'Firebase API key is not set. Gamification features will be enabled by default.',
        );
        this.gamificationEnabled$.next(true);
        return;
      }

      const app = getApps().length > 0 ? getApps()[0] : initializeApp(environment.firebase);
      const remoteConfig = getRemoteConfig(app);

      remoteConfig.settings = {
        minimumFetchIntervalMillis: 60_000,
        fetchTimeoutMillis: 10_000,
      };
      remoteConfig.defaultConfig = {
        enable_gamification: true,
        xp_per_task: DEFAULT_XP_PER_TASK,
        max_xp_per_level: DEFAULT_MAX_XP_PER_LEVEL,
        xp_penalty_on_uncheck: DEFAULT_XP_PENALTY_ON_UNCHECK,
      };

      await fetchAndActivate(remoteConfig);
      this.gamificationEnabled$.next(getBoolean(remoteConfig, 'enable_gamification'));
      this.xpPerTask$.next(
        this.sanitizeNumber(getNumber(remoteConfig, 'xp_per_task'), DEFAULT_XP_PER_TASK),
      );
      this.maxXpPerLevel$.next(
        this.sanitizeNumber(getNumber(remoteConfig, 'max_xp_per_level'), DEFAULT_MAX_XP_PER_LEVEL),
      );
      this.xpPenaltyOnUncheck$.next(getBoolean(remoteConfig, 'xp_penalty_on_uncheck'));
    } catch {
      this.gamificationEnabled$.next(true);
      this.xpPerTask$.next(DEFAULT_XP_PER_TASK);
      this.maxXpPerLevel$.next(DEFAULT_MAX_XP_PER_LEVEL);
      this.xpPenaltyOnUncheck$.next(DEFAULT_XP_PENALTY_ON_UNCHECK);
    }
  }

  private sanitizeNumber(value: number, fallback: number): number {
    if (!Number.isFinite(value) || value < 1) {
      return fallback;
    }
    return Math.floor(value);
  }

  getGamificationEnabled(): boolean {
    return this.gamificationEnabled$.value;
  }

  getXpPerTask(): number {
    return this.xpPerTask$.value;
  }

  getMaxXpPerLevel(): number {
    return this.maxXpPerLevel$.value;
  }

  getXpPenaltyOnUncheck(): boolean {
    return this.xpPenaltyOnUncheck$.value;
  }
}
