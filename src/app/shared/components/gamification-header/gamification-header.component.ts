import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonProgressBar } from '@ionic/angular/standalone';
import { GamificationService, FirebaseConfigService } from '../../../core/services';
import { Observable } from 'rxjs';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-gamification-header',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent, IonProgressBar],
  templateUrl: './gamification-header.component.html',
  styleUrl: './gamification-header.component.scss',
})
export class GamificationHeaderComponent {
  private readonly gamificationService = inject(GamificationService);
  private readonly firebaseConfigService = inject(FirebaseConfigService);
  stats$ = this.gamificationService.stats;
  gamificationEnabled$: Observable<boolean>;
  maxXpPerLevel = this.firebaseConfigService.getMaxXpPerLevel();
  stats: { level: number; currentXP: number } | null = null;

  constructor() {
    this.gamificationEnabled$ = this.firebaseConfigService.gamificationEnabled;
    this.stats$.subscribe((stats) => {
      this.stats = stats;
    });
    this.gamificationService.levelUp.subscribe((level) => {
      if (!level || !this.firebaseConfigService.getGamificationEnabled()) {
        return;
      }

      confetti({
        particleCount: 110,
        spread: 85,
        startVelocity: 45,
        scalar: 0.95,
        ticks: 180,
        origin: { y: 0.62 },
      });
    });
  }
}
