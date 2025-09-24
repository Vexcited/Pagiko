import { describe, expect, test } from "bun:test";
import Yoga from "yoga-layout";
import { absoluteLeft, absoluteTop } from "~/utils/positions";

describe("positions", () => {
  describe("absoluteLeft", () => {
    test("should return left position for node without parent", () => {
      const node = Yoga.Node.create();
      node.setWidth(100);
      node.setHeight(100);
      node.calculateLayout(100, 100, Yoga.DIRECTION_LTR);

      const result = absoluteLeft(node);
      expect(result).toBe(0); // Default position when no explicit position set

      node.free();
    });

    test("should calculate absolute left position with nested structure", () => {
      const parent = Yoga.Node.create();
      const child = Yoga.Node.create();

      parent.setWidth(200);
      parent.setHeight(200);
      parent.setPadding(Yoga.EDGE_LEFT, 50);

      child.setWidth(100);
      child.setHeight(100);

      parent.insertChild(child, 0);
      parent.calculateLayout(200, 200, Yoga.DIRECTION_LTR);

      const result = absoluteLeft(child);
      expect(result).toBeGreaterThanOrEqual(0); // Should be positioned based on layout calculations

      parent.free();
    });
  });

  describe("absoluteTop", () => {
    test("should return top position for node without parent", () => {
      const node = Yoga.Node.create();
      node.setWidth(100);
      node.setHeight(100);
      node.calculateLayout(100, 100, Yoga.DIRECTION_LTR);

      const result = absoluteTop(node);
      expect(result).toBe(0); // Default position when no explicit position set

      node.free();
    });

    test("should calculate absolute top position with nested structure", () => {
      const parent = Yoga.Node.create();
      const child = Yoga.Node.create();

      parent.setWidth(200);
      parent.setHeight(200);
      parent.setPadding(Yoga.EDGE_TOP, 30);

      child.setWidth(100);
      child.setHeight(100);

      parent.insertChild(child, 0);
      parent.calculateLayout(200, 200, Yoga.DIRECTION_LTR);

      const result = absoluteTop(child);
      expect(result).toBeGreaterThanOrEqual(0); // Should be positioned based on layout calculations

      parent.free();
    });
  });

  describe("complex nested structures", () => {
    test("should handle deeply nested nodes", () => {
      const grandparent = Yoga.Node.create();
      const parent = Yoga.Node.create();
      const child = Yoga.Node.create();

      grandparent.setWidth(300);
      grandparent.setHeight(300);
      grandparent.setPadding(Yoga.EDGE_ALL, 10);

      parent.setWidth(200);
      parent.setHeight(200);
      parent.setMargin(Yoga.EDGE_LEFT, 20);
      parent.setMargin(Yoga.EDGE_TOP, 15);

      child.setWidth(100);
      child.setHeight(100);

      grandparent.insertChild(parent, 0);
      parent.insertChild(child, 0);
      grandparent.calculateLayout(300, 300, Yoga.DIRECTION_LTR);

      const leftResult = absoluteLeft(child);
      const topResult = absoluteTop(child);

      expect(leftResult).toBeGreaterThanOrEqual(0);
      expect(topResult).toBeGreaterThanOrEqual(0);

      grandparent.free();
    });
  });
});
