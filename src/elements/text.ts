import type { PDFFont, PDFPage } from "@cantoo/pdf-lib";
import type { Node } from "yoga-layout";
import type { Element } from "~/elements";
import type { MemoryFont } from "~/utils/fonts";
import { breakTextIntoLines, TextAlignment } from "@cantoo/pdf-lib";
import Yoga from "yoga-layout";
import { absoluteLeft, absoluteTop } from "~/utils/positions";

export class Text implements Element {
  private _font?: MemoryFont;
  private _fontSize = 16;
  private _lineHeight = 1.2;
  private _node?: Node;
  private _textAlign?: TextAlignment;
  private _w?: "auto" | `${number}%` | number;

  constructor(private _value: string) {}

  draw(page: PDFPage, fonts: Map<MemoryFont, PDFFont>): void {
    const node = this.getLayoutNode(page, fonts);
    const font = this.getCurrentFont(page, fonts);

    const textWidth = (t: string): number => font.widthOfTextAtSize(t, this._fontSize);
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
      x = this._textAlign === TextAlignment.Left
        ? x
        : this._textAlign === TextAlignment.Center
          ? x + (boundsWidth / 2) - (width / 2)
          : this._textAlign === TextAlignment.Right
            ? x + boundsWidth - width
            : x;

      page.drawText(line, {
        font,
        size: this._fontSize,
        x,
        y
      });
    }
  }

  font(font: MemoryFont): Text {
    this._font = font;
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
      const textWidth = (t: string): number =>
        font.widthOfTextAtSize(t, this._fontSize);

      node.setMeasureFunc(
        (availWidth, widthMode, _availHeight, _heightMode) => {
          const widthForWrapping
            = widthMode === Yoga.MEASURE_MODE_UNDEFINED ? Infinity : availWidth;

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

          const width
            = widthMode === Yoga.MEASURE_MODE_EXACTLY
              ? availWidth
              : Math.min(maxLineWidth, widthForWrapping);

          return { height, width };
        }
      );
    }

    this._node = node;
    return this._node;
  }

  /**
   * @see https://tailwindcss.com/docs/line-height
   */
  leading(lineHeight: number): Text {
    this._lineHeight = lineHeight;
    return this;
  }

  /**
   * @see https://tailwindcss.com/docs/line-height
   */
  leadingNone(): Text {
    this._lineHeight = 1;
    return this;
  }

  textCenter(): Text {
    this._textAlign = TextAlignment.Center;
    return this;
  }

  textLeft(): Text {
    this._textAlign = TextAlignment.Left;
    return this;
  }

  textRight(): Text {
    this._textAlign = TextAlignment.Right;
    return this;
  }

  private getCurrentFont(page: PDFPage, fonts: Map<MemoryFont, PDFFont>): PDFFont {
    return this._font ? fonts.get(this._font)! : page.getFont()[0];
  }
}
export const text = (value: string): Text => new Text(value);
