import { describe, expect, mock, test } from "bun:test";
import { Align, Display, FlexDirection, Justify, Overflow, PositionType } from "yoga-layout";
import { Div, div } from "~/elements/div";

// Mock PDFPage for testing
const mockPDFPage = {
  drawRectangle: mock(() => {}),
  getHeight: mock(() => 800)
};

describe("Div", () => {
  describe("constructor and helper function", () => {
    test("should create Div instance", () => {
      const divElement = new Div();
      expect(divElement).toBeInstanceOf(Div);
    });

    test("should create Div instance with helper function", () => {
      const divElement = div();
      expect(divElement).toBeInstanceOf(Div);
    });
  });

  describe("children management", () => {
    test("should have empty children array initially", () => {
      const divElement = div();
      expect(divElement.children).toEqual([]);
    });

    test("should add child and return instance for chaining", () => {
      const parent = div();
      const child = div();

      const result = parent.child(child);

      expect(result).toBe(parent);
      expect(parent.children).toContain(child);
    });

    test("should add multiple children", () => {
      const parent = div();
      const child1 = div();
      const child2 = div();

      parent.child(child1).child(child2);

      expect(parent.children).toEqual([child1, child2]);
    });
  });

  describe("positioning methods", () => {
    test("should set absolute positioning", () => {
      const divElement = div();
      const result = divElement.absolute();

      expect(result).toBe(divElement);
    });

    test("should set relative positioning", () => {
      const divElement = div();
      const result = divElement.relative();

      expect(result).toBe(divElement);
    });
  });

  describe("background color", () => {
    test("should set background color", () => {
      const divElement = div();
      const result = divElement.bg(0xFF0000); // Red

      expect(result).toBe(divElement);
    });

    test("should chain background color calls", () => {
      const divElement = div()
        .bg(0xFF0000)
        .bg(0x00FF00)
        .bg(0x0000FF);

      expect(divElement).toBeInstanceOf(Div);
    });
  });

  describe("display methods", () => {
    test("should set flex display", () => {
      const divElement = div();
      const result = divElement.flex();

      expect(result).toBe(divElement);
    });
  });

  describe("flex direction methods", () => {
    test("should set flex row direction", () => {
      const divElement = div();
      const result = divElement.flexRow();

      expect(result).toBe(divElement);
    });

    test("should set flex row reverse direction", () => {
      const divElement = div();
      const result = divElement.flexRowReverse();

      expect(result).toBe(divElement);
    });

    test("should set flex column direction", () => {
      const divElement = div();
      const result = divElement.flexCol();

      expect(result).toBe(divElement);
    });

    test("should set flex column reverse direction", () => {
      const divElement = div();
      const result = divElement.flexColReverse();

      expect(result).toBe(divElement);
    });
  });

  describe("alignment methods", () => {
    test("should set items center alignment", () => {
      const divElement = div();
      const result = divElement.itemsCenter();

      expect(result).toBe(divElement);
    });

    test("should set items start alignment", () => {
      const divElement = div();
      const result = divElement.itemsStart();

      expect(result).toBe(divElement);
    });

    test("should set justify center", () => {
      const divElement = div();
      const result = divElement.justifyCenter();

      expect(result).toBe(divElement);
    });

    test("should set justify start", () => {
      const divElement = div();
      const result = divElement.justifyStart();

      expect(result).toBe(divElement);
    });
  });

  describe("size methods", () => {
    test("should set width", () => {
      const divElement = div();
      const result = divElement.w(200);

      expect(result).toBe(divElement);
    });

    test("should set full width", () => {
      const divElement = div();
      const result = divElement.wFull();

      expect(result).toBe(divElement);
    });

    test("should set height", () => {
      const divElement = div();
      const result = divElement.h(150);

      expect(result).toBe(divElement);
    });

    test("should set full height", () => {
      const divElement = div();
      const result = divElement.hFull();

      expect(result).toBe(divElement);
    });
  });

  describe("flex properties", () => {
    test("should set grow to 1", () => {
      const divElement = div();
      const result = divElement.grow1();

      expect(result).toBe(divElement);
    });

    test("should set shrink to 0", () => {
      const divElement = div();
      const result = divElement.shrink0();

      expect(result).toBe(divElement);
    });

    test("should set shrink to 1", () => {
      const divElement = div();
      const result = divElement.shrink1();

      expect(result).toBe(divElement);
    });
  });

  describe("overflow methods", () => {
    test("should set overflow hidden", () => {
      const divElement = div();
      const result = divElement.overflowHidden();

      expect(result).toBe(divElement);
    });
  });

  describe("getLayoutNode", () => {
    test("should create and return layout node", () => {
      const divElement = div();
      const fonts = new Map();

      const node = divElement.getLayoutNode(mockPDFPage as any, fonts);

      expect(node).toBeDefined();
      expect(typeof node.free).toBe("function");

      node.free();
    });

    test("should return same node on subsequent calls", () => {
      const divElement = div();
      const fonts = new Map();

      const node1 = divElement.getLayoutNode(mockPDFPage as any, fonts);
      const node2 = divElement.getLayoutNode(mockPDFPage as any, fonts);

      expect(node1).toBe(node2);

      node1.free();
    });

    test("should handle children layout nodes", () => {
      const parent = div();
      const child = div();
      parent.child(child);

      const fonts = new Map();
      const node = parent.getLayoutNode(mockPDFPage as any, fonts);

      expect(node).toBeDefined();
      expect(node.getChildCount()).toBe(1);

      node.free();
    });
  });

  describe("draw", () => {
    test("should call drawRectangle when background color is set", () => {
      const divElement = div().bg(0xFF0000);
      const fonts = new Map();

      // Create layout node first
      const node = divElement.getLayoutNode(mockPDFPage as any, fonts);

      // Mock the computed dimensions
      node.getComputedWidth = mock(() => 200);
      node.getComputedHeight = mock(() => 100);

      divElement.draw(mockPDFPage as any, fonts);

      expect(mockPDFPage.drawRectangle).toHaveBeenCalled();

      node.free();
    });

    test("should draw children elements", () => {
      const parent = div();
      const child = div().bg(0x00FF00);
      parent.child(child);

      const fonts = new Map();

      // Create layout nodes
      const parentNode = parent.getLayoutNode(mockPDFPage as any, fonts);
      parentNode.getComputedWidth = mock(() => 300);
      parentNode.getComputedHeight = mock(() => 200);

      parent.draw(mockPDFPage as any, fonts);

      // Should be called at least once for the child
      expect(mockPDFPage.drawRectangle).toHaveBeenCalled();

      parentNode.free();
    });
  });

  describe("method chaining", () => {
    test("should support complex method chaining", () => {
      const divElement = div()
        .flex()
        .flexRow()
        .itemsCenter()
        .justifyCenter()
        .w(200)
        .h(100)
        .bg(0x123456)
        .grow1()
        .shrink0()
        .absolute()
        .overflowHidden();

      expect(divElement).toBeInstanceOf(Div);
    });

    test("should chain with children", () => {
      const child1 = div().w(50).h(50).bg(0xFF0000);
      const child2 = div().w(50).h(50).bg(0x00FF00);

      const parent = div()
        .flex()
        .flexRow()
        .child(child1)
        .child(child2)
        .w(200)
        .h(100);

      expect(parent).toBeInstanceOf(Div);
      expect(parent.children).toHaveLength(2);
    });
  });
});
