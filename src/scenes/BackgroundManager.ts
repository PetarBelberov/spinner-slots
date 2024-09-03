import { Sprite, Texture } from 'pixi.js';
import { GRADIENT_COLORS } from '../config.js';

export class BackgroundManager {
    private app: any;

    constructor(app: any) {
        this.app = app;
    }

    createBackground(): Sprite {
        const gradientTexture = this.createGradientTexture();
        const backgroundSprite = new Sprite(gradientTexture);
        backgroundSprite.width = this.app.screen.width;
        backgroundSprite.height = this.app.screen.height;
        return backgroundSprite;
    }

    private createGradientTexture(): Texture {
        const quality = 256;
        const canvas = document.createElement('canvas');
        canvas.width = quality;
        canvas.height = 1;

        const ctx = canvas.getContext('2d');
        const gradient = ctx?.createLinearGradient(0, 0, quality, 0);
        gradient?.addColorStop(0, GRADIENT_COLORS.START);
        gradient?.addColorStop(1, GRADIENT_COLORS.END);

        if (ctx) {
            ctx.fillStyle = gradient as CanvasGradient;
        }
        ctx?.fillRect(0, 0, quality, 1);

        return Texture.from(canvas);
    }
}