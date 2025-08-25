import {
  PageSizes,
  PDFDocument,
  PDFPage,
  type RGB,
  rgb as rgbToPdf,
} from "@cantoo/pdf-lib";
import Yoga, {
  Direction,
  Display,
  FlexDirection,
  Overflow,
  PositionType,
  type Node,
} from "yoga-layout";

export class PDF {
  private _author?: string;
  private _javascripts: Map<string, string> = new Map();
  private _children: Array<Page> = [];

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

  script(name: string, script: string): PDF {
    this._javascripts.set(name, script);
    return this;
  }

  child(page: Page): PDF {
    this._children.push(page);
    return this;
  }

  async renderToBytes(): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();

    if (this._author) pdf.setAuthor(this._author);

    if (this._javascripts.size > 0) {
      for (const [name, script] of this._javascripts.entries()) {
        pdf.addJavaScript(name, script);
      }
    }

    for (const child of this._children) {
      const page = pdf.addPage();
      child.render(page);
    }

    return pdf.save();
  }
}

export class Page {
  private _w: number;
  private _h: number;
  private _elements: Array<Element> = [];

  /**
   * Given in `pt`, you can modify the default size of the page
   * by giving arguments.
   *
   * @example
   * new Page(); // Defaults to A4 (21 x 29.7 cm)
   * @example
   * new Page(595.276, 841.8898); // A4's width and height given in `pt` as two paramaters.
   * @example
   * new Page([595.276, 841.8898]); // A4's width and height in `pt` given as an array.
   */
  constructor(size?: [w: number, h: number]);
  constructor(w: number, h: number);
  constructor(...args: Array<any>) {
    if (Array.isArray(args[0])) {
      [this._w, this._h] = args[0];
    } else if (typeof args[0] === "number" && typeof args[1] === "number") {
      [this._w, this._h] = args;
    } else {
      [this._w, this._h] = PageSizes.A4;
    }
  }

  child(element: Element): Page {
    this._elements.push(element);
    return this;
  }

  render(page: PDFPage): void {
    const root = Yoga.Node.create();

    // Append all nodes to Yoga to calculate layout.
    for (let i = 0; i < this._elements.length; i++) {
      const element = this._elements[i]!;
      const node = element.getLayoutNode();

      root.insertChild(node, i);
    }

    // Calculate the layout of all the elements inside this page.
    root.calculateLayout(page.getWidth(), page.getHeight(), Direction.LTR);

    // Once we have the layout with proper dimensions, we can draw to the PDF.
    for (const element of this._elements) {
      element.draw(page);
    }
  }
}

export class Element {
  protected _node?: Node;

  // NOTE: since this is a default element,
  //       we don't really care about rendering something.
  getLayoutNode(): Node {
    this._node ??= Yoga.Node.create();
    return this._node;
  }

  draw(page: PDFPage): void {}
}

export class Div extends Element {
  private _elements: Array<Element> = [];
  private _w?: number | "auto" | `${number}%`;
  private _h?: number | "auto" | `${number}%`;
  private _shrink?: number;
  private _position?: PositionType;
  private _display?: Display;
  private _overflow?: Overflow;
  private _flexDirection = FlexDirection.Row;
  private _backgroundColor?: RGB;

  child(element: Element): Div {
    this._elements.push(element);
    return this;
  }

  h(h: number): Div {
    this._h = h;
    return this;
  }

  hFull(): Div {
    this._h = "100%";
    return this;
  }

  w(w: number): Div {
    this._w = w;
    return this;
  }

  wFull(): Div {
    this._w = "100%";
    return this;
  }

  flex(): Div {
    this._display = Display.Flex;
    return this;
  }

  relative(): Div {
    this._position = PositionType.Relative;
    return this;
  }

  absolute(): Div {
    this._position = PositionType.Absolute;
    return this;
  }

  shrink0(): Div {
    this._shrink = 0;
    return this;
  }

  shrink1(): Div {
    this._shrink = 1;
    return this;
  }

  overflowHidden(): Div {
    this._overflow = Overflow.Hidden;
    return this;
  }

  flexCol(): Div {
    this._flexDirection = FlexDirection.Column;
    return this;
  }

  flexColReverse(): Div {
    this._flexDirection = FlexDirection.ColumnReverse;
    return this;
  }

  flexRow(): Div {
    this._flexDirection = FlexDirection.Row;
    return this;
  }

  flexRowReverse(): Div {
    this._flexDirection = FlexDirection.RowReverse;
    return this;
  }

  bg(color: number): Div {
    this._backgroundColor = hexToPdf(color);
    return this;
  }

  override getLayoutNode(): Node {
    if (this._node) return this._node;
    const node = Yoga.Node.create();

    node.setHeight(this._h);
    node.setWidth(this._w);

    if (this._position !== void 0) {
      node.setPositionType(this._position);
    }

    if (this._display !== void 0) {
      node.setDisplay(this._display);
    }

    if (this._flexDirection !== void 0) {
      node.setFlexDirection(this._flexDirection);
    }

    node.setFlexShrink(this._shrink);

    if (this._overflow !== void 0) {
      node.setOverflow(this._overflow);
    }

    for (let i = 0; i < this.children.length; i++) {
      const element = this.children[i]!;
      node.insertChild(element.getLayoutNode(), i);
    }

    this._node = node;
    return this._node;
  }

  override draw(page: PDFPage): void {
    const node = this.getLayoutNode();

    page.drawRectangle({
      x: node.getComputedLeft(),
      y: page.getHeight() - node.getComputedTop() - node.getComputedHeight(),
      width: node.getComputedWidth(),
      height: node.getComputedHeight(),
      color: this._backgroundColor,
    });

    for (const element of this._elements) {
      element.draw(page);
    }
  }

  get children(): Array<Element> {
    return this._elements;
  }
}

/**
 *
 * @example
 * hex(0xFFFFFF); // [1, 1, 1];
 */
const hexToPdf = (hex: number): RGB => {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;

  return rgbToPdf(r / 255, g / 255, b / 255);
};

export const pdf = () => new PDF();
export const page = () => new Page();
export const div = () => new Div();
