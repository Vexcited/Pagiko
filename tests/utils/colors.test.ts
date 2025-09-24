import { describe, expect, test } from "bun:test";
import { hexToPdf } from "~/utils/colors";

describe("colors", () => {
  describe("hexToPdf", () => {
    test("should convert white hex to PDF RGB", () => {
      const result = hexToPdf(0xFFFFFF);
      expect(result.red).toBeCloseTo(1, 5);
      expect(result.green).toBeCloseTo(1, 5);
      expect(result.blue).toBeCloseTo(1, 5);
    });

    test("should convert black hex to PDF RGB", () => {
      const result = hexToPdf(0x000000);
      expect(result.red).toBeCloseTo(0, 5);
      expect(result.green).toBeCloseTo(0, 5);
      expect(result.blue).toBeCloseTo(0, 5);
    });

    test("should convert red hex to PDF RGB", () => {
      const result = hexToPdf(0xFF0000);
      expect(result.red).toBeCloseTo(1, 5);
      expect(result.green).toBeCloseTo(0, 5);
      expect(result.blue).toBeCloseTo(0, 5);
    });

    test("should convert green hex to PDF RGB", () => {
      const result = hexToPdf(0x00FF00);
      expect(result.red).toBeCloseTo(0, 5);
      expect(result.green).toBeCloseTo(1, 5);
      expect(result.blue).toBeCloseTo(0, 5);
    });

    test("should convert blue hex to PDF RGB", () => {
      const result = hexToPdf(0x0000FF);
      expect(result.red).toBeCloseTo(0, 5);
      expect(result.green).toBeCloseTo(0, 5);
      expect(result.blue).toBeCloseTo(1, 5);
    });

    test("should convert custom color hex to PDF RGB", () => {
      const result = hexToPdf(0x7F7F7F); // 50% gray
      expect(result.red).toBeCloseTo(0.498, 2);
      expect(result.green).toBeCloseTo(0.498, 2);
      expect(result.blue).toBeCloseTo(0.498, 2);
    });

    test("should convert another custom color", () => {
      const result = hexToPdf(0xABCDEF);
      expect(result.red).toBeCloseTo(171 / 255, 3);
      expect(result.green).toBeCloseTo(205 / 255, 3);
      expect(result.blue).toBeCloseTo(239 / 255, 3);
    });
  });
});
