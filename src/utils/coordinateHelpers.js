// src/utils/coordinateHelpers.js

/**
 * Convert screen coordinates to map coordinates (0-1 normalized)
 * @param {number} screenX - Screen X coordinate
 * @param {number} screenY - Screen Y coordinate
 * @param {Object} layout - Layout dimensions from calculateCanvasLayout
 * @returns {Object} Map coordinates {x, y} or null if outside bounds
 */
export const screenToMapCoords = (screenX, screenY, layout) => {
  const x = (screenX - layout.offsetX) / layout.scaledWidth;
  const y = (screenY - layout.offsetY) / layout.scaledHeight;
  
  // Return null if outside map bounds
  if (x < 0 || x > 1 || y < 0 || y > 1) {
    return null;
  }
  
  return { x, y };
};

/**
 * Convert map coordinates (0-1 normalized) to screen coordinates
 * @param {Object} mapPos - Map position {x, y} (0-1 normalized)
 * @param {Object} layout - Layout dimensions from calculateCanvasLayout
 * @returns {Object} Screen coordinates {x, y}
 */
export const mapToScreenCoords = (mapPos, layout) => {
  return {
    x: layout.offsetX + mapPos.x * layout.scaledWidth,
    y: layout.offsetY + mapPos.y * layout.scaledHeight
  };
};

/**
 * Clamp map coordinates to valid range (0-1)
 * @param {Object} pos - Position {x, y}
 * @returns {Object} Clamped position {x, y}
 */
export const clampMapCoords = (pos) => {
  return {
    x: Math.max(0, Math.min(1, pos.x)),
    y: Math.max(0, Math.min(1, pos.y))
  };
};

/**
 * Calculate distance between two points
 * @param {Object} pos1 - First position {x, y}
 * @param {Object} pos2 - Second position {x, y}
 * @returns {number} Distance
 */
export const distance = (pos1, pos2) => {
  return Math.hypot(pos2.x - pos1.x, pos2.y - pos1.y);
};

/**
 * Check if a screen point is within a radius of a map position
 * @param {number} screenX - Screen X coordinate
 * @param {number} screenY - Screen Y coordinate  
 * @param {Object} mapPos - Map position {x, y} (0-1 normalized)
 * @param {number} radius - Radius in screen pixels
 * @param {Object} layout - Layout dimensions
 * @returns {boolean} True if point is within radius
 */
export const isPointNearMapPos = (screenX, screenY, mapPos, radius, layout) => {
  const screenPos = mapToScreenCoords(mapPos, layout);
  const dist = Math.hypot(screenX - screenPos.x, screenY - screenPos.y);
  return dist <= radius;
};

/**
 * Check if two positions are equal (with optional tolerance)
 * @param {Object} pos1 - First position {x, y}
 * @param {Object} pos2 - Second position {x, y}
 * @param {number} tolerance - Optional tolerance (default: 0)
 * @returns {boolean} True if positions are equal
 */
export const positionsEqual = (pos1, pos2, tolerance = 0) => {
  if (!pos1 || !pos2) return false;
  return Math.abs(pos1.x - pos2.x) <= tolerance && 
         Math.abs(pos1.y - pos2.y) <= tolerance;
};