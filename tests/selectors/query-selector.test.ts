import { describe, it, expect } from "bun:test";
import { querySelector } from "../../src/selectors";
import { parseHTML } from "../../index";

describe("querySelector", () => {
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
    expect(typeof querySelector).toBe("function");
  });

  it("should find the first element by tag name", () => {
    const firstParagraph = querySelector(doc, "p");
    expect(firstParagraph).not.toBeNull();
    expect(firstParagraph?.attributes.id).toBe("intro");
  });

  it("should find an element by ID", () => {
    const intro = querySelector(doc, "#intro");
    expect(intro).not.toBeNull();
    expect(intro?.tagName).toBe("P");
  });

  it("should return null if no element is found", () => {
    const nonExistent = querySelector(doc, "#nonexistent");
    expect(nonExistent).toBeNull();
  });
});
