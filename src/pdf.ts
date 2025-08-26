import {
  PageSizes,
  PDFDocument,
  PDFFont,
  PDFPage,
  type RGB,
  rgb as rgbToPdf,
  StandardFonts,
  breakTextIntoLines,
} from "@cantoo/pdf-lib";
import Yoga, {
  Align,
  Direction,
  Display,
  FlexDirection,
  Justify,
  Overflow,
  PositionType,
  type Node,
} from "yoga-layout";

export type Font = StandardFonts | string | Uint8Array | ArrayBuffer;
export class MemoryFont {
  public id: string = crypto.randomUUID();
  constructor(public value: Font) {}
}
export { StandardFonts };

const absoluteLeft = (node: Node): number => {
  let left = node.getComputedLeft();
  let parent = node.getParent();
  while (parent) {
    left += parent.getComputedLeft();
    parent = parent.getParent();
  }
  return left;
};

const absoluteTop = (node: Node): number => {
  let top = node.getComputedTop();
  let parent = node.getParent();
  while (parent) {
    top += parent.getComputedTop();
    parent = parent.getParent();
  }
  return top;
};

export class PDF {
  private _author?: string;
  private _javascripts: Map<string, string> = new Map();
  private _children: Array<Page> = [];
  private _fonts: Set<MemoryFont> = new Set();

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
}

export class Page {
  private _w: number;
  private _h: number;
  private _elements: Array<Element> = [];

  constructor() {
    [this._w, this._h] = PageSizes.A4;
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
   * Defines the width of the page in pt.
   * @default 595.276 // A4
   */
  w(width: number): Page {
    this._w = width;
    return this;
  }

  /**
   * Defines the width and height of the page in pt.
   * @default [595.276, 841.8898] // A4
   * @example
   * page().size([595.276, 841.8898]);
   * @example
   * page().size(PageSizes.A4);
   */
  size(size: [w: number, h: number]) {
    [this._w, this._h] = size;
  }

  child(element: Element): Page {
    this._elements.push(element);
    return this;
  }

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
}

export class Element {
  protected _node?: Node;

  // NOTE: since this is a default element,
  //       we don't really care about rendering something.
  getLayoutNode(page: PDFPage, fonts: Map<MemoryFont, PDFFont>): Node {
    this._node ??= Yoga.Node.create();
    return this._node;
  }

  draw(page: PDFPage, fonts: Map<MemoryFont, PDFFont>): void {}
}

export class Div extends Element {
  private _elements: Array<Element> = [];
  private _w?: number | "auto" | `${number}%`;
  private _h?: number | "auto" | `${number}%`;
  private _shrink: number = 1;
  private _grow?: number;
  private _position?: PositionType;
  private _display?: Display;
  private _overflow?: Overflow;
  private _flexDirection = FlexDirection.Row;
  private _backgroundColor?: RGB;
  private _alignItems?: Align;
  private _justifyContent?: Justify;

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

  grow1(): Div {
    this._grow = 1;
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

  itemsStart(): Div {
    this._alignItems = Align.FlexStart;
    return this;
  }
  itemsCenter(): Div {
    this._alignItems = Align.Center;
    return this;
  }
  justifyStart(): Div {
    this._justifyContent = Justify.FlexStart;
    return this;
  }
  justifyCenter(): Div {
    this._justifyContent = Justify.Center;
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

  override getLayoutNode(page: PDFPage, fonts: Map<MemoryFont, PDFFont>): Node {
    if (this._node) return this._node;
    const node = Yoga.Node.create();
    console.log("div: construct layout");

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

    if (this._alignItems !== void 0) {
      node.setAlignItems(this._alignItems);
    }
    if (this._justifyContent !== void 0) {
      node.setJustifyContent(this._justifyContent);
    }

    if (this._grow !== void 0) {
      node.setFlexGrow(this._grow);
    }

    if (this._shrink !== void 0) {
      node.setFlexShrink(this._shrink);
    }

    if (this._overflow !== void 0) {
      node.setOverflow(this._overflow);
    }

    for (let i = 0; i < this.children.length; i++) {
      const element = this.children[i]!;
      node.insertChild(element.getLayoutNode(page, fonts), i);
    }

    this._node = node;
    return this._node;
  }

  override draw(page: PDFPage, fonts: Map<MemoryFont, PDFFont>): void {
    const node = this.getLayoutNode(page, fonts);

    page.drawRectangle({
      x: absoluteLeft(node),
      y: page.getHeight() - absoluteTop(node) - node.getComputedHeight(),
      width: node.getComputedWidth(),
      height: node.getComputedHeight(),
      color: this._backgroundColor,
    });

    for (const element of this._elements) {
      element.draw(page, fonts);
    }
  }

  get children(): Array<Element> {
    return this._elements;
  }
}

export class Text extends Element {
  private _w?: number | "auto" | `${number}%`;
  private _font?: MemoryFont;
  private _fontSize = 16;
  private _lineHeight = 1.2;
  private _textAlign?: TextAlignment;

  constructor(private _value: string) {
    super();
  }

  font(font: MemoryFont): Text {
    this._font = font;
    return this;
  }

  /**
   * @see https://tailwindcss.com/docs/line-height
   */
  leadingNone(): Text {
    this._lineHeight = 1;
    return this;
  }

  /**
   * @see https://tailwindcss.com/docs/line-height
   */
  leading(lineHeight: number): Text {
    this._lineHeight = lineHeight;
    return this;
  }

  textLeft(): Text {
    this._textAlign = TextAlignment.Left;
    return this;
  }

  textCenter(): Text {
    this._textAlign = TextAlignment.Center;
    return this;
  }

  textRight(): Text {
    this._textAlign = TextAlignment.Right;
    return this;
  }

  getLayoutNode(page: PDFPage, fonts: Map<MemoryFont, PDFFont>): Node {
    if (this._node) return this._node;
    const node = Yoga.Node.create();
    console.log("text: construct layout");

    const font = this.getCurrentFont(page, fonts);

    // When we're forcing a width to our text, we'll fix it absolutely.
    if (this._w !== void 0) {
      node.setWidth(this._w);
    }
    // Otherwise, when we're NOT forcing a width, we'll use the full width.
    else {
      const textWidth = (t: string) =>
        font.widthOfTextAtSize(t, this._fontSize);

      node.setMeasureFunc(
        (availWidth, widthMode, _availHeight, _heightMode) => {
          const widthForWrapping =
            widthMode === Yoga.MEASURE_MODE_UNDEFINED ? Infinity : availWidth;

          const lines = breakTextIntoLines(
            this._value,
            page.doc.defaultWordBreaks,
            widthForWrapping,
            textWidth
          );

          const lineHeight = this._fontSize * this._lineHeight;
          const fontHeight = font.heightAtSize(this._fontSize);
          const height = (lines.length - 1) * lineHeight + fontHeight;

          const maxLineWidth = lines.reduce(
            (m, l) => Math.max(m, textWidth(l)),
            0
          );

          const width =
            widthMode === Yoga.MEASURE_MODE_EXACTLY
              ? availWidth
              : Math.min(maxLineWidth, widthForWrapping);

          return { width, height };
        }
      );
    }

    this._node = node;
    return this._node;
  }

  override draw(page: PDFPage, fonts: Map<MemoryFont, PDFFont>): void {
    const node = this.getLayoutNode(page, fonts);
    const font = this.getCurrentFont(page, fonts);

    const textWidth = (t: string) => font.widthOfTextAtSize(t, this._fontSize);
    const widthForWrapping = node.getComputedWidth();

    const lines = breakTextIntoLines(
      this._value,
      page.doc.defaultWordBreaks,
      widthForWrapping,
      textWidth
    );

    const lineHeight = this._fontSize * this._lineHeight;
    const fontHeight = font.heightAtSize(this._fontSize);

    // Estimate the baseline position - typically around 70-80% of font height from the bottom
    // This approximation works well for most fonts
    const baselineOffset = fontHeight * 0.75;

    // Calculate total text height using the same logic as in measure function
    const totalTextHeight = (lines.length - 1) * lineHeight + fontHeight;

    // Calculate node position
    const nodeTop = page.getHeight() - absoluteTop(node);
    const nodeHeight = node.getComputedHeight();
    const boundsWidth = node.getComputedWidth();

    // Find vertical center of the node
    const nodeCenterY = nodeTop - nodeHeight / 2;

    // Position the text block with its center aligned to the node's center
    const textBlockCenterY = nodeCenterY;

    // Calculate the position of the first line's baseline
    const firstLineY = textBlockCenterY + totalTextHeight / 2 - baselineOffset;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const y = firstLineY - i * lineHeight;

      let x = absoluteLeft(node);
      const width = textWidth(line);

      // prettier-ignore
      x =  this._textAlign === TextAlignment.Left   ? x
        : this._textAlign === TextAlignment.Center ? x + (boundsWidth / 2) - (width / 2)
        : this._textAlign === TextAlignment.Right  ? x + boundsWidth - width
        : x;

      page.drawText(line, {
        x,
        y,
        font,
        size: this._fontSize,
      });
    }
  }

  private getCurrentFont(page: PDFPage, fonts: Map<MemoryFont, PDFFont>) {
    return this._font ? fonts.get(this._font)! : page.getFont()[0];
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
export const text = (value: string) => new Text(value);
export const font = (font: Font) => new MemoryFont(font);
