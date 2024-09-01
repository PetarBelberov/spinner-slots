import { Container, Sprite, BlurFilter } from 'pixi.js';
import { REEL_WIDTH, SYMBOL_SIZE, SYMBOL_PADDING, SYMBOL_COUNT } from '../config.js';

/**
 * Handles the creation of symbols, their positioning, and updating their state during animation.
 */
export class Reel {
    constructor(slotTextures) {
        this.container = new Container();
        this.symbols = [];
        this.position = 0;
        this.previousPosition = 0;
        this.blur = new BlurFilter();

        this.blur.blurX = 0;
        this.blur.blurY = 0;
        this.container.filters = [this.blur];

        // Build the symbols
        for (let j = 0; j < SYMBOL_COUNT; j++) {
            const symbol = new Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);
            symbol.y = j * (SYMBOL_SIZE + SYMBOL_PADDING);
            symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.texture.width, SYMBOL_SIZE / symbol.texture.height);
            symbol.x = Math.round((REEL_WIDTH - symbol.width) / 2);
            this.symbols.push(symbol);
            this.container.addChild(symbol);
        }
    }

    update() {
        this.blur.blurY = (this.position - this.previousPosition) * 8;
        this.previousPosition = this.position;

        // Update symbol positions
        for (let j = 0; j < this.symbols.length; j++) {
            const s = this.symbols[j];
            const prevy = s.y;
            s.y = ((this.position + j) % this.symbols.length) * (SYMBOL_SIZE + SYMBOL_PADDING) - (SYMBOL_SIZE + SYMBOL_PADDING);
            if (s.y < 0 && prevy > SYMBOL_SIZE + SYMBOL_PADDING) {
                s.texture = this.slotTextures[Math.floor(Math.random() * this.slotTextures.length)];
                s.scale.x = s.scale.y = Math.min((SYMBOL_SIZE - SYMBOL_PADDING) / s.texture.width, (SYMBOL_SIZE - SYMBOL_PADDING) / s.texture.height);
                s.x = Math.round((REEL_WIDTH - s.width) / 2);
            }
        }
    }

    getVisibleSymbols() {
        return this.symbols.filter(s => s.y >= 0 && s.y < (SYMBOL_SIZE + SYMBOL_PADDING) * 3);
    }
}
