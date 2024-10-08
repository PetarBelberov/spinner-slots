import { TextStyleAlign, TextStyleFontStyle, TextStyleFontWeight } from "pixi.js";

export const REEL_WIDTH = 140;
export const SYMBOL_SIZE = 190;
export const SYMBOL_PADDING = 10;
export const REEL_COUNT = 5;
export const SYMBOL_COUNT = 4;

export const COLORS = {
    BACKGROUND: '#0e1801',
    TOP_BOTTOM: '#0e1801',
    BUTTON_NORMAL: '#305703',
    BUTTON_HOVER: 0x5A8A22,
    BUTTON_PRESS: 0x3F6118
};

export const GRADIENT_COLORS = {
    START: 'rgb(150,50,50)',
    END: 'rgb(121,9,34)'
};

export const TEXT_STYLES = {
    HEADER: {
        fontFamily: 'Arial',
        fontSize: 28,
        fontStyle: 'italic' as TextStyleFontStyle,
        fontWeight: 'bold' as TextStyleFontWeight,
        fill: 0xffffff, // Use a single color value
        stroke: { color: '#101b01', width: 5 },
        dropShadow: {
            color: 0x000000,
            angle: Math.PI / 6,
            blur: 4,
            distance: 6,
        },
        wordWrap: true,
        wordWrapWidth: 440,
    },
    PLAY: {
        fontFamily: 'Arial',
        fontSize: 22,
        fontWeight: 'bold' as TextStyleFontWeight,
        fill: 0xffffff, // Use a single color value
        align: 'center' as TextStyleAlign,
    }
};

export const ANIMATION = {
    FLASH_COUNT: 50,
    FLASH_INTERVAL: 200,
    REFRESH_DELAY: 10000
};
