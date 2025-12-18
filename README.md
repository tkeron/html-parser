# HTML Parser - Powered by Bun Native Tokenizer

> ⚠️ **Work in Progress** - This package is currently under active development.

A fast and lightweight HTML parser for Bun that converts HTML strings into DOM Document objects. **Now powered by a native Bun tokenizer** for optimal performance.

## Features

- ⚡ **Bun Native Tokenizer**: Optimized specifically for Bun runtime
- 🚀 **Ultra Fast**: Leverages Bun's native optimizations
- 🪶 **Lightweight**: Minimal dependencies, native implementation
- 🌐 **Standards Compliant**: Returns standard DOM Document objects
- 🔧 **TypeScript Support**: Full TypeScript definitions included
- ✅ **Well Tested**: Comprehensive unit test suite (181/181 passing)
- 🔄 **100% Compatible**: Drop-in replacement, same API

## Installation

> **Note**: This package is not yet published to npm. For now, you can clone and build locally.

Once published, it will be available as:

```bash
npm install @tkeron/html-parser
```

Or with Bun:

```bash
bun add @tkeron/html-parser
```

## Usage

```typescript
import { parseHTML } from "@tkeron/html-parser";

// Parse HTML string into DOM Document
const html =
  "<html><head><title>Test</title></head><body><h1>Hello World</h1></body></html>";
const document = parseHTML(html);

// Use standard DOM methods
const title = document.querySelector("title")?.textContent;
const heading = document.querySelector("h1")?.textContent;

console.log(title); // "Test"
console.log(heading); // "Hello World"
```

### Simple Example

```typescript
import { parseHTML } from "@tkeron/html-parser";

const html = `
  <div class="container">
    <p>Hello, world!</p>
    <span id="info">This is a test</span>
  </div>
`;

const doc = parseHTML(html);
const container = doc.querySelector(".container");
const info = doc.getElementById("info");

console.log(container?.children.length); // 2
console.log(info?.textContent); // "This is a test"
```

## API

### `parseHTML(html: string): Document`

Parses an HTML string and returns a DOM Document object.

**Parameters:**

- `html` (string): The HTML string to parse

**Returns:**

- `Document`: A standard DOM Document object with all the usual methods like `querySelector`, `getElementById`, etc.

## Development

This project is built with Bun. To get started:

```bash
# Install dependencies
bun install

# Run tests
bun test

```

## Testing

Run the test suite:

```bash
bun test
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you encounter any issues or have questions, please file an issue on the [GitHub repository](https://github.com/tkeron/html-parser).
