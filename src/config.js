// config.js

export const REEL_WIDTH = 160;
export const SYMBOL_SIZE = 180;
export const SYMBOL_PADDING = 10;
export const REEL_COUNT = 5;
export const SYMBOL_COUNT = 4;

export const COLORS = {
    BACKGROUND: 0x020024,
    TOP_BOTTOM: 0x0,
    BUTTON_NORMAL: '#4D761D',
    BUTTON_HOVER: 0x5A8A22,
    BUTTON_PRESS: 0x3F6118
};

export const GRADIENT_COLORS = {
    START: 'rgb(2,0,36)',
    END: 'rgb(121,9,34)'
};

export const TEXT_STYLES = {
    HEADER: {
        fontFamily: 'Arial',
        fontSize: 28,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: 0xffffff, // Use a single color value
        stroke: { color: 'green', width: 5 },
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
        fontWeight: 'bold',
        fill: 0xffffff, // Use a single color value
        align: 'center',
    }
};

export const ANIMATION = {
    FLASH_COUNT: 50,
    FLASH_INTERVAL: 200,
    REFRESH_DELAY: 10000
};
