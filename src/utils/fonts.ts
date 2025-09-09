import { StandardFonts as Fonts } from "@cantoo/pdf-lib";

export type Font = ArrayBuffer | Fonts | string | Uint8Array;
export class MemoryFont {
  public id: string = crypto.randomUUID();
  constructor(public value: Font) {}
}

export { Fonts };
/**
 * Creates a font reference that'll be used across the PDF tree.
 */
export const font = (font: Font): MemoryFont => new MemoryFont(font);
