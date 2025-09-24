import { StandardFonts, TextAlignment } from "@cantoo/pdf-lib";
import { describe, expect, mock, test } from "bun:test";
import { Text, text } from "~/elements/text";
import { font } from "~/utils/fonts";

// Mock PDFPage and PDFFont for testing
const mockPDFFont = {
  heightAtSize: mock((size: number) => size),
  widthOfTextAtSize: mock((t: string, size: number) => t.length * size * 0.6)
};

const mockPDFPage = {
  doc: {
    defaultWordBreaks: /\s/g
  },
  drawText: mock(() => {}),
  getFont: mock(() => [mockPDFFont]),
  getHeight: mock(() => 800)
};

describe("Text", () => {
  describe("constructor", () => {
    test("should create Text instance with value", () => {
      const textElement = new Text("Hello World");
      expect(textElement).toBeInstanceOf(Text);
    });
  });

  describe("text helper function", () => {
    test("should create Text instance", () => {
      const textElement = text("Hello World");
      expect(textElement).toBeInstanceOf(Text);
    });

    test("should work with empty string", () => {
      const textElement = text("");
      expect(textElement).toBeInstanceOf(Text);
    });

    test("should work with multiline text", () => {
      const textElement = text("Line 1\nLine 2\nLine 3");
      expect(textElement).toBeInstanceOf(Text);
    });
  });

  describe("font method", () => {
    test("should set font and return instance for chaining", () => {
      const memoryFont = font(StandardFonts.Helvetica);
      const textElement = text("Hello");
      const result = textElement.font(memoryFont);

      expect(result).toBe(textElement);
    });
  });

  describe("text alignment methods", () => {
    test("should set text center alignment", () => {
      const textElement = text("Hello");
      const result = textElement.textCenter();

      expect(result).toBe(textElement);
    });

    test("should set text left alignment", () => {
      const textElement = text("Hello");
      const result = textElement.textLeft();

      expect(result).toBe(textElement);
    });

    test("should set text right alignment", () => {
      const textElement = text("Hello");
      const result = textElement.textRight();

      expect(result).toBe(textElement);
    });

    test("should chain alignment methods", () => {
      const textElement = text("Hello")
        .textCenter()
        .textLeft()
        .textRight();

      expect(textElement).toBeInstanceOf(Text);
    });
  });

  describe("leading methods", () => {
    test("should set line height with leading method", () => {
      const textElement = text("Hello");
      const result = textElement.leading(1.5);

      expect(result).toBe(textElement);
    });

    test("should set line height to 1 with leadingNone", () => {
      const textElement = text("Hello");
      const result = textElement.leadingNone();

      expect(result).toBe(textElement);
    });

    test("should chain leading methods", () => {
      const textElement = text("Hello")
        .leading(2.0)
        .leadingNone()
        .leading(1.2);

      expect(textElement).toBeInstanceOf(Text);
    });
  });

  describe("getLayoutNode", () => {
    test("should create and return layout node", () => {
      const textElement = text("Hello World");
      const fonts = new Map();

      const node = textElement.getLayoutNode(mockPDFPage as any, fonts);

      expect(node).toBeDefined();
      expect(typeof node.free).toBe("function");

      node.free();
    });

    test("should return same node on subsequent calls", () => {
      const textElement = text("Hello World");
      const fonts = new Map();

      const node1 = textElement.getLayoutNode(mockPDFPage as any, fonts);
      const node2 = textElement.getLayoutNode(mockPDFPage as any, fonts);

      expect(node1).toBe(node2);

      node1.free();
    });

    test("should handle empty text", () => {
      const textElement = text("");
      const fonts = new Map();

      const node = textElement.getLayoutNode(mockPDFPage as any, fonts);

      expect(node).toBeDefined();

      node.free();
    });
  });

  describe("draw", () => {
    test("should call drawText on page", () => {
      const textElement = text("Hello World");
      const fonts = new Map();

      // Create layout node first
      const node = textElement.getLayoutNode(mockPDFPage as any, fonts);

      // Mock the computed dimensions
      node.getComputedWidth = mock(() => 200);
      node.getComputedHeight = mock(() => 50);

      textElement.draw(mockPDFPage as any, fonts);

      expect(mockPDFPage.drawText).toHaveBeenCalled();

      node.free();
    });
  });

  describe("method chaining", () => {
    test("should support complete method chaining", () => {
      const memoryFont = font(StandardFonts.Helvetica);

      const textElement = text("Hello World")
        .font(memoryFont)
        .textCenter()
        .leading(1.5)
        .leadingNone()
        .textLeft()
        .textRight();

      expect(textElement).toBeInstanceOf(Text);
    });
  });
});
