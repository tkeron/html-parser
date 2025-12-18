#!/usr/bin/env bun



import { parseHTML } from "../index.js";


const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(color: string, ...args: any[]) {
  console.log(color + args.join(" ") + colors.reset);
}

function separator() {
  console.log("\n" + "=".repeat(70) + "\n");
}

function testCloneNode(html: string, selector: string, testName: string) {
  separator();
  log(colors.bright + colors.blue, `🧪 TEST: ${testName}`);
  console.log();

  log(colors.cyan, "📝 HTML Input:");
  console.log(html);
  console.log();

  
  const doc = parseHTML(html);
  const element = doc.querySelector(selector);

  if (!element) {
    log(colors.red, "❌ ERROR: No se encontró elemento con selector:", selector);
    return;
  }

  log(colors.yellow, "🔍 Elemento original encontrado:");
  console.log("  - nodeName:", element.nodeName);
  console.log("  - id:", element.getAttribute("id"));
  console.log("  - childNodes.length:", element.childNodes.length);
  console.log("  - children.length:", element.children.length);
  console.log("  - innerHTML.length:", element.innerHTML.length);
  console.log("  - textContent.length:", element.textContent.length);
  console.log();

  log(colors.bright, "⚙️  Clonando con cloneNode(true)...");
  const cloned = element.cloneNode(true);
  console.log();

  log(colors.yellow, "🔍 Elemento clonado:");
  console.log("  - nodeName:", cloned.nodeName);
  console.log("  - id:", cloned.getAttribute("id"));
  console.log("  - childNodes.length:", cloned.childNodes.length);
  console.log("  - children.length:", cloned.children.length);
  console.log("  - innerHTML.length:", cloned.innerHTML.length);
  console.log("  - textContent.length:", cloned.textContent.length);
  console.log();

  
  log(colors.bright + colors.cyan, "📊 Comparación:");
  const checks = {
    "nodeName coincide":
      element.nodeName === cloned.nodeName ? "✅" : "❌",
    "childNodes.length coincide":
      element.childNodes.length === cloned.childNodes.length ? "✅" : "❌",
    "children.length coincide":
      element.children.length === cloned.children.length ? "✅" : "❌",
    "innerHTML.length coincide":
      element.innerHTML.length === cloned.innerHTML.length ? "✅" : "❌",
    "innerHTML no vacío":
      cloned.innerHTML.length > 0 ? "✅" : "❌",
    "childNodes no vacío":
      cloned.childNodes.length > 0 ? "✅" : "❌",
  };

  for (const [check, result] of Object.entries(checks)) {
    console.log(`  ${result} ${check}`);
  }
  console.log();

  
  log(colors.cyan, "📄 Original innerHTML:");
  console.log(element.innerHTML);
  console.log();

  log(colors.cyan, "📄 Clonado innerHTML:");
  console.log(cloned.innerHTML);
  console.log();

  
  log(colors.bright + colors.cyan, "🔍 Pruebas de querySelector en el clon:");
  const queries = [
    "div",
    "p",
    "span",
    "h1, h2, h3",
    "ul",
    "li",
    "[id]",
    "[class]",
  ];

  for (const query of queries) {
    const result = cloned.querySelector(query);
    console.log(
      `  ${result ? "✅" : "⚪"} querySelector("${query}"): ${
        result ? result.nodeName : "no encontrado"
      }`
    );
  }

  const allDone = Object.values(checks).every((v) => v === "✅");
  console.log();
  log(
    allDone ? colors.green : colors.red,
    allDone ? "✅ TEST PASÓ" : "❌ TEST FALLÓ"
  );
}





console.clear();
log(
  colors.bright + colors.green,
  "\n🧬 cloneNode Interactive Test Suite\n"
);


testCloneNode(
  `<div id="simple">Hello World</div>`,
  "#simple",
  "Elemento simple con texto"
);


testCloneNode(
  `
  <div id="nested">
    <h1>Title</h1>
    <p>Paragraph with <strong>bold</strong> text</p>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>
  </div>
  `,
  "#nested",
  "Elementos anidados múltiples niveles"
);


testCloneNode(
  `
  <article id="article">
    <header>
      <h1>Article Title</h1>
      <p class="meta">By Author Name</p>
    </header>
    <section class="content">
      <p>First paragraph</p>
      <p>Second paragraph</p>
      <div class="callout">
        <strong>Important:</strong> This is a callout
      </div>
    </section>
    <footer>
      <a href="#">Read more</a>
    </footer>
  </article>
  `,
  "#article",
  "Estructura compleja tipo artículo"
);


testCloneNode(
  `
  <form id="form">
    <input type="text" name="username" value="john" />
    <input type="email" name="email" value="test@example.com" />
    <textarea name="bio">User bio</textarea>
    <button type="submit">Submit</button>
  </form>
  `,
  "#form",
  "Formulario con inputs"
);


testCloneNode(
  `
  <table id="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Age</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John</td>
        <td>30</td>
      </tr>
      <tr>
        <td>Jane</td>
        <td>25</td>
      </tr>
    </tbody>
  </table>
  `,
  "#table",
  "Tabla HTML"
);

separator();
log(colors.bright + colors.green, "✅ Todos los tests interactivos completados");
log(colors.cyan, "\n💡 TIP: Modifica este archivo para agregar tus propios tests");
console.log();
