import { Injectable, signal } from '@angular/core';
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
  private readonly gamificationEnabledSignal = signal<boolean>(true);
  readonly gamificationEnabled = this.gamificationEnabledSignal.asReadonly();
  private readonly xpPerTaskSignal = signal<number>(DEFAULT_XP_PER_TASK);
  private readonly maxXpPerLevelSignal = signal<number>(DEFAULT_MAX_XP_PER_LEVEL);
  private readonly xpPenaltyOnUncheckSignal = signal<boolean>(DEFAULT_XP_PENALTY_ON_UNCHECK);

  constructor() {}

  async init(): Promise<void> {
    try {
      if (!environment.firebase.apiKey) {
        console.warn(
          'Firebase API key is not set. Gamification features will be enabled by default.',
        );
        this.gamificationEnabledSignal.set(true);
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
      this.gamificationEnabledSignal.set(getBoolean(remoteConfig, 'enable_gamification'));
      this.xpPerTaskSignal.set(
        this.sanitizeNumber(getNumber(remoteConfig, 'xp_per_task'), DEFAULT_XP_PER_TASK),
      );
      this.maxXpPerLevelSignal.set(
        this.sanitizeNumber(getNumber(remoteConfig, 'max_xp_per_level'), DEFAULT_MAX_XP_PER_LEVEL),
      );
      this.xpPenaltyOnUncheckSignal.set(getBoolean(remoteConfig, 'xp_penalty_on_uncheck'));
    } catch {
      this.gamificationEnabledSignal.set(true);
      this.xpPerTaskSignal.set(DEFAULT_XP_PER_TASK);
      this.maxXpPerLevelSignal.set(DEFAULT_MAX_XP_PER_LEVEL);
      this.xpPenaltyOnUncheckSignal.set(DEFAULT_XP_PENALTY_ON_UNCHECK);
    }
  }

  private sanitizeNumber(value: number, fallback: number): number {
    if (!Number.isFinite(value) || value < 1) {
      return fallback;
    }
    return Math.floor(value);
  }

  getGamificationEnabled(): boolean {
    return this.gamificationEnabledSignal();
  }

  getXpPerTask(): number {
    return this.xpPerTaskSignal();
  }

  getMaxXpPerLevel(): number {
    return this.maxXpPerLevelSignal();
  }

  getXpPenaltyOnUncheck(): boolean {
    return this.xpPenaltyOnUncheckSignal();
  }
}
