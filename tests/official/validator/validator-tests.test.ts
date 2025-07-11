import { describe, it, expect } from 'bun:test';
import { parseHTML } from '../../../index';

describe('Validator.nu Tests', () => {
  describe('HTML5 Validation Standards', () => {
    it('should validate proper document structure', () => {
      const validHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Valid HTML5 Document</title>
</head>
<body>
  <main>
    <h1>Main Heading</h1>
    <p>Paragraph content.</p>
  </main>
</body>
</html>`;
      
      const document = parseHTML(validHTML);
      
      expect(document).toBeDefined();
      expect(document.documentElement?.tagName).toBe('HTML');
      expect(document.querySelector('title')?.textContent).toBe('Valid HTML5 Document');
    });

    it('should handle required attributes', () => {
      const requiredAttrsHTML = `
        <img src="image.jpg" alt="Description">
        <input type="text" id="name" name="name">
        <label for="name">Name:</label>
        <area shape="rect" coords="0,0,100,100" href="#" alt="Link">
      `;
      
      const document = parseHTML(requiredAttrsHTML);
      
      expect(document).toBeDefined();
      expect(document.querySelector('img')?.getAttribute('alt')).toBe('Description');
      expect(document.querySelector('label')?.getAttribute('for')).toBe('name');
    });

    it('should handle content model violations', () => {
      // These should parse but may generate warnings in a full validator
      const contentModelHTML = `
        <p>
          <div>Block inside paragraph</div>
        </p>
        <a href="#">
          <a href="#">Nested anchor</a>
        </a>
      `;
      
      const document = parseHTML(contentModelHTML);
      // const ast = parse(tokens);
      
      expect(document).toBeDefined();
    });

    it('should handle obsolete elements', () => {
      const obsoleteHTML = `
        <center>Centered text</center>
        <font color="red">Red text</font>
        <marquee>Scrolling text</marquee>
        <blink>Blinking text</blink>
      `;
      
      const document = parseHTML(obsoleteHTML);
      // const ast = parse(tokens);
      
      expect(document).toBeDefined();
    });

    it('should handle deprecated attributes', () => {
      const deprecatedHTML = `
        <table border="1" cellpadding="5" cellspacing="0">
          <tr>
            <td bgcolor="yellow" align="center">Cell</td>
          </tr>
        </table>
        <body bgcolor="white" text="black">
          <p align="justify">Text</p>
        </body>
      `;
      
      const document = parseHTML(deprecatedHTML);
      // const ast = parse(tokens);
      
      expect(document).toBeDefined();
    });
  });

  describe('HTML5 Conformance Checking', () => {
    it('should handle valid HTML5 forms', () => {
      const formHTML = `
        <form action="/submit" method="post">
          <fieldset>
            <legend>Personal Information</legend>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
            
            <label for="phone">Phone:</label>
            <input type="tel" id="phone" name="phone">
            
            <label for="date">Date:</label>
            <input type="date" id="date" name="date">
            
            <label for="range">Range:</label>
            <input type="range" id="range" name="range" min="0" max="100">
          </fieldset>
          <button type="submit">Submit</button>
        </form>
      `;
      
      const document = parseHTML(formHTML);
      // const ast = parse(tokens);
      
      expect(document).toBeDefined();
    });

    it('should handle valid HTML5 media elements', () => {
      const mediaHTML = `
        <video controls width="640" height="480">
          <source src="video.mp4" type="video/mp4">
          <source src="video.webm" type="video/webm">
          <track kind="subtitles" src="subs.vtt" srclang="en" label="English">
          <p>Your browser doesn't support HTML5 video.</p>
        </video>
        
        <audio controls>
          <source src="audio.mp3" type="audio/mpeg">
          <source src="audio.ogg" type="audio/ogg">
          <p>Your browser doesn't support HTML5 audio.</p>
        </audio>
      `;
      
      const document = parseHTML(mediaHTML);
      // const ast = parse(tokens);
      
      expect(document).toBeDefined();
    });

    it('should handle valid HTML5 semantic structure', () => {
      const semanticHTML = `
        <article>
          <header>
            <h1>Article Title</h1>
            <p>Published on <time datetime="2023-01-01">January 1, 2023</time></p>
          </header>
          <section>
            <h2>Section Title</h2>
            <p>Section content with <mark>highlighted text</mark>.</p>
          </section>
          <aside>
            <p>Related information</p>
          </aside>
          <footer>
            <p>Article footer</p>
          </footer>
        </article>
      `;
      
      const document = parseHTML(semanticHTML);
      // const ast = parse(tokens);
      
      expect(document).toBeDefined();
    });

    it('should handle valid HTML5 interactive elements', () => {
      const interactiveHTML = `
        <details>
          <summary>Click to expand</summary>
          <p>Hidden content that can be revealed.</p>
        </details>
        
        <dialog id="modal">
          <p>This is a modal dialog.</p>
          <button onclick="document.getElementById('modal').close()">Close</button>
        </dialog>
        
        <progress value="70" max="100">70%</progress>
        <meter value="0.8" min="0" max="1">80%</meter>
      `;
      
      const document = parseHTML(interactiveHTML);
      // const ast = parse(tokens);
      
      expect(document).toBeDefined();
    });
  });

  describe('HTML5 Error Recovery', () => {
    it('should handle missing closing tags', () => {
      const unclosedHTML = `
        <div>
          <p>Paragraph without closing tag
          <span>Span without closing tag
        </div>
      `;
      
      const document = parseHTML(unclosedHTML);
      // const ast = parse(tokens);
      
      expect(document).toBeDefined();
    });

    it('should handle mismatched tags', () => {
      const mismatchedHTML = `
        <div>
          <p>Paragraph
          <span>Span</p>
        </span>
        </div>
      `;
      
      const document = parseHTML(mismatchedHTML);
      // const ast = parse(tokens);
      
      expect(document).toBeDefined();
    });

    it('should handle invalid nesting', () => {
      const invalidNestingHTML = `
        <p>
          <div>Block in paragraph</div>
          <p>Paragraph in paragraph</p>
        </p>
      `;
      
      const document = parseHTML(invalidNestingHTML);
      // const ast = parse(tokens);
      
      expect(document).toBeDefined();
    });
  });
});
