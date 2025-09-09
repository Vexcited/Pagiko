import type { PDFFont } from "@cantoo/pdf-lib";
import type { Page } from "./page";
import type { MemoryFont } from "~/utils/fonts";
import { PDFDocument } from "@cantoo/pdf-lib";

export class PDF {
  private _author?: string;
  private _children: Array<Page> = [];
  private _fonts: Set<MemoryFont> = new Set();
  private _javascripts: Map<string, string> = new Map();

  /**
   * Set this document's author metadata. The author will appear in the
   * "Document Properties" section of most PDF readers.
   *
   * @param author The author of this document.
   */
  author(author: string): PDF {
    this._author = author;
    return this;
  }

  child(page: Page): PDF {
    this._children.push(page);
    return this;
  }

  font(font: MemoryFont): PDF {
    this._fonts.add(font);
    return this;
  }

  async renderToBytes(): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();

    // Embed all the fonts we need for usage within the PDF.
    const fonts = new Map<MemoryFont, PDFFont>();
    if (this._fonts.size > 0) {
      await Promise.all(
        this._fonts.values().map(async (memory) => {
          const font = await pdf.embedFont(memory.value);
          fonts.set(memory, font);
        })
      );
    }

    if (this._author) pdf.setAuthor(this._author);

    if (this._javascripts.size > 0) {
      for (const [name, script] of this._javascripts.entries()) {
        pdf.addJavaScript(name, script);
      }
    }

    for (const child of this._children) {
      const page = pdf.addPage();
      console.log("-- rendering page");
      child.render(page, fonts);
    }

    return pdf.save();
  }

  script(name: string, script: string): PDF {
    this._javascripts.set(name, script);
    return this;
  }
}
export const pdf = (): PDF => new PDF();
