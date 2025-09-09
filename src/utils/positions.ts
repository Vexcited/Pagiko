import type { Node } from "yoga-layout";

export const absoluteLeft = (node: Node): number => {
  let left = node.getComputedLeft();
  let parent = node.getParent();
  while (parent) {
    left += parent.getComputedLeft();
    parent = parent.getParent();
  }
  return left;
};

export const absoluteTop = (node: Node): number => {
  let top = node.getComputedTop();
  let parent = node.getParent();
  while (parent) {
    top += parent.getComputedTop();
    parent = parent.getParent();
  }
  return top;
};
