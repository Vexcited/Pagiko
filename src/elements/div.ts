import type { PDFFont, PDFPage, RGB } from "@cantoo/pdf-lib";
import type { Node } from "yoga-layout";
import type { Element } from "~/elements";
import type { MemoryFont } from "~/utils/fonts";
import Yoga, { Align, Display, FlexDirection, Justify, Overflow, PositionType } from "yoga-layout";
import { hexToPdf } from "~/utils/colors";
import { absoluteLeft, absoluteTop } from "~/utils/positions";

export class Div implements Element {
  get children(): Array<Element> {
    return this._elements;
  }

  private _alignItems?: Align;
  private _backgroundColor?: RGB;
  private _display?: Display;
  private _elements: Array<Element> = [];
  private _flexDirection = FlexDirection.Row;
  private _grow?: number;
  private _h?: "auto" | `${number}%` | number;
  private _justifyContent?: Justify;
  private _node?: Node;
  private _overflow?: Overflow;
  private _position?: PositionType;
  private _shrink: number = 1;

  private _w?: "auto" | `${number}%` | number;

  absolute(): Div {
    this._position = PositionType.Absolute;
    return this;
  }

  bg(color: number): Div {
    this._backgroundColor = hexToPdf(color);
    return this;
  }

  child(element: Element): Div {
    this._elements.push(element);
    return this;
  }

  draw(page: PDFPage, fonts: Map<MemoryFont, PDFFont>): void {
    const node = this.getLayoutNode(page, fonts);

    page.drawRectangle({
      color: this._backgroundColor,
      height: node.getComputedHeight(),
      width: node.getComputedWidth(),
      x: absoluteLeft(node),
      y: page.getHeight() - absoluteTop(node) - node.getComputedHeight()
    });

    for (const element of this._elements) {
      element.draw(page, fonts);
    }
  }

  flex(): Div {
    this._display = Display.Flex;
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

  getLayoutNode(page: PDFPage, fonts: Map<MemoryFont, PDFFont>): Node {
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

  grow1(): Div {
    this._grow = 1;
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

  itemsCenter(): Div {
    this._alignItems = Align.Center;
    return this;
  }

  itemsStart(): Div {
    this._alignItems = Align.FlexStart;
    return this;
  }

  justifyCenter(): Div {
    this._justifyContent = Justify.Center;
    return this;
  }

  justifyStart(): Div {
    this._justifyContent = Justify.FlexStart;
    return this;
  }

  overflowHidden(): Div {
    this._overflow = Overflow.Hidden;
    return this;
  }

  relative(): Div {
    this._position = PositionType.Relative;
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

  w(w: number): Div {
    this._w = w;
    return this;
  }

  wFull(): Div {
    this._w = "100%";
    return this;
  }
}
export const div = (): Div => new Div();
