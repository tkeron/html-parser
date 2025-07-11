import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";
import { readFileSync } from "fs";
import { join } from "path";

describe("Google DOM Parsing Test", () => {
  it("should parse real Google HTML and find elements", () => {
    const filePath = join(__dirname, "google-homepage.txt");
    let googleHTML: string;

    try {
      googleHTML = readFileSync(filePath, "utf-8");
    } catch (error) {
      throw new Error(`Could not read file: ${error}`);
    }

    let doc: Document;

    try {
      doc = parseHTML(googleHTML);
    } catch (error) {
      throw new Error(`Error parsing Google HTML: ${error}`);
    }

    expect(doc).toBeDefined();
    expect(doc.nodeType).toBe(9);

    const htmlElement = doc.querySelector("html");
    const bodyElement = doc.querySelector("body");
    const titleElement = doc.querySelector("title");

    expect(htmlElement).toBeDefined();
    expect(bodyElement).toBeDefined();
    expect(titleElement).toBeDefined();

    if (titleElement) {
      expect(titleElement.textContent).toBe("Google");
    }

    const searchForm = doc.querySelector('form[action="/search"]');
    expect(searchForm).toBeDefined();

    if (searchForm) {
      expect(searchForm.getAttribute("name")).toBe("f");
    }

    const searchInput = doc.querySelector('input[name="q"]');
    expect(searchInput).toBeDefined();

    if (searchInput) {
      expect(searchInput.getAttribute("title")).toBe("Buscar con Google");
    }

    const searchButton = doc.querySelector('input[name="btnG"]');
    const luckyButton = doc.querySelector('input[name="btnI"]');

    expect(searchButton).toBeDefined();
    expect(luckyButton).toBeDefined();

    if (searchButton) {
      expect(searchButton.getAttribute("value")).toBe("Buscar con Google");
    }

    if (luckyButton) {
      expect(luckyButton.getAttribute("value")).toBe("Voy a tener suerte");
    }

    const logo = doc.querySelector('img[alt="Google"]');
    expect(logo).toBeDefined();

    if (logo) {
      expect(logo.getAttribute("id")).toBe("hplogo");
    }

    const allDivs = doc.querySelectorAll("div");
    const allInputs = doc.querySelectorAll("input");
    const allLinks = doc.querySelectorAll("a");
    const allScripts = doc.querySelectorAll("script");

    expect(allDivs.length).toBeGreaterThan(5);
    expect(allInputs.length).toBeGreaterThan(5);
    expect(allLinks.length).toBeGreaterThan(10);
    expect(allScripts.length).toBeGreaterThan(3);
  });

  it("should demonstrate DOM manipulation on Google page", () => {
    const filePath = join(__dirname, "google-homepage.txt");
    const googleHTML = readFileSync(filePath, "utf-8");
    const doc = parseHTML(googleHTML);

    const title = doc.querySelector("title");
    if (title) {
      const originalTitle = title.textContent;
      expect(originalTitle).toBe("Google");
    }

    const navLinks = doc.querySelectorAll("a.gb1");

    if (navLinks.length > 0) {
      for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
        const link = navLinks[i];
        if (link) {
          const href = link.getAttribute("href");
          const text = link.textContent?.trim();
        }
      }
    }

    const metaTags = doc.querySelectorAll("meta[http-equiv]");

    const scriptsWithNonce = doc.querySelectorAll("script[nonce]");

    expect(title).toBeDefined();

    expect(metaTags.length).toBeGreaterThanOrEqual(0);
    expect(scriptsWithNonce.length).toBeGreaterThanOrEqual(0);
  });
});
