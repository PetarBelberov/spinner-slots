import { Sprite, Texture } from 'pixi.js';
import { SYMBOL_SIZE, SYMBOL_PADDING, REEL_WIDTH } from '../config';
import { Reel } from './Reel';

/**
 * Keeping symbol-related functionality distinct 
 * Initial positioning and scaling of symbols within the reel.
 */
export class Symbol extends Sprite {
    constructor(texture: Texture) {
        super(texture);
        this.scale.x = this.scale.y = Math.min(SYMBOL_SIZE / this.width, SYMBOL_SIZE / this.height);
        this.x = Math.round((REEL_WIDTH - this.width) / 2);
    }

    setRandomTexture(slotTextures: Texture[], reels: Reel[]) {
        if (Math.random() < 0.60) {
            this.texture = reels[0].symbols[0].texture;
        } else {
            this.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
        }
        this.scale.x = this.scale.y = Math.min((SYMBOL_SIZE - SYMBOL_PADDING) / this.texture.width, (SYMBOL_SIZE - SYMBOL_PADDING) / this.texture.height);
        this.x = Math.round((REEL_WIDTH - this.width) / 2);
    }
}
