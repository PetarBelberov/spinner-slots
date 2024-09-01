import confetti from 'canvas-confetti';
import jackpotSoundFile from './assets/jackpot.mp3';
import borisovImage from './assets/borisov.jpg';
import doganImage from './assets/dogan.jpg';
import peevskiImage from './assets/peevski.jpg';
import petkovImage from './assets/petkov.jpg';
import vasilevImage from './assets/vasilev.jpg';
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
    BlurFilter,
    FillGradient,
} from 'pixi.js';

let jackpotSound;

(async () =>
{
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({
        backgroundColor: 0x020024,
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
        gradient.addColorStop(0, 'rgb(2,0,36)');
        gradient.addColorStop(1, 'rgb(121,9,34)');

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

    const REEL_WIDTH = 160;
    const SYMBOL_SIZE = 180;
    const SYMBOL_PADDING = 10;

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

    for (let i = 0; i < 5; i++)
    {
        const rc = new Container();

        rc.x = i * REEL_WIDTH;
        reelContainer.addChild(rc);

        const reel = {
            container: rc,
            symbols: [],
            position: 0,
            previousPosition: 0,
            blur: new BlurFilter(),
        };

        reel.blur.blurX = 0;
        reel.blur.blurY = 0;
        rc.filters = [reel.blur];

        // Build the symbols
        for (let j = 0; j < 4; j++)
        {
            const symbol = new Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);
            // Scale the symbol to fit symbol area.

            symbol.y = j * (SYMBOL_SIZE + SYMBOL_PADDING);
            symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.texture.width, SYMBOL_SIZE / symbol.texture.height);
            symbol.x = Math.round((REEL_WIDTH - symbol.width) / 2);
            reel.symbols.push(symbol);
            rc.addChild(symbol);
        }
        reels.push(reel);
    }
    app.stage.addChild(reelContainer);

    // Build top & bottom covers and position reelContainer
    const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;

    const totalReelHeight = 3 * (SYMBOL_SIZE + SYMBOL_PADDING) - SYMBOL_PADDING;
    reelContainer.y = (app.screen.height - totalReelHeight) / 2;
    reelContainer.x = (app.screen.width - REEL_WIDTH * 5) / 2;

    const top = new Graphics().rect(0, 0, app.screen.width, reelContainer.y).fill({ color: 0x0 });
    const bottom = new Graphics().rect(0, reelContainer.y + totalReelHeight, app.screen.width, app.screen.height - (reelContainer.y + totalReelHeight)).fill({ color: 0x0 });

    // Create gradient fill
    const fill = new FillGradient(0, 0, 0, 36 * 1.7);

    const colors = [0xffffff, 'white'].map((color) => Color.shared.setValue(color).toNumber());

    colors.forEach((number, index) =>
    {
        const ratio = index / colors.length;

        fill.addColorStop(ratio, number);
    });

    // Add play text
    const style = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 28,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: { fill },
        stroke: { color: 'green', width: 5 },
        dropShadow: {
            color: 0x000000,
            angle: Math.PI / 6,
            blur: 4,
            distance: 6,
        },
        wordWrap: true,
        wordWrapWidth: 440,
    });  

    const playStyle = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 28,
        fontWeight: 'bold',
        fill: { fill },
        align: 'center',
    }); 

    const playText = new Text({
        text: 'Избери',
        style: playStyle
    });

    // Create a green container for the play text
    const playTextContainer = new Container();
    playTextContainer.x = Math.round((bottom.width - playText.width) / 2);
    playTextContainer.y = app.screen.height - margin + Math.round((margin - playText.height) / 2);

    // Set the container background color
    const containerBackground = new Graphics()
        .fill('#4D761D') // Green color
        .roundRect(0, 0, playText.width + 20, playText.height + 20, 8) // 8 is the corner radius
        .fill();

    playTextContainer.addChild(containerBackground);
    playTextContainer.addChild(playText);

    bottom.addChild(playTextContainer);

    playTextContainer.eventMode = 'static';
    playTextContainer.cursor = 'pointer';

    playTextContainer.on('pointerover', () => {
        containerBackground.tint = 0x5A8A22; // Lighter green on hover
    });

    playTextContainer.on('pointerout', () => {
        containerBackground.tint = 0xFFFFFF; // Reset to original color
    });

    playTextContainer.on('pointerdown', () => {
        containerBackground.tint = 0x3F6118; // Darker green when pressed
    });

    playTextContainer.on('pointerup', () => {
        containerBackground.tint = 0x5A8A22; // Back to hover color
        startPlay(); // Assuming this is your function to start the game
    });

    playText.x = 10; // Half of the horizontal padding
    playText.y = 10; // Half of the vertical padding

    playTextContainer.addChild(containerBackground);
    playTextContainer.addChild(playText);

    bottom.addChild(playTextContainer);

    // Add header text
    const headerText = new Text({
        text: 'Премиер на България?',
        style: style
    });

    headerText.x = Math.round((top.width - headerText.width) / 2);
    headerText.y = Math.round((margin - headerText.height) / 2);
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
        containerBackground.clear();
        containerBackground
            .fill('#4D761D')
            .roundRect(0, 0, playText.width + 20, playText.height + 20, 8)
            .fill();
        
        playText.x = 10;
        playText.y = 10;
        
        playTextContainer.x = Math.round((bottom.width - containerBackground.width) / 2);
    }

    updateContainerSize();

    function flashJackpotText() {
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            playText.visible = !playText.visible;
            flashCount++;
            if (flashCount >= 10) {
                clearInterval(flashInterval);
                playText.visible = true;
            }
        }, 200);
    }

    // Function to start playing.
    function startPlay() {
        if (running) return;
        running = true;
    
        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            const extra = Math.floor(Math.random() * 3);
            const target = r.position + 10 + i * 5 + extra;
            const time = 2500 + i * 600 + extra * 600;
    
            tweenTo(r, 'position', target, time, backout(0.5), null, i === reels.length - 1 ? reelsComplete : null);
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
        playText.text = isJackpot ? 'Поздравления!' : 'Опитай отново!';
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
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            // Flash jackpot text
            flashJackpotText();

            // Set a timeout to refresh after showing the jackpot
            setTimeout(() => {
                refreshGame();
                
                // Re-enable interactivity after refresh
                bottom.eventMode = 'static';
                bottom.cursor = 'pointer';
            }, 3000); // Wait for 3 seconds before refreshing
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
        playText.text = 'Избери отново!';;
    }

    // Listen for animate update.
    app.ticker.add(() => {
        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            r.blur.blurY = (r.position - r.previousPosition) * 8;
            r.previousPosition = r.position;

            r.visibleSymbols = [];

            for (let j = 0; j < r.symbols.length; j++) {
                const s = r.symbols[j];
                const prevy = s.y;
                s.y = ((r.position + j) % r.symbols.length) * (SYMBOL_SIZE + SYMBOL_PADDING) - (SYMBOL_SIZE + SYMBOL_PADDING);
                if (s.y < 0 && prevy > SYMBOL_SIZE + SYMBOL_PADDING) {
                    if (Math.random() < 0.50) {
                        s.texture = reels[0].symbols[0].texture;
                    } else {
                        s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
                    }
                    s.scale.x = s.scale.y = Math.min((SYMBOL_SIZE - SYMBOL_PADDING) / s.texture.width, (SYMBOL_SIZE - SYMBOL_PADDING) / s.texture.height);
                    s.x = Math.round((REEL_WIDTH - s.width) / 2);
                }

                if (s.y >= 0 && s.y < (SYMBOL_SIZE + SYMBOL_PADDING) * 3) {
                    r.visibleSymbols.push(s);
                }
            }

            // Sort visible symbols by y position to ensure correct order
            r.visibleSymbols.sort((a, b) => a.y - b.y);
        }
    });

    // Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
    const tweening = [];

    function tweenTo(object, property, target, time, easing, onchange, oncomplete)
    {
        const tween = {
            object,
            property,
            propertyBeginValue: object[property],
            target,
            easing,
            time,
            change: onchange,
            complete: oncomplete,
            start: Date.now(),
        };

        tweening.push(tween);

        return tween;
    }
    // Listen for animate update.
    app.ticker.add(() =>
    {
        const now = Date.now();
        const remove = [];

        for (let i = 0; i < tweening.length; i++)
        {
            const t = tweening[i];
            const phase = Math.min(1, (now - t.start) / t.time);

            t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
            if (t.change) t.change(t);
            if (phase === 1)
            {
                t.object[t.property] = t.target;
                if (t.complete) t.complete(t);
                remove.push(t);
            }
        }
        for (let i = 0; i < remove.length; i++)
        {
            tweening.splice(tweening.indexOf(remove[i]), 1);
        }
    });

    // Basic lerp funtion.
    function lerp(a1, a2, t)
    {
        return a1 * (1 - t) + a2 * t;
    }

    // Backout function from tweenjs.
    // https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
    function backout(amount)
    {
        return (t) => --t * t * ((amount + 1) * t + amount) + 1;
    }
})();
