import { describe, it, expect } from "vitest";
import { parseHTML } from "../index.js";


describe("cloneNode - Bug Reproduction Tests", () => {
  
  it("REPRODUCCIÓN: debe copiar _internalInnerHTML correctamente", () => {
    const html = `
      <div id="container">
        <h1>Título Principal</h1>
        <p>Este es un párrafo con <strong>texto en negrita</strong>.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </div>
    `;
    
    const doc = parseHTML(html);
    const container = doc.querySelector("#container")!;
    
    
    console.log("=== ANTES DEL CLONADO ===");
    console.log("Original innerHTML:", container.innerHTML);
    console.log("Original _internalInnerHTML:", (container as any)._internalInnerHTML);
    console.log("Original childNodes.length:", container.childNodes.length);
    console.log("Original children.length:", container.children.length);
    
    
    const cloned = container.cloneNode(true);
    
    
    console.log("\n=== DESPUÉS DEL CLONADO ===");
    console.log("Clonado innerHTML:", cloned.innerHTML);
    console.log("Clonado _internalInnerHTML:", (cloned as any)._internalInnerHTML);
    console.log("Clonado childNodes.length:", cloned.childNodes.length);
    console.log("Clonado children.length:", cloned.children.length);
    
    
    
    
    expect(cloned.innerHTML).toBeTruthy();
    expect(cloned.innerHTML.length).toBeGreaterThan(0);
    
    
    expect(cloned.innerHTML).toContain("Título Principal");
    expect(cloned.innerHTML).toContain("<strong>texto en negrita</strong>");
    expect(cloned.innerHTML).toContain("<li>Item 1</li>");
    
    
    expect(cloned.childNodes.length).toBeGreaterThan(0);
    expect(cloned.childNodes.length).toBe(container.childNodes.length);
    
    
    expect(cloned.children.length).toBe(3); 
    expect(cloned.children.length).toBe(container.children.length);
    
    
    expect(cloned.querySelector("h1")).toBeTruthy();
    expect(cloned.querySelector("p")).toBeTruthy();
    expect(cloned.querySelector("ul")).toBeTruthy();
    expect(cloned.querySelectorAll("li").length).toBe(3);
  });

  it("REPRODUCCIÓN: debe mantener la estructura completa de hijos", () => {
    const html = `
      <div id="parent">
        <div class="level-1">
          <div class="level-2">
            <div class="level-3">
              Contenido profundo
            </div>
          </div>
        </div>
      </div>
    `;
    
    const doc = parseHTML(html);
    const parent = doc.querySelector("#parent")!;
    
    console.log("\n=== ESTRUCTURA DE HIJOS ANTES ===");
    console.log("Parent childNodes:", parent.childNodes.length);
    console.log("Level-1 existe:", !!parent.querySelector(".level-1"));
    console.log("Level-2 existe:", !!parent.querySelector(".level-2"));
    console.log("Level-3 existe:", !!parent.querySelector(".level-3"));
    
    const cloned = parent.cloneNode(true);
    
    console.log("\n=== ESTRUCTURA DE HIJOS DESPUÉS ===");
    console.log("Clonado childNodes:", cloned.childNodes.length);
    console.log("Level-1 existe:", !!cloned.querySelector(".level-1"));
    console.log("Level-2 existe:", !!cloned.querySelector(".level-2"));
    console.log("Level-3 existe:", !!cloned.querySelector(".level-3"));
    
    
    expect(cloned.childNodes.length).toBe(parent.childNodes.length);
    expect(cloned.querySelector(".level-1")).toBeTruthy();
    expect(cloned.querySelector(".level-2")).toBeTruthy();
    expect(cloned.querySelector(".level-3")).toBeTruthy();
    expect(cloned.querySelector(".level-3")?.textContent).toContain("Contenido profundo");
  });

  it("REPRODUCCIÓN: debe copiar atributos Y contenido simultáneamente", () => {
    const html = `
      <div 
        id="complex" 
        class="container main" 
        data-id="123" 
        data-type="test"
        aria-label="Complex element"
      >
        <header>
          <h1>Header Title</h1>
        </header>
        <main>
          <p>Main content</p>
        </main>
        <footer>
          <p>Footer content</p>
        </footer>
      </div>
    `;
    
    const doc = parseHTML(html);
    const complex = doc.querySelector("#complex")!;
    
    console.log("\n=== ANTES: ATRIBUTOS Y CONTENIDO ===");
    console.log("Atributos:", JSON.stringify(complex.attributes, null, 2));
    console.log("innerHTML length:", complex.innerHTML.length);
    console.log("Hijos:", complex.children.length);
    
    const cloned = complex.cloneNode(true);
    
    console.log("\n=== DESPUÉS: ATRIBUTOS Y CONTENIDO ===");
    console.log("Atributos clonados:", JSON.stringify(cloned.attributes, null, 2));
    console.log("innerHTML length clonado:", cloned.innerHTML.length);
    console.log("Hijos clonados:", cloned.children.length);
    
    
    expect(cloned.getAttribute("id")).toBe("complex");
    expect(cloned.getAttribute("class")).toBe("container main");
    expect(cloned.getAttribute("data-id")).toBe("123");
    expect(cloned.getAttribute("data-type")).toBe("test");
    expect(cloned.getAttribute("aria-label")).toBe("Complex element");
    
    
    expect(cloned.innerHTML.length).toBeGreaterThan(0);
    expect(cloned.children.length).toBe(3); 
    expect(cloned.querySelector("header h1")?.textContent).toBe("Header Title");
    expect(cloned.querySelector("main p")?.textContent).toBe("Main content");
    expect(cloned.querySelector("footer p")?.textContent).toBe("Footer content");
  });

  it("REPRODUCCIÓN: comparar original vs clonado lado a lado", () => {
    const html = `
      <article id="article">
        <h1>Artículo de Prueba</h1>
        <p class="intro">Introducción del artículo.</p>
        <section>
          <h2>Sección 1</h2>
          <p>Contenido de la sección 1.</p>
        </section>
        <section>
          <h2>Sección 2</h2>
          <p>Contenido de la sección 2.</p>
        </section>
      </article>
    `;
    
    const doc = parseHTML(html);
    const original = doc.querySelector("#article")!;
    const cloned = original.cloneNode(true);
    
    console.log("\n=== COMPARACIÓN ORIGINAL VS CLONADO ===");
    
    const comparison = {
      nodeName: {
        original: original.nodeName,
        cloned: cloned.nodeName,
        match: original.nodeName === cloned.nodeName
      },
      id: {
        original: original.getAttribute("id"),
        cloned: cloned.getAttribute("id"),
        match: original.getAttribute("id") === cloned.getAttribute("id")
      },
      childNodesLength: {
        original: original.childNodes.length,
        cloned: cloned.childNodes.length,
        match: original.childNodes.length === cloned.childNodes.length
      },
      childrenLength: {
        original: original.children.length,
        cloned: cloned.children.length,
        match: original.children.length === cloned.children.length
      },
      innerHTMLLength: {
        original: original.innerHTML.length,
        cloned: cloned.innerHTML.length,
        match: original.innerHTML.length === cloned.innerHTML.length
      },
      textContentLength: {
        original: original.textContent.length,
        cloned: cloned.textContent.length,
        match: original.textContent.length === cloned.textContent.length
      }
    };
    
    console.table(comparison);
    
    
    expect(comparison.nodeName.match).toBe(true);
    expect(comparison.id.match).toBe(true);
    expect(comparison.childNodesLength.match).toBe(true);
    expect(comparison.childrenLength.match).toBe(true);
    expect(comparison.innerHTMLLength.match).toBe(true);
    expect(comparison.textContentLength.match).toBe(true);
    
    
    expect(cloned.querySelector("h1")?.textContent).toBe("Artículo de Prueba");
    expect(cloned.querySelector(".intro")?.textContent).toBe("Introducción del artículo.");
    expect(cloned.querySelectorAll("section").length).toBe(2);
    expect(cloned.querySelectorAll("h2").length).toBe(2);
  });

  it("REPRODUCCIÓN: verificar que innerHTML NO está vacío después de clonar", () => {
    const testCases = [
      {
        name: "Elemento simple con texto",
        html: `<div>Texto simple</div>`
      },
      {
        name: "Elemento con un hijo",
        html: `<div><span>Un hijo</span></div>`
      },
      {
        name: "Elemento con múltiples hijos",
        html: `<div><p>P1</p><p>P2</p><p>P3</p></div>`
      },
      {
        name: "Elemento con anidación profunda",
        html: `<div><div><div><div>Profundo</div></div></div></div>`
      },
      {
        name: "Lista compleja",
        html: `<ul><li>A</li><li>B<ul><li>B1</li><li>B2</li></ul></li><li>C</li></ul>`
      }
    ];
    
    console.log("\n=== VERIFICANDO innerHTML EN MÚLTIPLES CASOS ===");
    
    testCases.forEach(({ name, html }) => {
      const doc = parseHTML(html);
      const root = doc.body || doc;
      const element = root.querySelector("div") || root.querySelector("ul")!;
      const cloned = element.cloneNode(true);
      
      const result = {
        caso: name,
        originalInnerHTML_vacio: !element.innerHTML || element.innerHTML.length === 0,
        clonedInnerHTML_vacio: !cloned.innerHTML || cloned.innerHTML.length === 0,
        originalLength: element.innerHTML.length,
        clonedLength: cloned.innerHTML.length,
        match: element.innerHTML.length === cloned.innerHTML.length
      };
      
      console.log(JSON.stringify(result, null, 2));
      
      
      if (element.children.length > 0) {
        expect(cloned.innerHTML).toBeTruthy();
        expect(cloned.innerHTML.length).toBeGreaterThan(0);
        expect(cloned.innerHTML.length).toBe(element.innerHTML.length);
      }
    });
  });

  it("REPRODUCCIÓN: acceder a childNodes inmediatamente después de clonar", () => {
    const html = `
      <div id="test">
        Texto inicial
        <span>Span 1</span>
        Texto intermedio
        <span>Span 2</span>
        Texto final
      </div>
    `;
    
    const doc = parseHTML(html);
    const test = doc.querySelector("#test")!;
    
    console.log("\n=== ACCESO A childNodes ===");
    console.log("Original childNodes.length:", test.childNodes.length);
    
    const cloned = test.cloneNode(true);
    
    console.log("Clonado childNodes.length INMEDIATAMENTE:", cloned.childNodes.length);
    
    
    expect(cloned.childNodes).toBeTruthy();
    expect(cloned.childNodes.length).toBeGreaterThan(0);
    expect(cloned.childNodes.length).toBe(test.childNodes.length);
    
    
    console.log("\nIterando childNodes del clon:");
    for (let i = 0; i < cloned.childNodes.length; i++) {
      const node = cloned.childNodes[i];
      console.log(`  ${i}: nodeType=${node.nodeType}, nodeName=${node.nodeName}, content="${node.textContent?.substring(0, 20)}"`);
      expect(node).toBeTruthy();
    }
    
    
    const spans = cloned.querySelectorAll("span");
    expect(spans.length).toBe(2);
    expect(spans[0]?.textContent).toBe("Span 1");
    expect(spans[1]?.textContent).toBe("Span 2");
  });
});
