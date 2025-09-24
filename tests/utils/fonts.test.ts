import { StandardFonts } from "@cantoo/pdf-lib";
import { describe, expect, test } from "bun:test";
import { font, Fonts, MemoryFont } from "~/utils/fonts";

describe("fonts", () => {
  describe("MemoryFont", () => {
    test("should create a MemoryFont with a unique ID", () => {
      const font1 = new MemoryFont(StandardFonts.Helvetica);
      const font2 = new MemoryFont(StandardFonts.TimesRoman);

      expect(font1.id).toBeDefined();
      expect(font2.id).toBeDefined();
      expect(font1.id).not.toBe(font2.id);
      expect(typeof font1.id).toBe("string");
      expect(typeof font2.id).toBe("string");
    });

    test("should store the font value", () => {
      const fontValue = StandardFonts.Helvetica;
      const memoryFont = new MemoryFont(fontValue);

      expect(memoryFont.value).toBe(fontValue);
    });

    test("should work with different font types", () => {
      const standardFont = new MemoryFont(StandardFonts.CourierBold);
      const stringFont = new MemoryFont("CustomFont");
      const arrayBufferFont = new MemoryFont(new ArrayBuffer(100));
      const uint8ArrayFont = new MemoryFont(new Uint8Array(50));

      expect(standardFont.value).toBe(StandardFonts.CourierBold);
      expect(stringFont.value).toBe("CustomFont");
      expect(arrayBufferFont.value).toBeInstanceOf(ArrayBuffer);
      expect(uint8ArrayFont.value).toBeInstanceOf(Uint8Array);
    });
  });

  describe("font helper function", () => {
    test("should create a MemoryFont instance", () => {
      const result = font(StandardFonts.Helvetica);

      expect(result).toBeInstanceOf(MemoryFont);
      expect(result.value).toBe(StandardFonts.Helvetica);
      expect(result.id).toBeDefined();
    });

    test("should create different instances for same font", () => {
      const font1 = font(StandardFonts.Helvetica);
      const font2 = font(StandardFonts.Helvetica);

      expect(font1.id).not.toBe(font2.id);
      expect(font1.value).toBe(font2.value);
    });
  });

  describe("Fonts export", () => {
    test("should export StandardFonts as Fonts", () => {
      expect(Fonts).toBe(StandardFonts);
      expect(Fonts.Helvetica).toBeDefined();
      expect(Fonts.TimesRoman).toBeDefined();
      expect(Fonts.Courier).toBeDefined();
    });
  });
});
