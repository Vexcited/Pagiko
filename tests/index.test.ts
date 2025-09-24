import { describe, expect, test } from "bun:test";
import {
  Div,
  div,
  font,
  Fonts,
  MemoryFont,
  Page,
  page,
  PDF,
  pdf,
  Text,
  text
} from "~/index";

describe("Main exports", () => {
  describe("Element exports", () => {
    test("should export Div class and div helper", () => {
      expect(Div).toBeDefined();
      expect(typeof Div).toBe("function");
      expect(div).toBeDefined();
      expect(typeof div).toBe("function");

      const divInstance = div();
      expect(divInstance).toBeInstanceOf(Div);
    });

    test("should export Page class and page helper", () => {
      expect(Page).toBeDefined();
      expect(typeof Page).toBe("function");
      expect(page).toBeDefined();
      expect(typeof page).toBe("function");

      const pageInstance = page();
      expect(pageInstance).toBeInstanceOf(Page);
    });

    test("should export PDF class and pdf helper", () => {
      expect(PDF).toBeDefined();
      expect(typeof PDF).toBe("function");
      expect(pdf).toBeDefined();
      expect(typeof pdf).toBe("function");

      const pdfInstance = pdf();
      expect(pdfInstance).toBeInstanceOf(PDF);
    });

    test("should export Text class and text helper", () => {
      expect(Text).toBeDefined();
      expect(typeof Text).toBe("function");
      expect(text).toBeDefined();
      expect(typeof text).toBe("function");

      const textInstance = text("Hello");
      expect(textInstance).toBeInstanceOf(Text);
    });
  });

  describe("Font exports", () => {
    test("should export MemoryFont class", () => {
      expect(MemoryFont).toBeDefined();
      expect(typeof MemoryFont).toBe("function");

      const memoryFont = new MemoryFont("test-font");
      expect(memoryFont).toBeInstanceOf(MemoryFont);
    });

    test("should export font helper function", () => {
      expect(font).toBeDefined();
      expect(typeof font).toBe("function");

      const fontInstance = font("test-font");
      expect(fontInstance).toBeInstanceOf(MemoryFont);
    });

    test("should export Fonts constant", () => {
      expect(Fonts).toBeDefined();
      expect(typeof Fonts).toBe("object");

      // Check some standard fonts
      expect(Fonts.Helvetica).toBeDefined();
      expect(Fonts.TimesRoman).toBeDefined();
      expect(Fonts.Courier).toBeDefined();
    });
  });

  describe("Integration test", () => {
    test("should create a complete PDF structure using exports", () => {
      const customFont = font(Fonts.Helvetica);

      const headerDiv = div()
        .w(500)
        .h(60)
        .bg(0x333333)
        .flex()
        .itemsCenter()
        .justifyCenter()
        .child(text("Document Header").font(customFont));

      const contentDiv = div()
        .flex()
        .flexCol()
        .child(text("Content line 1"))
        .child(text("Content line 2"));

      const footerDiv = div()
        .w(500)
        .h(40)
        .bg(0x666666)
        .child(text("Footer"));

      const documentPage = page()
        .size([500, 700])
        .child(headerDiv)
        .child(contentDiv)
        .child(footerDiv);

      const document = pdf()
        .author("Test Author")
        .font(customFont)
        .script("init", "console.log('PDF ready');")
        .child(documentPage);

      // Verify all components are properly instantiated
      expect(document).toBeInstanceOf(PDF);
      expect(documentPage).toBeInstanceOf(Page);
      expect(headerDiv).toBeInstanceOf(Div);
      expect(contentDiv).toBeInstanceOf(Div);
      expect(footerDiv).toBeInstanceOf(Div);
      expect(customFont).toBeInstanceOf(MemoryFont);
    });
  });

  describe("API consistency", () => {
    test("should have consistent method chaining across all elements", () => {
      const customFont = font(Fonts.TimesRoman);

      // Test that all elements support method chaining
      const divElement = div()
        .w(100)
        .h(100)
        .bg(0xFF0000)
        .flex()
        .itemsCenter();

      const textElement = text("Sample")
        .font(customFont)
        .textCenter()
        .leading(1.5);

      const pageElement = page()
        .w(400)
        .h(600)
        .child(divElement)
        .child(textElement);

      const pdfElement = pdf()
        .author("Chaining Test")
        .font(customFont)
        .child(pageElement);

      expect(divElement).toBeInstanceOf(Div);
      expect(textElement).toBeInstanceOf(Text);
      expect(pageElement).toBeInstanceOf(Page);
      expect(pdfElement).toBeInstanceOf(PDF);
    });
  });
});
