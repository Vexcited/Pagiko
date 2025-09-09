import {
  type RGB,
  rgb as rgbToPdf
} from "@cantoo/pdf-lib";

/**
 *
 * @example
 * hex(0xFFFFFF); // [1, 1, 1];
 */
export const hexToPdf = (hex: number): RGB => {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;

  return rgbToPdf(r / 255, g / 255, b / 255);
};

export type { RGB };
