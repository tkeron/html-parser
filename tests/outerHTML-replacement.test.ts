import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";

describe("outerHTML replacement - Browser behavior", () => {
  it("should replace element with its innerHTML when setting outerHTML = innerHTML", () => {
    // Simula el comportamiento del navegador:
    // elem.outerHTML = elem.innerHTML;
    // Esto reemplaza el elemento completo con solo su contenido interno
    
    const doc = parseHTML(`
      <html>
        <body>
          <div id="mi-prueba" style="border: 2px solid red; padding: 10px;">
            <strong>¡Hola!</strong> Soy el contenido que se quedará.
          </div>
        </body>
      </html>
    `);
    
    const elem = doc.querySelector("#mi-prueba");
    expect(elem).not.toBeNull();
    
    // Capturamos el innerHTML antes de la operación
    const innerHTML = elem!.innerHTML;
    expect(innerHTML).toContain("<strong>¡Hola!</strong>");
    expect(innerHTML).toContain("Soy el contenido que se quedará.");
    
    // Capturamos el padre antes de la operación
    const parent = elem!.parentNode;
    expect(parent).not.toBeNull();
    expect(parent!.childNodes).toContain(elem);
    
    // LA MAGIA: Sustituimos el outerHTML con el innerHTML
    elem!.outerHTML = innerHTML;
    
    // Verificación: El ID 'mi-prueba' ya no debe existir en el DOM
    const elemAfter = doc.querySelector("#mi-prueba");
    expect(elemAfter).toBeNull();
    
    // El contenido (strong e innerHTML) debe seguir existiendo en el body
    const body = doc.querySelector("body");
    expect(body!.innerHTML).toContain("<strong>¡Hola!</strong>");
    expect(body!.innerHTML).toContain("Soy el contenido que se quedará.");
    
    // El div con id y style NO debe existir
    expect(body!.innerHTML).not.toContain('id="mi-prueba"');
    expect(body!.innerHTML).not.toContain('style=');
  });

  it("should replace element with simple text content", () => {
    const doc = parseHTML(`
      <div>
        <p id="paragraph" class="styled">Simple text</p>
      </div>
    `);
    
    const paragraph = doc.querySelector("#paragraph");
    expect(paragraph).not.toBeNull();
    
    const parent = paragraph!.parentNode;
    const innerHTML = paragraph!.innerHTML;
    
    // Reemplazar el <p> con solo "Simple text"
    paragraph!.outerHTML = innerHTML;
    
    // El párrafo no debe existir
    expect(doc.querySelector("#paragraph")).toBeNull();
    
    // El texto debe seguir ahí
    expect(parent!.textContent).toContain("Simple text");
  });

  it("should replace element with multiple child nodes", () => {
    const doc = parseHTML(`
      <ul>
        <li id="item-container">
          <span>Item 1</span>
          <span>Item 2</span>
        </li>
      </ul>
    `);
    
    const container = doc.querySelector("#item-container");
    expect(container).not.toBeNull();
    
    const ul = doc.querySelector("ul");
    const innerHTML = container!.innerHTML;
    
    // Reemplazar el <li> con sus hijos
    container!.outerHTML = innerHTML;
    
    // El li no debe existir
    expect(doc.querySelector("#item-container")).toBeNull();
    
    // Los spans deben seguir existiendo directamente en el ul
    const spans = ul!.querySelectorAll("span");
    expect(spans.length).toBe(2);
    expect(spans[0]?.textContent).toBe("Item 1");
    expect(spans[1]?.textContent).toBe("Item 2");
  });

  it("should replace element with empty string", () => {
    const doc = parseHTML(`
      <div>
        <span id="to-remove"></span>
      </div>
    `);
    
    const span = doc.querySelector("#to-remove");
    expect(span).not.toBeNull();
    
    const parent = span!.parentNode;
    const childCountBefore = parent!.childNodes.length;
    
    // Reemplazar con string vacío = eliminar el elemento
    span!.outerHTML = "";
    
    // El span no debe existir
    expect(doc.querySelector("#to-remove")).toBeNull();
    
    // El padre debe tener un hijo menos
    expect(parent!.childNodes.length).toBe(childCountBefore - 1);
  });

  it("should replace element with new HTML structure", () => {
    const doc = parseHTML(`
      <div>
        <p id="old">Old content</p>
      </div>
    `);
    
    const oldParagraph = doc.querySelector("#old");
    expect(oldParagraph).not.toBeNull();
    
    const parent = oldParagraph!.parentNode;
    
    // Reemplazar con un div diferente
    oldParagraph!.outerHTML = '<div id="new">New content</div>';
    
    // El párrafo viejo no debe existir
    expect(doc.querySelector("#old")).toBeNull();
    
    // El div nuevo debe existir
    const newDiv = doc.querySelector("#new");
    expect(newDiv).not.toBeNull();
    expect(newDiv!.textContent).toBe("New content");
    expect(newDiv!.parentNode).toBe(parent);
  });

  it("should maintain sibling relationships after outerHTML replacement", () => {
    const doc = parseHTML(`
      <div>
        <span>First</span>
        <p id="middle">Middle</p>
        <span>Last</span>
      </div>
    `);
    
    const middle = doc.querySelector("#middle");
    const firstSpan = doc.querySelectorAll("span")[0];
    const lastSpan = doc.querySelectorAll("span")[1];
    
    // Reemplazar middle con su innerHTML
    middle!.outerHTML = middle!.innerHTML;
    
    // Los hermanos deben seguir conectados correctamente
    expect(firstSpan!.nextSibling).not.toBe(middle);
    expect(lastSpan!.previousSibling).not.toBe(middle);
    
    // El texto "Middle" debe seguir existiendo como texto
    const parent = firstSpan!.parentNode;
    expect(parent!.textContent).toContain("Middle");
  });

  it("should handle complex nested HTML replacement", () => {
    const doc = parseHTML(`
      <article>
        <section id="wrapper" class="container" data-id="123">
          <h2>Title</h2>
          <p>Paragraph <strong>bold</strong> text</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </section>
      </article>
    `);
    
    const wrapper = doc.querySelector("#wrapper");
    expect(wrapper).not.toBeNull();
    
    const article = doc.querySelector("article");
    const innerHTML = wrapper!.innerHTML;
    
    // Reemplazar section con su contenido
    wrapper!.outerHTML = innerHTML;
    
    // El section no debe existir
    expect(doc.querySelector("#wrapper")).toBeNull();
    expect(doc.querySelector("section")).toBeNull();
    
    // Pero todo su contenido debe estar directamente en article
    expect(article!.querySelector("h2")).not.toBeNull();
    expect(article!.querySelector("h2")!.textContent).toBe("Title");
    expect(article!.querySelector("strong")).not.toBeNull();
    expect(article!.querySelectorAll("li").length).toBe(2);
  });
});
