import { writeFile } from "node:fs/promises";
import { pdf, page, div } from "../src/pdf";

const file = pdf()
  .author("Mikkel")
  .child(
    page().child(
      div()
        .flex()
        .h(100)
        .bg(0xff0000)
        .child(div().w(100).shrink0().bg(0x00ff00))
        .child(div().wFull().bg(0x0000ff))
    )
  );

await writeFile("a4.pdf", await file.renderToBytes());
