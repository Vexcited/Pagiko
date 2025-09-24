import { PageSizes } from "@cantoo/pdf-lib";
import { describe, expect, mock, test } from "bun:test";
import { div } from "~/elements/div";
import { Page, page } from "~/elements/page";
import { text } from "~/elements/text";

// Mock PDFPage for testing
const mockPDFFont = {
  heightAtSize: (size: number) => size,
  widthOfTextAtSize: (text: string, size: number) => text.length * size * 0.6
};

const mockPDFPage = {
  doc: {
    defaultWordBreaks: /\s/g
  },
  drawRectangle: mock(() => {}),
  drawText: mock(() => {}),
  getFont: mock(() => [mockPDFFont]),
  getHeight: mock(() => 841.8898), // A4 height
  getWidth: mock(() => 595.276), // A4 width
  setSize: mock(() => {})
};

describe("Page", () => {
  describe("constructor and helper function", () => {
    test("should create Page instance", () => {
      const pageElement = new Page();
      expect(pageElement).toBeInstanceOf(Page);
    });

    test("should create Page instance with helper function", () => {
      const pageElement = page();
      expect(pageElement).toBeInstanceOf(Page);
    });
  });

  describe("child management", () => {
    test("should add child and return instance for chaining", () => {
      const pageElement = page();
      const child = div();

      const result = pageElement.child(child);

      expect(result).toBe(pageElement);
    });

    test("should add multiple children", () => {
      const pageElement = page();
      const child1 = div();
      const child2 = text("Hello");

      pageElement.child(child1).child(child2);

      expect(pageElement).toBeInstanceOf(Page);
    });
  });

  describe("size methods", () => {
    test("should set width", () => {
      const pageElement = page();
      const result = pageElement.w(500);

      expect(result).toBe(pageElement);
    });

    test("should set height", () => {
      const pageElement = page();
      const result = pageElement.h(700);

      expect(result).toBe(pageElement);
    });

    test("should set size with array", () => {
      const pageElement = page();
      const result = pageElement.size([600, 800]);

      expect(result).toBe(pageElement);
    });

    test("should set size with PageSizes constant", () => {
      const pageElement = page();
      const result = pageElement.size(PageSizes.A4);

      expect(result).toBe(pageElement);
    });

    test("should set size with PageSizes Letter", () => {
      const pageElement = page();
      const result = pageElement.size(PageSizes.Letter);

      expect(result).toBe(pageElement);
    });
  });

  describe("render", () => {
    test("should call setSize on PDFPage", () => {
      const pageElement = page();
      const fonts = new Map();

      pageElement.render(mockPDFPage as any, fonts);

      expect(mockPDFPage.setSize).toHaveBeenCalled();
    });

    test("should render with custom size", () => {
      const pageElement = page().size([400, 600]);
      const fonts = new Map();

      pageElement.render(mockPDFPage as any, fonts);

      expect(mockPDFPage.setSize).toHaveBeenCalledWith(400, 600);
    });

    test("should render with children elements", () => {
      const child1 = div().w(100).h(50).bg(0xFF0000);
      const child2 = text("Hello World");

      const pageElement = page()
        .child(child1)
        .child(child2);

      const fonts = new Map();

      // Test that render doesn't throw with children
      expect(() => {
        pageElement.render(mockPDFPage as any, fonts);
      }).not.toThrow();

      expect(mockPDFPage.setSize).toHaveBeenCalled();
    });

    test("should handle empty page", () => {
      const pageElement = page();
      const fonts = new Map();

      expect(() => {
        pageElement.render(mockPDFPage as any, fonts);
      }).not.toThrow();

      expect(mockPDFPage.setSize).toHaveBeenCalled();
    });
  });

  describe("method chaining", () => {
    test("should support complete method chaining", () => {
      const child1 = div().w(100).h(100);
      const child2 = text("Sample text");

      const pageElement = page()
        .w(600)
        .h(800)
        .size([700, 900])
        .child(child1)
        .child(child2)
        .w(500) // Should override previous width
        .h(750); // Should override previous height

      expect(pageElement).toBeInstanceOf(Page);
    });

    test("should chain multiple size operations", () => {
      const pageElement = page()
        .size(PageSizes.A4)
        .w(400)
        .h(600)
        .size(PageSizes.Letter);

      expect(pageElement).toBeInstanceOf(Page);
    });
  });

  describe("default values", () => {
    test("should use A4 size by default", () => {
      const pageElement = page();
      const fonts = new Map();

      pageElement.render(mockPDFPage as any, fonts);

      // A4 dimensions - using more lenient matching due to potential precision differences
      const calls = (mockPDFPage.setSize as any).mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBeCloseTo(595.276, 1);
      expect(lastCall[1]).toBeCloseTo(841.8898, 1);
    });
  });

  describe("integration scenarios", () => {
    test("should handle complex page layout", () => {
      const header = div()
        .w(500)
        .h(50)
        .bg(0x333333)
        .child(text("Header"));

      const content = div()
        .flex()
        .flexCol()
        .child(text("Content line 1"))
        .child(text("Content line 2"));

      const footer = div()
        .w(500)
        .h(30)
        .bg(0x666666)
        .child(text("Footer"));

      const pageElement = page()
        .size([500, 700])
        .child(header)
        .child(content)
        .child(footer);

      expect(pageElement).toBeInstanceOf(Page);
    });
  });
});
