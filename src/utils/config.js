// src/utils/config.js

/**
 * Central configuration for the Fog of War VTT
 * All magic numbers and constants should be defined here
 */

export const CONFIG = {
  TOKEN: {
    RADIUS: 12,
    SHADOW_OFFSET: 2,
    HIGHLIGHT_OFFSET: 3,
    HIGHLIGHT_RADIUS: 4,
  },
  CANVAS: {
    BLUR_AMOUNT: 20,
    BACKGROUND_COLOR: '#2a2a2a',
    DARKNESS_OPACITY: 0.90,
  },
  MOVEMENT: {
    STEP: 0.02,
    TOUCH_DELAY_MS: 100,
    UPDATE_DEBOUNCE_MS: 50,
  },
  DEFAULTS: {
    START_POS: { x: 0.85, y: 0.85 },
    REVEAL_RADIUS_PERCENT: 8,
    ZOOM: 1,
    PLAYER_ZOOM: 3,
  },
  VISION: {
    GRADIENT_INNER_STOP: 0,
    GRADIENT_MID_STOP: 0.75,
    GRADIENT_OUTER_STOP: 1,
    GRADIENT_INNER_ALPHA: 1,
    GRADIENT_MID_ALPHA: 0.9,
    GRADIENT_OUTER_ALPHA: 0,
  },
  COLORS: {
    TOKEN_FILL: '#3b82f6',
    TOKEN_STROKE: '#1e40af',
    TOKEN_SHADOW: 'rgba(0, 0, 0, 0.3)',
    TOKEN_HIGHLIGHT: 'rgba(255, 255, 255, 0.5)',
    GM_HALO: { r: 59, g: 130, b: 246 },
    TORCH_HALO: { r: 255, g: 255, b: 150 },
    TORCH_HALO_OUTER: { r: 255, g: 255, b: 0 },
  }
};

/**
 * WebSocket message types
 */
export const WS_MESSAGE_TYPES = {
  INIT: 'init',
  UPDATE: 'update',
  RADIUS: 'radius',
  TORCH_TOGGLE: 'torchToggle',
  MAP: 'map',
  RESET: 'reset',
  MOVE: 'move',
};

/**
 * Helper to create color strings from RGB objects
 */
export const rgbaString = (color, alpha = 1) => {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
};
