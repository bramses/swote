/**
 * Color extraction utilities for book covers
 * Extracts edge colors and calculates text contrast
 */

export type RGB = { r: number; g: number; b: number };

/**
 * Extract the dominant color from the right edge of an image
 * Uses canvas to sample the rightmost column of pixels
 */
export async function extractEdgeColor(imageSrc: string): Promise<RGB> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Sample the rightmost 5 pixels column and average them
      const sampleWidth = Math.min(5, img.width);
      const startX = img.width - sampleWidth;
      const imageData = ctx.getImageData(startX, 0, sampleWidth, img.height);
      const data = imageData.data;

      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      let count = 0;

      // Sample every 4th pixel for performance
      for (let i = 0; i < data.length; i += 16) {
        totalR += data[i];
        totalG += data[i + 1];
        totalB += data[i + 2];
        count++;
      }

      resolve({
        r: Math.round(totalR / count),
        g: Math.round(totalG / count),
        b: Math.round(totalB / count),
      });
    };

    img.onerror = () => {
      // Return a fallback color on error
      resolve({ r: 100, g: 100, b: 100 });
    };

    img.src = imageSrc;
  });
}

/**
 * Convert RGB to hex color string
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
 */
export function getLuminance(rgb: RGB): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Determine if text should be black or white for best contrast
 */
export function getContrastTextColor(backgroundColor: RGB): 'black' | 'white' {
  const luminance = getLuminance(backgroundColor);
  // Use 0.5 as threshold (slightly higher than 0.179 for better readability)
  return luminance > 0.4 ? 'black' : 'white';
}

/**
 * Cache for extracted colors to avoid re-processing
 */
const colorCache = new Map<string, RGB>();

/**
 * Get cached edge color or extract it
 */
export async function getCachedEdgeColor(imageSrc: string): Promise<RGB> {
  const cached = colorCache.get(imageSrc);
  if (cached) return cached;

  const color = await extractEdgeColor(imageSrc);
  colorCache.set(imageSrc, color);
  return color;
}
