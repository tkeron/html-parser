import { describe, it, expect } from "bun:test";
import { querySelectorAll } from "../../src/selectors";
import { parseHTML } from "../../index";

describe("querySelectorAll", () => {
  const htmlContent = `
        <html>
            <body>
                <p id="intro" class="first">
                    <span class="highlight">Hello</span>
                </p>
                <p class="second">World</p>
                <div>
                    <p class="note">Note</p>
                </div>
            </body>
        </html>
    `;

  const doc = parseHTML(htmlContent);

  it("should be a function", () => {
    expect(typeof querySelectorAll).toBe("function");
  });

  it("should find all elements by tag name", () => {
    const paragraphs = querySelectorAll(doc, "p");
    expect(paragraphs.length).toBe(3);
    expect(paragraphs[0]!.attributes.class).toBe("first");
    expect(paragraphs[1]!.attributes.class).toBe("second");
    expect(paragraphs[2]!.attributes.class).toBe("note");
  });

  it("should find all elements by class name", () => {
    const second = querySelectorAll(doc, ".second");
    expect(second.length).toBe(1);
    expect(second[0]!.tagName).toBe("P");
  });
});
