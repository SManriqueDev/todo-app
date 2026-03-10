import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonProgressBar } from '@ionic/angular/standalone';
import { GamificationService, FirebaseConfigService } from '../../../core/services';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-gamification-header',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent, IonProgressBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gamification-header.component.html',
  styleUrl: './gamification-header.component.scss',
})
export class GamificationHeaderComponent {
  private readonly gamificationService = inject(GamificationService);
  private readonly firebaseConfigService = inject(FirebaseConfigService);
  readonly stats = this.gamificationService.stats;
  readonly levelUp = this.gamificationService.levelUp;
  readonly gamificationEnabled = this.firebaseConfigService.gamificationEnabled;
  readonly maxXpPerLevel = computed(() => this.firebaseConfigService.getMaxXpPerLevel());

  constructor() {
    effect(() => {
      const level = this.levelUp();
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
