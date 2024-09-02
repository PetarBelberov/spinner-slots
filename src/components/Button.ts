import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { COLORS } from '../config';

export class Button extends Container {
    background: Graphics;
    buttonText: Text;
    onClick: () => void;

    constructor(text: Text, style: TextStyle, width: number, height: number, onClick: () => void) {
        super();

        this.buttonText = new Text({
            text: text.text,
            style: style
        });
        this.buttonText.x = 10;
        this.buttonText.y = 10;

        this.background = new Graphics()
            .fill(COLORS.BUTTON_NORMAL)
            .roundRect(0, 0, width, height, 8)
            .fill();

        this.addChild(this.background);
        this.addChild(this.buttonText);

        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerover', this.onPointerOver.bind(this));
        this.on('pointerout', this.onPointerOut.bind(this));
        this.on('pointerdown', this.onPointerDown.bind(this));
        this.on('pointerup', this.onPointerUp.bind(this));

        this.onClick = onClick;
    }

    onPointerOver() {
        this.background.tint = 0x5A8A22; // Lighter green on hover
    }

    onPointerOut() {
        this.background.tint = 0xFFFFFF; // Reset to original color
    }

    onPointerDown() {
        this.background.tint = 0x3F6118; // Darker green when pressed
    }

    onPointerUp() {
        this.background.tint = 0x5A8A22; // Back to hover color
        if (this.onClick) this.onClick();
    }

    setText(newText: string) {
        this.buttonText.text = newText;
    }
}
