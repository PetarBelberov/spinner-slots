import { Application, Container, Graphics, Texture } from 'pixi.js';
import { Reel } from '../components/Reel';
import { Button } from '../components/Button';

export interface GameSceneProps {
    app: Application;
    slotTextures: Texture[];
    reels: Reel[];
    running: boolean;
    jackpotSound: HTMLAudioElement;
    reelContainer: Container;
    top: Container;
    bottom: Container;
    playButton: Button;
}
