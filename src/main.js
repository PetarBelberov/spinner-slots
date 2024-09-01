import confetti from 'canvas-confetti';
import jackpotSoundFile from './assets/jackpot.mp3';
import borisovImage from './assets/borisov.jpg';
import doganImage from './assets/dogan.jpg';
import peevskiImage from './assets/peevski.jpg';
import petkovImage from './assets/petkov.jpg';
import vasilevImage from './assets/vasilev.jpg';
import { Reel } from './components/Reel.js';
import { Button } from './components/Button.js';
import { tweenTo, updateTweens, backout } from './utils/tweenUtils.js';
import {
    REEL_WIDTH,
    SYMBOL_SIZE,
    SYMBOL_PADDING,
    REEL_COUNT,
    COLORS,
    GRADIENT_COLORS,
    TEXT_STYLES,
    ANIMATION
} from './config.js';
import {
    Application,
    Assets,
    Color,
    Container,
    Texture,
    Sprite,
    Graphics,
    Text,
    TextStyle,
    FillGradient,
} from 'pixi.js';

let jackpotSound;

(async () =>
{
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({
        backgroundColor: COLORS.BACKGROUND,
        backgroundAlpha: 1,
        resizeTo: window
    });

    const gradientTexture = createGradientTexture();
    const backgroundSprite = new Sprite(gradientTexture);
    backgroundSprite.width = app.screen.width;
    backgroundSprite.height = app.screen.height;
    app.stage.addChildAt(backgroundSprite, 0);

    function createGradientTexture() {
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

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    // Load the textures
    await Assets.load([
        borisovImage,
        doganImage,
        peevskiImage,
        petkovImage,
        vasilevImage,
    ]);

    // Create different slot symbols
    const slotTextures = [
        Texture.from(borisovImage),
        Texture.from(doganImage),
        Texture.from(peevskiImage),
        Texture.from(petkovImage),
        Texture.from(vasilevImage),
    ];

    // Build the reels
    const reels = [];
    const reelContainer = new Container();

    for (let i = 0; i < REEL_COUNT; i++) {
        const reel = new Reel(slotTextures);
        reel.container.x = i * REEL_WIDTH;
        reelContainer.addChild(reel.container);
        reels.push(reel);
    }
    app.stage.addChild(reelContainer);

    // Build top & bottom covers and position reelContainer
    const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;

    const totalReelHeight = 3 * (SYMBOL_SIZE + SYMBOL_PADDING) - SYMBOL_PADDING;
    reelContainer.y = (app.screen.height - totalReelHeight) / 2;
    reelContainer.x = (app.screen.width - REEL_WIDTH * 5) / 2;

    const top = new Container();
    const topBackground = new Graphics().rect(0, 0, app.screen.width, reelContainer.y).fill({ color: COLORS.TOP_BOTTOM });

    const bottom = new Container();
    const bottomBackground  = new Graphics().rect(0, reelContainer.y + totalReelHeight, app.screen.width, app.screen.height - (reelContainer.y + totalReelHeight)).fill({ color: COLORS.TOP_BOTTOM });

    // Create gradient fill
    const fill = new FillGradient(0, 0, 0, 36 * 1.7);

    const colors = [0xffffff, 'white'].map((color) => Color.shared.setValue(color).toNumber());

    colors.forEach((number, index) =>
    {
        const ratio = index / colors.length;

        fill.addColorStop(ratio, number);
    });

    // Add play text
    const style = new TextStyle(TEXT_STYLES.HEADER);  
    const playStyle = new TextStyle(TEXT_STYLES.PLAY);

    const buttonWidth = 10; // Adjust this value as needed
    const buttonHeight = 10; // Adjust this value as needed
    const playButton = new Button('Избери', playStyle, buttonWidth, buttonHeight, startPlay);
    playButton.x = Math.round((bottomBackground.width - playButton.width) / 2);
    playButton.y = app.screen.height - margin + Math.round((margin - playButton.height) / 2);
    bottom.addChild(bottomBackground);
    bottom.addChild(playButton);

    // Add header text
    const headerText = new Text({
        text: 'Премиер на България?',
        style: style
    });

    headerText.x = Math.round((topBackground.width - headerText.width) / 2);
    headerText.y = Math.round((margin - headerText.height) / 2);
    top.addChild(topBackground);
    top.addChild(headerText);

    app.stage.addChild(top);
    app.stage.addChild(bottom);

    // Set the interactivity.
    bottom.eventMode = 'static';
    bottom.cursor = 'pointer';
    bottom.addListener('pointerdown', () =>
    {
        startPlay();
    });

    let running = false;
    jackpotSound = new Audio(jackpotSoundFile);

    function updateContainerSize() {
        playButton.background.clear();
        playButton.background
            .fill('#4D761D')
            .roundRect(0, 0, playButton.buttonText.width + 20, playButton.buttonText.height + 20, 8)
            .fill();
        
        playButton.buttonText.x = 10;
        playButton.buttonText.y = 10;
        
        playButton.x = Math.round((bottom.width - playButton.width) / 2);
    }

    updateContainerSize();

    function flashJackpotText() {
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            playButton.buttonText.visible = !playButton.buttonText.visible;
            flashCount++;
            if (flashCount >= ANIMATION.FLASH_COUNT) {
                clearInterval(flashInterval);
                playButton.buttonText.visible = true;
            }
        }, ANIMATION.FLASH_INTERVAL);
    }

    // Function to start playing.
    function startPlay() {
        if (running) return;
        running = true;
    
        for (let i = 0; i < REEL_COUNT; i++) {
            const r = reels[i];
            const extra = Math.floor(Math.random() * 3);
            const target = r.position + 10 + i * 5 + extra;
            const time = 2500 + i * 600 + extra * 600;
    
            tweenTo(r, 'position', target, time, backout(0.5), null, i === REEL_COUNT - 1 ? reelsComplete : null);
        }
    }

    function checkJackpot(reels) {
        for (let row = 0; row < 3; row++) {
            const rowSymbols = reels.map(reel => reel.finalSymbols[row]);
            const rowMatch = rowSymbols.every(texture => texture === rowSymbols[0]);
            
            if (rowMatch) {
                return true;
            }
        }
        return false;
    }

    // Reels done handler.
    function reelsComplete() {
        running = false;
    
        // Capture the final state of the reels
        reels.forEach((reel, i) => {
            reel.finalSymbols = reel.visibleSymbols.map(symbol => symbol.texture);
        });
    
        const isJackpot = checkJackpot(reels);
        playButton.setText(isJackpot ? 'Поздравления!' : 'Опитай отново!');
        updateContainerSize();

        if (isJackpot) {
            // Disable interactivity
            bottom.eventMode = 'none';
            bottom.cursor = 'default';

            // Play jackpot sound
            jackpotSound.load();
            jackpotSound.play().catch(error => console.log('Audio play failed:', error));

            // Trigger confetti
            confetti({
                particleCount: 500,
                spread: 140,
                origin: { y: 0.6 }
            });

            // Flash jackpot text
            flashJackpotText();

            // Set a timeout to refresh after showing the jackpot
            setTimeout(() => {
                refreshGame();
                bottom.eventMode = 'static';
                bottom.cursor = 'pointer';
            }, ANIMATION.REFRESH_DELAY);
        }
    }

    function refreshGame() {
        // Reset reel positions
        reels.forEach(reel => {
            reel.position = 0;
            reel.previousPosition = 0;

            // Stop the jackpot sound
            jackpotSound.pause();
            jackpotSound.currentTime = 0;
        });
    
        // Randomize symbols
        reels.forEach(reel => {
            reel.symbols.forEach(symbol => {
                symbol.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
            });
        });
    
        // Reset play text
        playButton.setText('Избери отново!');
    }

    // Listen for animate update.
    app.ticker.add(() => {
        for (let i = 0; i < REEL_COUNT; i++) {
            reels[i].update(slotTextures, reels);
        }
    });

    // Listen for animate update.
    app.ticker.add(() =>
    {
        const now = Date.now();
        updateTweens(now);
    });
})();
