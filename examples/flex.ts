import { writeFile } from "node:fs/promises";
import { pdf, page, div, text, StandardFonts, font } from "../src/pdf";

const times = font(StandardFonts.TimesRoman);

const file = pdf()
  .author("Mikkel")
  .font(times)
  .child(
    page()
      .child(
        div()
          .flex()
          .h(100)
          .child(
            div()
              .flex()
              .w(50)
              .child(div().bg(0x00000).w(20))
              .child(div().bg(0x000ff).grow1())
          )
          .child(
            div()
              .flex()
              .w(50)
              .child(div().bg(0x00000).w(20))
              .child(div().bg(0x0ff00).grow1())
          )
          .child(
            div()
              .flex()
              .w(50)
              .child(div().bg(0x00000).w(20))
              .child(div().bg(0xff0ff).grow1())
          )
      )
      .child(
        div()
          .flex()
          .h(100)
          .child(div().w(100).shrink0().bg(0x00ff00))
          .child(
            div()
              .flex()
              .flexCol()
              .justifyCenter()
              .grow1()
              .bg(0xff00ff)
              .child(
                text(
                  "hey!hello, world! hello, world! hello, world! hello, world! hello, world! hello, world! hello, world! hello, world!hello, world!hello, world!hello, world!hello, world!hello, world!hello, world!hello, world!hello, world!hello, world!hello, world!"
                )
                  .font(times)
                  .textRight()
              )
            // .child(text("hello world :)"))
          )
        // .child(div().wFull().bg(0x0000ff))
      )
  );

await writeFile("a4.pdf", await file.renderToBytes());
