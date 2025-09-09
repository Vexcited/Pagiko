import type { PDFFont, PDFPage } from "@cantoo/pdf-lib";
import type { Node } from "yoga-layout";
import type { MemoryFont } from "~/utils/fonts";

export interface Element {
  draw: (page: PDFPage, fonts: Map<MemoryFont, PDFFont>) => void;
  getLayoutNode: (page: PDFPage, fonts: Map<MemoryFont, PDFFont>) => Node;
}
