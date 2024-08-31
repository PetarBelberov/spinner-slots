import confetti from 'canvas-confetti';
import jackpotSoundFile from './assets/jackpot.mp3';
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
    await app.init({ background: '#1099bb', resizeTo: window });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    // Load the textures
    await Assets.load([
        'https://pixijs.com/assets/eggHead.png',
        'https://pixijs.com/assets/flowerTop.png',
        'https://pixijs.com/assets/helmlok.png',
        'https://pixijs.com/assets/skully.png',
    ]);

    const REEL_WIDTH = 160;
    const SYMBOL_SIZE = 150;

    // Create different slot symbols
    const slotTextures = [
        Texture.from('https://pixijs.com/assets/eggHead.png'),
        Texture.from('https://pixijs.com/assets/flowerTop.png'),
        Texture.from('https://pixijs.com/assets/helmlok.png'),
        Texture.from('https://pixijs.com/assets/skully.png'),
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

            symbol.y = j * SYMBOL_SIZE;
            symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height);
            symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
            reel.symbols.push(symbol);
            rc.addChild(symbol);
        }
        reels.push(reel);
    }
    app.stage.addChild(reelContainer);

    // Build top & bottom covers and position reelContainer
    const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;

    reelContainer.y = margin;
    reelContainer.x = Math.round(app.screen.width - REEL_WIDTH * 5);
    const top = new Graphics().rect(0, 0, app.screen.width, margin).fill({ color: 0x0 });
    const bottom = new Graphics().rect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin).fill({ color: 0x0 });

    // Create gradient fill
    const fill = new FillGradient(0, 0, 0, 36 * 1.7);

    const colors = [0xffffff, 0x00ff99].map((color) => Color.shared.setValue(color).toNumber());

    colors.forEach((number, index) =>
    {
        const ratio = index / colors.length;

        fill.addColorStop(ratio, number);
    });

    // Add play text
    const style = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: { fill },
        stroke: { color: 0x4a1850, width: 5 },
        dropShadow: {
            color: 0x000000,
            angle: Math.PI / 6,
            blur: 4,
            distance: 6,
        },
        wordWrap: true,
        wordWrapWidth: 440,
    });

    const playText = new Text('Spin the wheels!', style);

    playText.x = Math.round((bottom.width - playText.width) / 2);
    playText.y = app.screen.height - margin + Math.round((margin - playText.height) / 2);
    bottom.addChild(playText);

    // Add header text
    const headerText = new Text('PIXI MONSTER SLOTS!', style);

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
            console.log(`Row ${row} symbols:`, rowSymbols.map(texture => texture.label));
            
            const rowMatch = rowSymbols.every(texture => texture === rowSymbols[0]);
            console.log(`Row ${row} match:`, rowMatch);
            
            if (rowMatch) {
                console.log(`Jackpot found in row ${row}`);
                return true;
            }
        }
        console.log('No jackpot found');
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
        playText.text = isJackpot ? 'JACKPOT!' : 'Spin again!';

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
        playText.text = 'Spin the wheels!';
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
                s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
                if (s.y < 0 && prevy > SYMBOL_SIZE) {
                    if (Math.random() < 0.50) {
                        s.texture = reels[0].symbols[0].texture;
                    } else {
                        s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
                    }
                    s.scale.x = s.scale.y = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
                    s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
                }

                if (s.y >= 0 && s.y < SYMBOL_SIZE * 3) {
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
