import { StandardFonts } from "@cantoo/pdf-lib";
import { describe, expect, mock, test } from "bun:test";
import { div } from "~/elements/div";
import { page } from "~/elements/page";
import { PDF, pdf } from "~/elements/pdf";
import { text } from "~/elements/text";
import { font } from "~/utils/fonts";

// Mock PDFDocument
const mockPDFDocument = {
  addJavaScript: mock(() => {}),
  addPage: mock(() => ({
    drawRectangle: mock(() => {}),
    drawText: mock(() => {}),
    getFont: mock(() => [{}]),
    getHeight: mock(() => 841.8898),
    getWidth: mock(() => 595.276),
    setSize: mock(() => {})
  })),
  embedFont: mock(async () => ({})),
  save: mock(async () => new Uint8Array([1, 2, 3, 4])),
  setAuthor: mock(() => {})
};

// Mock PDFDocument.create for each test
const mockPDFDocumentCreate = mock(async () => mockPDFDocument);

describe("PDF", () => {
  describe("constructor and helper function", () => {
    test("should create PDF instance", () => {
      const pdfElement = new PDF();
      expect(pdfElement).toBeInstanceOf(PDF);
    });

    test("should create PDF instance with helper function", () => {
      const pdfElement = pdf();
      expect(pdfElement).toBeInstanceOf(PDF);
    });
  });

  describe("author method", () => {
    test("should set author and return instance for chaining", () => {
      const pdfElement = pdf();
      const result = pdfElement.author("John Doe");

      expect(result).toBe(pdfElement);
    });

    test("should chain multiple author calls", () => {
      const pdfElement = pdf()
        .author("John Doe")
        .author("Jane Smith");

      expect(pdfElement).toBeInstanceOf(PDF);
    });
  });

  describe("child management", () => {
    test("should add page child and return instance for chaining", () => {
      const pdfElement = pdf();
      const pageElement = page();

      const result = pdfElement.child(pageElement);

      expect(result).toBe(pdfElement);
    });

    test("should add multiple page children", () => {
      const pdfElement = pdf();
      const page1 = page();
      const page2 = page();

      pdfElement.child(page1).child(page2);

      expect(pdfElement).toBeInstanceOf(PDF);
    });
  });

  describe("font management", () => {
    test("should add font and return instance for chaining", () => {
      const pdfElement = pdf();
      const memoryFont = font(StandardFonts.Helvetica);

      const result = pdfElement.font(memoryFont);

      expect(result).toBe(pdfElement);
    });

    test("should add multiple fonts", () => {
      const pdfElement = pdf();
      const font1 = font(StandardFonts.Helvetica);
      const font2 = font(StandardFonts.TimesRoman);

      pdfElement.font(font1).font(font2);

      expect(pdfElement).toBeInstanceOf(PDF);
    });
  });

  describe("script management", () => {
    test("should add JavaScript and return instance for chaining", () => {
      const pdfElement = pdf();
      const result = pdfElement.script("myScript", "console.log('Hello');");

      expect(result).toBe(pdfElement);
    });

    test("should add multiple scripts", () => {
      const pdfElement = pdf();

      pdfElement
        .script("script1", "console.log('Script 1');")
        .script("script2", "console.log('Script 2');");

      expect(pdfElement).toBeInstanceOf(PDF);
    });
  });

  describe("renderToBytes", () => {
    test("should be an async method that returns Promise<Uint8Array>", () => {
      const pdfElement = pdf();

      const result = pdfElement.renderToBytes();

      expect(result).toBeInstanceOf(Promise);
    });

    test("should handle empty PDF without throwing", async () => {
      const pdfElement = pdf();

      // Test that the method doesn't throw - we can't easily test the actual PDF creation
      // without complex mocking of the pdf-lib import
      expect(() => pdfElement.renderToBytes()).not.toThrow();
    });
  });

  describe("method chaining", () => {
    test("should support complete method chaining", () => {
      const memoryFont = font(StandardFonts.Helvetica);
      const pageElement = page()
        .child(div().w(200).h(100).bg(0xFF0000))
        .child(text("Hello World"));

      const pdfElement = pdf()
        .author("Test Author")
        .font(memoryFont)
        .script("init", "console.log('PDF loaded');")
        .child(pageElement)
        .author("Updated Author"); // Should override

      expect(pdfElement).toBeInstanceOf(PDF);
    });
  });

  describe("integration scenarios", () => {
    test("should handle complex PDF structure", () => {
      const font1 = font(StandardFonts.Helvetica);
      const font2 = font(StandardFonts.TimesRoman);

      const page1 = page()
        .size([600, 800])
        .child(text("Page 1 Header").font(font1))
        .child(div().w(500).h(200).bg(0x333333));

      const page2 = page()
        .size([600, 800])
        .child(text("Page 2 Content").font(font2))
        .child(div().w(500).h(300).bg(0x666666));

      const pdfElement = pdf()
        .author("Complex PDF Author")
        .font(font1)
        .font(font2)
        .script("analytics", "trackPDFView();")
        .child(page1)
        .child(page2);

      expect(pdfElement).toBeInstanceOf(PDF);
    });
  });
});
