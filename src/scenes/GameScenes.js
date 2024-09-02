// scenes/GameScene.js

import { Container, Sprite, Graphics, Text, TextStyle, Texture } from 'pixi.js';
import { Reel } from '../components/Reel.js';
import { Button } from '../components/Button.js';
import { tweenTo, backout } from '../utils/tweenUtils.js';
import { REEL_WIDTH, SYMBOL_SIZE, SYMBOL_PADDING, REEL_COUNT, COLORS, GRADIENT_COLORS, TEXT_STYLES, ANIMATION } from '../config.js';
import confetti from 'canvas-confetti';
import jackpotSound from '../assets/jackpot.mp3';

/**
 * Encapsulates all the specific game logic.
 */
export class GameScene extends Container {
    constructor(app, slotTextures) {
        super();
        this.app = app;
        this.slotTextures = slotTextures;
        this.reels = [];
        this.running = false;
        this.jackpotSound = new Audio(jackpotSound);

        this.initializeScene();
    }
    
    initializeScene() {
        this.createBackground();
        this.createReels();
        this.createTopBottom();
        this.createPlayButton();
        this.addEventListeners();
    }

    createBackground() {
        const gradientTexture = this.createGradientTexture();
        const backgroundSprite = new Sprite(gradientTexture);
        backgroundSprite.width = this.app.screen.width;
        backgroundSprite.height = this.app.screen.height;
        this.addChild(backgroundSprite);
    }

    createGradientTexture() {
        const quality = 256;
        const canvas = document.createElement('canvas');
        canvas.width = quality;
        canvas.height = 1;

        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, quality, 0);
        gradient.addColorStop(0, GRADIENT_COLORS.START);
        gradient.addColorStop(1, GRADIENT_COLORS.END);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, quality, 1);

        return Texture.from(canvas);
    }

    createReels() {
        this.reelContainer = new Container();
        for (let i = 0; i < REEL_COUNT; i++) {
            const reel = new Reel(this.slotTextures);
            reel.container.x = i * REEL_WIDTH;
            this.reelContainer.addChild(reel.container);
            this.reels.push(reel);
        }
        this.addChild(this.reelContainer);

        const margin = (this.app.screen.height - SYMBOL_SIZE * 3) / 2;
        const totalReelHeight = 3 * (SYMBOL_SIZE + SYMBOL_PADDING) - SYMBOL_PADDING;
        this.reelContainer.y = (this.app.screen.height - totalReelHeight) / 2;
        this.reelContainer.x = (this.app.screen.width - REEL_WIDTH * 5) / 2;
    }

    createTopBottom() {
        const margin = (this.app.screen.height - SYMBOL_SIZE * 3) / 2;
        const totalReelHeight = 3 * (SYMBOL_SIZE + SYMBOL_PADDING) - SYMBOL_PADDING;

        this.top = new Container();
        const topBackground = new Graphics().rect(0, 0, this.app.screen.width, this.reelContainer.y).fill({ color: COLORS.TOP_BOTTOM });
        this.top.addChild(topBackground);

        this.bottom = new Container();
        const bottomBackground = new Graphics().rect(0, this.reelContainer.y + totalReelHeight, this.app.screen.width, this.app.screen.height - (this.reelContainer.y + totalReelHeight)).fill({ color: COLORS.TOP_BOTTOM });
        this.bottom.addChild(bottomBackground);

        const headerText = new Text({
            text: 'Премиер на България?',
            style: new TextStyle(TEXT_STYLES.HEADER)
        });
        headerText.x = Math.round((topBackground.width - headerText.width) / 2);
        headerText.y = Math.round((margin - headerText.height) / 2);
        this.top.addChild(headerText);

        this.addChild(this.top);
        this.addChild(this.bottom);
    }

    createPlayButton() {
        const margin = (this.app.screen.height - SYMBOL_SIZE * 3) / 2;
        const buttonWidth = 10; // Same as in main.js
        const buttonHeight = 10; // Same as in main.js
        const playStyle = new TextStyle(TEXT_STYLES.PLAY);
        this.playButton = new Button('Избери', playStyle, buttonWidth, buttonHeight, this.startPlay.bind(this));
        this.playButton.x = Math.round((this.bottom.width - this.playButton.width) / 2);
        this.playButton.y = this.app.screen.height - margin + Math.round((margin - this.playButton.height) / 2);
        this.bottom.addChild(this.playButton);
    
        this.updateContainerSize();
    }

    addEventListeners() {
        this.bottom.eventMode = 'static';
        this.bottom.cursor = 'pointer';
        this.bottom.addListener('pointerdown', this.startPlay.bind(this));
    }

    startPlay() {
        if (this.running) return;
        this.running = true;

        for (let i = 0; i < REEL_COUNT; i++) {
            const r = this.reels[i];
            const extra = Math.floor(Math.random() * 3);
            const target = r.position + 10 + i * 5 + extra;
            const time = 2500 + i * 600 + extra * 600;

            tweenTo(r, 'position', target, time, backout(0.5), null, i === REEL_COUNT - 1 ? this.reelsComplete.bind(this) : null);
        }
    }

    checkJackpot(reels) {
        for (let row = 0; row < 3; row++) {
            const rowSymbols = reels.map(reel => reel.finalSymbols[row]);
            const rowMatch = rowSymbols.every(texture => texture === rowSymbols[0]);
            
            if (rowMatch) {
                return true;
            }
        }
        return false;
    }

    reelsComplete() {
        this.running = false;

        this.reels.forEach((reel, i) => {
            reel.finalSymbols = reel.visibleSymbols.map(symbol => symbol.texture);
        });

        const isJackpot = this.checkJackpot(this.reels);
        this.playButton.setText(isJackpot ? 'Поздравления!' : 'Опитай отново!');
        this.updateContainerSize();

        if (isJackpot) {
            this.bottom.eventMode = 'none';
            this.bottom.cursor = 'default';

            this.jackpotSound.load();
            this.jackpotSound.play().catch(error => console.log('Audio play failed:', error));

            confetti({
                particleCount: 500,
                spread: 140,
                origin: { y: 0.6 }
            });

            this.flashJackpotText();

            setTimeout(() => {
                this.refreshGame();
                this.bottom.eventMode = 'static';
                this.bottom.cursor = 'pointer';
            }, ANIMATION.REFRESH_DELAY);
        }
    }

    refreshGame() {
        this.reels.forEach(reel => {
            reel.position = 0;
            reel.previousPosition = 0;

            this.jackpotSound.pause();
            this.jackpotSound.currentTime = 0;
        });

        this.reels.forEach(reel => {
            reel.symbols.forEach(symbol => {
                symbol.texture = this.slotTextures[Math.floor(Math.random() * this.slotTextures.length)];
            });
        });

        this.playButton.setText('Избери отново!');
    }

    updateContainerSize() {
        this.playButton.background.clear();
        this.playButton.background
            .fill('#4D761D')
            .roundRect(0, 0, this.playButton.buttonText.width + 20, this.playButton.buttonText.height + 20, 8)
            .fill();
        
        this.playButton.buttonText.x = 10;
        this.playButton.buttonText.y = 10;
        
        this.playButton.x = Math.round((this.bottom.width - this.playButton.width) / 2);
    }

    flashJackpotText() {
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            this.playButton.buttonText.visible = !this.playButton.buttonText.visible;
            flashCount++;
            if (flashCount >= ANIMATION.FLASH_COUNT) {
                clearInterval(flashInterval);
                this.playButton.buttonText.visible = true;
            }
        }, ANIMATION.FLASH_INTERVAL);
    }

    update(delta) {
        for (let i = 0; i < REEL_COUNT; i++) {
            this.reels[i].update(this.slotTextures, this.reels);
        }
    }
}
