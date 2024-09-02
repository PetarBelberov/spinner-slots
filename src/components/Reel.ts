import { Container, BlurFilter, Sprite, Texture } from 'pixi.js';
import { SYMBOL_SIZE, SYMBOL_PADDING, SYMBOL_COUNT } from '../config';
import { Symbol } from './Symbol';

/**
 * Handles the creation of symbols, their positioning, and updating their state during animation.
 */
export class Reel {
    container: Container;
    position: number;
    finalSymbols: any;
    visibleSymbols: any;
    previousPosition: number;
    symbols: Symbol[];
    blur: BlurFilter;
    
    constructor(slotTextures: Texture[]) {
        this.container = new Container();
        this.symbols = [];
        this.position = 0;
        this.previousPosition = 0;
        this.blur = new BlurFilter();

        this.blur.strengthX = 0;
        this.blur.strengthY = 0;
        this.container.filters = [this.blur];

        // Build the symbols
        for (let j = 0; j < SYMBOL_COUNT; j++) {
            const symbol = new Symbol(slotTextures[Math.floor(Math.random() * slotTextures.length)]);
            symbol.y = j * (SYMBOL_SIZE + SYMBOL_PADDING);
            this.symbols.push(symbol);
            this.container.addChild(symbol);
        }
    }

    update(slotTextures: Texture[], reels: Reel[]) {
        this.blur.strengthY = (this.position - this.previousPosition) * 8;
        this.previousPosition = this.position;
    
        this.visibleSymbols = [];
    
        for (let j = 0; j < this.symbols.length; j++) {
            const s = this.symbols[j];
            const prevy = s.y;
            s.y = ((this.position + j) % this.symbols.length) * (SYMBOL_SIZE + SYMBOL_PADDING) - (SYMBOL_SIZE + SYMBOL_PADDING);
            if (s.y < 0 && prevy > SYMBOL_SIZE + SYMBOL_PADDING) {
                s.setRandomTexture(slotTextures, reels);
            }
            if (s.y >= 0 && s.y < (SYMBOL_SIZE + SYMBOL_PADDING) * 3) {
                this.visibleSymbols.push(s);
            }
        }
    
        this.visibleSymbols.sort((a: Sprite, b: Sprite) => a.y - b.y);
    }

    getVisibleSymbols() {
        return this.symbols.filter((s: Sprite) => s.y >= 0 && s.y < (SYMBOL_SIZE + SYMBOL_PADDING) * 3);
    }
}
