import type { PDFFont, PDFPage } from "@cantoo/pdf-lib";
import type { Element } from "~/elements";
import type { MemoryFont } from "~/utils/fonts";
import { PageSizes } from "@cantoo/pdf-lib";
import Yoga, { Direction } from "yoga-layout";

export class Page {
  private _elements: Array<Element> = [];
  private _h: number;
  private _w: number;

  constructor() {
    [this._w, this._h] = PageSizes.A4;
  }

  child(element: Element): Page {
    this._elements.push(element);
    return this;
  }

  /**
   * Defines the height of the page in pt.
   * @default 841.8898 // A4
   */
  h(height: number): Page {
    this._h = height;
    return this;
  }

  /**
   * Calculate the layout and draw elements in the page.
   * Internal only, you must not use the function.
   *
   * @internal
   */
  render(page: PDFPage, fonts: Map<MemoryFont, PDFFont>): void {
    const root = Yoga.Node.create();
    page.setSize(this._w, this._h);

    // Append all nodes to Yoga to calculate layout.
    for (let i = 0; i < this._elements.length; i++) {
      const element = this._elements[i]!;
      const node = element.getLayoutNode(page, fonts);

      root.insertChild(node, i);
    }

    // Calculate the layout of all the elements inside this page.
    root.calculateLayout(this._w, this._h, Direction.LTR);

    // Once we have the layout with proper dimensions, we can draw to the PDF.
    for (const element of this._elements) {
      element.draw(page, fonts);
    }
  }

  /**
   * Defines the width and height of the page in pt.
   * @default [595.276, 841.8898] // A4
   * @example
   * page().size([595.276, 841.8898]);
   * @example
   * page().size(PageSizes.A4);
   */
  size(size: [w: number, h: number]): Page {
    [this._w, this._h] = size;
    return this;
  }

  /**
   * Defines the width of the page in pt.
   * @default 595.276 // A4
   */
  w(width: number): Page {
    this._w = width;
    return this;
  }
}
export const page = (): Page => new Page();
