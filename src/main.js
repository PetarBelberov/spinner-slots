import { Application, Assets, Texture } from 'pixi.js';
import { GameScene } from './scenes/GameScenes.js';
import { COLORS } from './config.js';
import { updateTweens } from './utils/tweenUtils.js';

import borisovImage from './assets/borisov.jpg';
import doganImage from './assets/dogan.jpg';
import peevskiImage from './assets/peevski.jpg';
import petkovImage from './assets/petkov.jpg';
import vasilevImage from './assets/vasilev.jpg';

/**
 * Application setup and initialization.
 */
(async () => {
    const app = new Application();
    await app.init({
        backgroundColor: COLORS.BACKGROUND,
        backgroundAlpha: 1,
        resizeTo: window
    });

    document.body.appendChild(app.canvas);

    await Assets.load([
        borisovImage,
        doganImage,
        peevskiImage,
        petkovImage,
        vasilevImage,
    ]);

    const slotTextures = [
        borisovImage,
        doganImage,
        peevskiImage,
        petkovImage,
        vasilevImage,
    ].map(img => Texture.from(img));

    const gameScene = new GameScene(app, slotTextures);
    app.stage.addChild(gameScene);

    app.ticker.add((delta) => {
        gameScene.update(delta);
        updateTweens(Date.now());
    });
})();
