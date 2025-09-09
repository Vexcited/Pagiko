# Pagiko

## Installation

```sh
bun add pagiko
```

## Quick Start

You can quickly get started by creating an empty PDF.

```typescript
import { pdf, page } from "pagiko";
const file = pdf().child(page());
```

Here, we created a PDF document with a single page.
Once you've done with your layout, you can render the file into bytes.

```typescript
const bytes = await file.renderToBytes();
//    ^ UInt8Array
```

With those bytes, you can write the file to your filesystem for example.

```typescript
import { writeFile } from "node:fs/promises";
await writeFile("document.pdf", bytes);
```

But since this library also works in browsers, you can use whatever method
you like to display or download the PDF depending on your needs.

## API

### `pdf()` - create a new document

#### `.author()` - set the author of the document

Set document's author metadata.
The author will appear in the document properties section of most PDF readers.

```typescript
pdf().author("Vexcited");
```

#### `.font()` - load a font to later use

This will add the font to the document, needed when you want to use a
custom font later on. The default font is Helvetica.

```typescript
import { pdf, font, StandardFonts } from "pagiko";
const times = font(StandardFonts.TimesRoman);

const buffer = new Uint8Array(/* ...a font file... */);
const custom = font(buffer);

// Load both fonts to be later used.
pdf().font(times).font(custom);
```

#### `.child()` - add a new page to document

Just like a tree, if you want to add pages to your document,
you must use `child` for each page.

```typescript
import { page } from "pagiko";

pdf()
  .child(page()) // Page 1
  .child(page()); // Page 2
```

### `page()` - create a new page

#### `.h()` - set the height

Define a new height for the page, provided in `pt`. \
Defaults to `841.89` which is the height in `pt` for an A4.

```typescript
page().h(100.5);
```

#### `.w()` - set the width

Define a new width for the page, provided in `pt`. \
Defaults to `595.28` which is the width in `pt` for an A4.

```typescript
page().w(200.25);
```

#### `.size()` - set the width and height at the same time

Define a new width and height for the page, provided in `pt`. \
Defaults to `[595.276, 841.8898]` which the width and height in `pt` for an A4.

```typescript
import { PageSizes } from "pagiko";

page().size([200.25, 100.5]);
page().size(PageSizes.A7);
```

#### `.child()` - add elements to the page

Add elements to the root of the page, you can chain this function
to add multiple elements to the root.

```typescript
import { div, text } from "pagiko";

page
  .child(div()) // Add an empty div to the page
  .child(text("")); // Add an empty text to the page
```

## Contributing

### Quick Start

```sh
git clone https://github.com/Vexcited/Pagiko && cd Pagiko

bun install
bun run ./examples/... # run any example!
```

### Release

I am using [Mentor](https://github.com/Vexcited/Mentor) to automatically
create releases for this package.

```sh
mentor
```

We're using semver for versioning.
