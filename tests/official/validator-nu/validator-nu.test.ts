import { describe, it, expect } from 'bun:test';
import { parseHTML } from '../../../index';

describe('Validator.nu HTML5 Compliance Tests', () => {
  describe('HTML5 Document Structure', () => {
    it('should handle valid HTML5 document', () => {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Valid HTML5 Document</title>
</head>
<body>
  <h1>Welcome</h1>
  <p>This is a valid HTML5 document.</p>
</body>
</html>`;
      
      const document = parseHTML(html);
      
      expect(document).toBeDefined();
      expect(document.documentElement?.getAttribute('lang')).toBe('en');
      
      const meta = document.querySelector('meta[charset]');
      expect(meta?.getAttribute('charset')).toBe('UTF-8');
      
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport?.getAttribute('content')).toBe('width=device-width, initial-scale=1.0');
    });

    it('should handle missing DOCTYPE gracefully', () => {
      const html = `<html>
<head><title>No DOCTYPE</title></head>
<body><p>Content</p></body>
</html>`;
      
      const document = parseHTML(html);
      
      expect(document).toBeDefined();
      expect(document.querySelector('title')?.textContent).toBe('No DOCTYPE');
    });

    it('should handle HTML5 sectioning elements', () => {
      const html = `<!DOCTYPE html>
<html>
<body>
  <header>
    <h1>Site Title</h1>
    <nav>
      <ul>
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <article>
      <h2>Article Title</h2>
      <section>
        <h3>Section Title</h3>
        <p>Section content</p>
      </section>
    </article>
    <aside>
      <h3>Sidebar</h3>
      <p>Sidebar content</p>
    </aside>
  </main>
  <footer>
    <p>&copy; 2025 Site Name</p>
  </footer>
</body>
</html>`;
      
      const document = parseHTML(html);
      
      expect(document.querySelector('header')).toBeDefined();
      expect(document.querySelector('nav')).toBeDefined();
      expect(document.querySelector('main')).toBeDefined();
      expect(document.querySelector('article')).toBeDefined();
      expect(document.querySelector('section')).toBeDefined();
      expect(document.querySelector('aside')).toBeDefined();
      expect(document.querySelector('footer')).toBeDefined();
    });
  });

  describe('HTML5 Form Validation', () => {
    it('should handle required form fields', () => {
      const html = `<form>
  <label for="email">Email (required):</label>
  <input type="email" id="email" name="email" required>
  
  <label for="phone">Phone (optional):</label>
  <input type="tel" id="phone" name="phone">
  
  <button type="submit">Submit</button>
</form>`;
      
      const document = parseHTML(html);
      
      const emailInput = document.querySelector('input[type="email"]');
      expect(emailInput?.hasAttribute('required')).toBe(true);
      
      const phoneInput = document.querySelector('input[type="tel"]');
      expect(phoneInput?.hasAttribute('required')).toBe(false);
    });

    it('should handle HTML5 input types', () => {
      const html = `<form>
  <input type="email" placeholder="Email">
  <input type="url" placeholder="Website">
  <input type="tel" placeholder="Phone">
  <input type="date" placeholder="Date">
  <input type="time" placeholder="Time">
  <input type="number" min="0" max="100" step="1">
  <input type="range" min="0" max="100" value="50">
  <input type="color" value="#ff0000">
  <input type="search" placeholder="Search">
</form>`;
      
      const document = parseHTML(html);
      
      expect(document.querySelector('input[type="email"]')).toBeDefined();
      expect(document.querySelector('input[type="url"]')).toBeDefined();
      expect(document.querySelector('input[type="tel"]')).toBeDefined();
      expect(document.querySelector('input[type="date"]')).toBeDefined();
      expect(document.querySelector('input[type="time"]')).toBeDefined();
      expect(document.querySelector('input[type="number"]')).toBeDefined();
      expect(document.querySelector('input[type="range"]')).toBeDefined();
      expect(document.querySelector('input[type="color"]')).toBeDefined();
      expect(document.querySelector('input[type="search"]')).toBeDefined();
    });

    it('should handle form validation attributes', () => {
      const html = `<form>
  <input type="text" pattern="[A-Za-z]{3,}" title="At least 3 letters">
  <input type="email" required>
  <input type="number" min="1" max="10">
  <input type="text" maxlength="50">
  <input type="password" minlength="8">
  <textarea rows="4" cols="50" placeholder="Comments"></textarea>
</form>`;
      
      const document = parseHTML(html);
      
      const patternInput = document.querySelector('input[pattern]');
      expect(patternInput?.getAttribute('pattern')).toBe('[A-Za-z]{3,}');
      
      const numberInput = document.querySelector('input[type="number"]');
      expect(numberInput?.getAttribute('min')).toBe('1');
      expect(numberInput?.getAttribute('max')).toBe('10');
      
      const maxlengthInput = document.querySelector('input[maxlength]');
      expect(maxlengthInput?.getAttribute('maxlength')).toBe('50');
      
      const minlengthInput = document.querySelector('input[minlength]');
      expect(minlengthInput?.getAttribute('minlength')).toBe('8');
    });
  });

  describe('HTML5 Media Elements', () => {
    it('should handle audio elements', () => {
      const html = `<audio controls>
  <source src="audio.mp3" type="audio/mpeg">
  <source src="audio.ogg" type="audio/ogg">
  Your browser does not support the audio element.
</audio>`;
      
      const document = parseHTML(html);
      
      const audio = document.querySelector('audio');
      expect(audio?.hasAttribute('controls')).toBe(true);
      
      const sources = document.querySelectorAll('source');
      expect(sources.length).toBe(2);
      expect(sources[0]?.getAttribute('type')).toBe('audio/mpeg');
      expect(sources[1]?.getAttribute('type')).toBe('audio/ogg');
    });

    it('should handle video elements', () => {
      const html = `<video width="320" height="240" controls>
  <source src="movie.mp4" type="video/mp4">
  <source src="movie.ogg" type="video/ogg">
  <track kind="captions" src="captions.vtt" srclang="en" label="English">
  Your browser does not support the video tag.
</video>`;
      
      const document = parseHTML(html);
      
      const video = document.querySelector('video');
      expect(video?.getAttribute('width')).toBe('320');
      expect(video?.getAttribute('height')).toBe('240');
      expect(video?.hasAttribute('controls')).toBe(true);
      
      const track = document.querySelector('track');
      expect(track?.getAttribute('kind')).toBe('captions');
      expect(track?.getAttribute('srclang')).toBe('en');
    });

    it('should handle picture elements', () => {
      const html = `<picture>
  <source media="(min-width: 650px)" srcset="img_pink_flowers.jpg">
  <source media="(min-width: 465px)" srcset="img_white_flower.jpg">
  <img src="img_orange_flowers.jpg" alt="Flowers" style="width:auto;">
</picture>`;
      
      const document = parseHTML(html);
      
      const picture = document.querySelector('picture');
      expect(picture).toBeDefined();
      
      const sources = picture?.querySelectorAll('source');
      expect(sources?.length).toBe(2);
      
      const img = picture?.querySelector('img');
      expect(img?.getAttribute('alt')).toBe('Flowers');
    });
  });

  describe('HTML5 Interactive Elements', () => {
    it('should handle details and summary elements', () => {
      const html = `<details>
  <summary>Click to expand</summary>
  <p>Hidden content that can be toggled.</p>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
</details>`;
      
      const document = parseHTML(html);
      
      const details = document.querySelector('details');
      expect(details).toBeDefined();
      
      const summary = document.querySelector('summary');
      expect(summary?.textContent).toBe('Click to expand');
      
      const p = details?.querySelector('p');
      expect(p?.textContent).toBe('Hidden content that can be toggled.');
    });

    it('should handle dialog elements', () => {
      const html = `<dialog id="myDialog">
  <form method="dialog">
    <p>Are you sure you want to delete this item?</p>
    <button value="cancel">Cancel</button>
    <button value="confirm">Confirm</button>
  </form>
</dialog>`;
      
      const document = parseHTML(html);
      
      const dialog = document.querySelector('dialog');
      expect(dialog?.getAttribute('id')).toBe('myDialog');
      
      const form = dialog?.querySelector('form');
      expect(form?.getAttribute('method')).toBe('dialog');
      
      const buttons = dialog?.querySelectorAll('button');
      expect(buttons?.length).toBe(2);
    });

    it('should handle progress and meter elements', () => {
      const html = `<div>
  <label for="progress">Download progress:</label>
  <progress id="progress" value="32" max="100">32%</progress>
  
  <label for="meter">Disk usage:</label>
  <meter id="meter" value="6" min="0" max="10">6 out of 10</meter>
</div>`;
      
      const document = parseHTML(html);
      
      const progress = document.querySelector('progress');
      expect(progress?.getAttribute('value')).toBe('32');
      expect(progress?.getAttribute('max')).toBe('100');
      
      const meter = document.querySelector('meter');
      expect(meter?.getAttribute('value')).toBe('6');
      expect(meter?.getAttribute('min')).toBe('0');
      expect(meter?.getAttribute('max')).toBe('10');
    });
  });

  describe('HTML5 Accessibility', () => {
    it('should handle ARIA attributes', () => {
      const html = `<div role="button" aria-label="Close dialog" aria-pressed="false" tabindex="0">
  <span aria-hidden="true">×</span>
</div>`;
      
      const document = parseHTML(html);
      
      const button = document.querySelector('div[role="button"]');
      expect(button?.getAttribute('aria-label')).toBe('Close dialog');
      expect(button?.getAttribute('aria-pressed')).toBe('false');
      expect(button?.getAttribute('tabindex')).toBe('0');
      
      const span = button?.querySelector('span');
      expect(span?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should handle landmark roles', () => {
      const html = `<div role="banner">
  <h1>Site Title</h1>
</div>
<div role="navigation">
  <ul>
    <li><a href="#home">Home</a></li>
    <li><a href="#about">About</a></li>
  </ul>
</div>
<div role="main">
  <h2>Main Content</h2>
  <p>Content goes here.</p>
</div>
<div role="complementary">
  <h3>Sidebar</h3>
  <p>Additional information.</p>
</div>
<div role="contentinfo">
  <p>&copy; 2025 Site Name</p>
</div>`;
      
      const document = parseHTML(html);
      
      expect(document.querySelector('[role="banner"]')).toBeDefined();
      expect(document.querySelector('[role="navigation"]')).toBeDefined();
      expect(document.querySelector('[role="main"]')).toBeDefined();
      expect(document.querySelector('[role="complementary"]')).toBeDefined();
      expect(document.querySelector('[role="contentinfo"]')).toBeDefined();
    });
  });
});
