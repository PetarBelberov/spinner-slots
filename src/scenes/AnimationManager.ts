import { ANIMATION } from '../config.js';
import confetti from 'canvas-confetti';
import { Button } from '../components/Button';

export class AnimationManager {
    playButton: Button;

    constructor(playButton: Button) {
        this.playButton = playButton;
    }

    flashJackpotText() {
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            if (this.playButton && this.playButton.buttonText) {
                this.playButton.buttonText.visible = !this.playButton.buttonText.visible;
            }
            flashCount++;
            if (flashCount >= ANIMATION.FLASH_COUNT) {
                clearInterval(flashInterval);
                if (this.playButton && this.playButton.buttonText) {
                    this.playButton.buttonText.visible = true;
                }
            }
        }, ANIMATION.FLASH_INTERVAL);
    }

    triggerJackpotAnimation() {
        confetti({
            particleCount: 500,
            spread: 140,
            origin: { y: 0.6 }
        });
    }
}
