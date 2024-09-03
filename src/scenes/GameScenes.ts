import { Container, Sprite, Graphics, Text, TextStyle, Texture, Application } from 'pixi.js';
import { Reel } from '../components/Reel';
import { Button } from '../components/Button';
import { tweenTo, backout } from '../utils/tweenUtils';
import { REEL_WIDTH, SYMBOL_SIZE, SYMBOL_PADDING, REEL_COUNT, COLORS, GRADIENT_COLORS, TEXT_STYLES, ANIMATION } from '../config.js';
import confetti from 'canvas-confetti';
import jackpotSound from '../assets/jackpot.mp3';
import { GameSceneProps } from './GameScenes.d';

/**
 * Encapsulates all the specific game logic.
 */
export class GameScene extends Container {
    app: GameSceneProps['app'];
    slotTextures: GameSceneProps['slotTextures'];
    reels: GameSceneProps['reels'];
    running: GameSceneProps['running'];
    jackpotSound: GameSceneProps['jackpotSound'];
    reelContainer: GameSceneProps['reelContainer'];
    top: GameSceneProps['top'];
    bottom: GameSceneProps['bottom'];
    playButton: GameSceneProps['playButton'];

    constructor(app: Application, slotTextures: Texture[]) {
        super();
        this.app = app;
        this.slotTextures = slotTextures;
        this.reels = [];
        this.running = false;
        this.jackpotSound = new Audio(jackpotSound);
        this.reelContainer = new Container();
        this.top = new Container();
        this.bottom = new Container();

        const buttonText = new Text({
            text: 'Избери',
            style: TEXT_STYLES.PLAY
        });
        const buttonStyle = new TextStyle(TEXT_STYLES.PLAY);
        const buttonWidth = 10;
        const buttonHeight = 50;

        this.playButton = new Button(
            buttonText,
            buttonStyle,
            buttonWidth,
            buttonHeight,
            this.startPlay.bind(this)
        );
        
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
        const gradient = ctx?.createLinearGradient(0, 0, quality, 0);
        gradient?.addColorStop(0, GRADIENT_COLORS.START);
        gradient?.addColorStop(1, GRADIENT_COLORS.END);

        if (ctx) {
            ctx.fillStyle = gradient as CanvasGradient;
        }
        ctx?.fillRect(0, 0, quality, 1);

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
    
        const totalReelWidth = REEL_WIDTH * REEL_COUNT;
        const totalReelHeight = SYMBOL_SIZE * 3 + SYMBOL_PADDING * 2;
    
        // Check if it's a mobile device
        if (this.app.screen.width < 768) { // Adjust this threshold as needed
            const scaleX = this.app.screen.width / totalReelWidth;
            const scaleY = this.app.screen.height / totalReelHeight;
            const scale = Math.min(scaleX, scaleY) * 0.9;
    
            this.reelContainer.scale.set(scale);
            this.reelContainer.x = (this.app.screen.width - this.reelContainer.width) / 2;
            this.reelContainer.y = (this.app.screen.height - this.reelContainer.height) / 2;
        } else {
            // Original positioning for desktop
            const margin = (this.app.screen.height - SYMBOL_SIZE * 3) / 2;
            this.reelContainer.y = (this.app.screen.height - totalReelHeight) / 2;
            this.reelContainer.x = (this.app.screen.width - totalReelWidth) / 2;
        }
    }

    createTopBottom() {
        const isMobile = this.app.screen.width < 768; // Adjust this threshold as needed
        const margin = (this.app.screen.height - SYMBOL_SIZE * 2) / 2;
        const totalReelHeight = 3 * (SYMBOL_SIZE + SYMBOL_PADDING) - SYMBOL_PADDING;
    
        this.top = new Container();
        const topBackground = new Graphics().rect(0, 0, this.app.screen.width, this.reelContainer.y).fill({ color: COLORS.TOP_BOTTOM });
        this.top.addChild(topBackground);
    
        this.bottom = new Container();
        let bottomBackgroundHeight;
    
        if (isMobile) {
            bottomBackgroundHeight = this.app.screen.height + (this.reelContainer.y + this.reelContainer.height);
        } else {
            bottomBackgroundHeight = this.app.screen.height - (this.reelContainer.y + totalReelHeight);
        }
    
        const bottomBackground = new Graphics()
            .rect(0, this.reelContainer.y + (isMobile ? this.reelContainer.height * 0.75 : totalReelHeight), 
                  this.app.screen.width, 
                  bottomBackgroundHeight)
            .fill({ color: COLORS.BACKGROUND });
        this.bottom.addChild(bottomBackground);
    
        const headerText = new Text({
            text: 'Премиер на България?',
            style: new TextStyle(TEXT_STYLES.HEADER)
        });
        headerText.x = Math.round((topBackground.width - headerText.width) / 2);
        headerText.y = isMobile ? 10 : Math.round(topBackground.height / 4); // Adjust these values as needed
        this.top.addChild(headerText);
    
        this.addChild(this.top);
        this.addChild(this.bottom);
    }    

    createPlayButton() {
        const margin = (this.app.screen.height - SYMBOL_SIZE * 3) / 2;
        const buttonWidth = 10;
        const buttonHeight = 10;
        const playStyle = new TextStyle(TEXT_STYLES.PLAY);
        const buttonLabel = new Text({
            text: 'Избери',
            style: playStyle
         });

       
        this.playButton = new Button(buttonLabel, playStyle, buttonWidth, buttonHeight, this.startPlay.bind(this));
        this.playButton.x = Math.round((this.bottom.width - this.playButton.width) / 2);
        if (this.app.screen.width < 768) {
            this.playButton.y = this.app.screen.height - this.playButton.height - 200; // Adjust '20' as needed
            this.playButton.y = (this.app.screen.height * 0.85) - this.playButton.height;
        } else {
            this.playButton.y = this.app.screen.height - margin + Math.round((margin - this.playButton.height) / 2);
        }
        this.bottom.addChild(this.playButton);
        this.updateContainerSize();
    }

    addEventListeners() {
        this.bottom.eventMode = 'static';
        this.playButton.cursor = 'pointer';
        this.playButton.addListener('pointerdown', this.startPlay.bind(this));
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

    checkJackpot(reels: Reel[]) {
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
            reel.finalSymbols = reel.visibleSymbols.map((symbol: Sprite) => symbol.texture);
        });

        const isJackpot = this.checkJackpot(this.reels);
        if (isJackpot) {
            const jackpotMessage = this.app.screen.width < 768 
                ? 'Поздравления!\nПолучавате прегръдка\nот новия премиер.'
                : 'Поздравления! Получавате прегръдка от новия премиер.';
            this.playButton.setText(jackpotMessage);
        } else {
            this.playButton.setText('Опитай отново!');
        }

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

        this.reels.forEach((reel: Reel) => {
            reel.symbols.forEach((symbol: Sprite) => {
                symbol.texture = this.slotTextures[Math.floor(Math.random() * this.slotTextures.length)];
            });
        });

        this.playButton.setText('Избери отново!');
        this.updateContainerSize();
    }

    updateContainerSize() {
        this.playButton.background.clear();
        this.playButton.background
            .fill({color: COLORS.BUTTON_NORMAL})
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

    update(delta: any) {
        for (let i = 0; i < REEL_COUNT; i++) {
            this.reels[i].update(this.slotTextures, this.reels);
        }
    }
}
