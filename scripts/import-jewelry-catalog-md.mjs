import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const markdownPath = resolve(root, "Duc-Chinh-Jewelry-60-san-pham-moi.md");
const catalogPath = resolve(root, "backend/database/data/jewelry_products.json");

const markdown = await readFile(markdownPath, "utf8");
const existingCatalog = JSON.parse(await readFile(catalogPath, "utf8"));

const sectionMetadata = new Map([
  ["Dây chuyền", { category: "Dây chuyền", type: "Dây Chuyền" }],
  ["Bông tai", { category: "Bông tai", type: "Bông Tai" }],
  ["Vòng tay và lắc tay", { category: "Vòng tay", type: "Vòng Tay và Lắc Tay" }],
]);

let currentSection = null;
const importedProducts = [];

for (const line of markdown.split(/\r?\n/)) {
  const heading = line.match(/^##\s+(.+?)\s*$/);

  if (heading && sectionMetadata.has(heading[1])) {
    currentSection = sectionMetadata.get(heading[1]);
    continue;
  }

  if (!currentSection || !/^\|\s*\d+\s*\|/.test(line)) {
    continue;
  }

  const columns = line
    .split("|")
    .slice(1, -1)
    .map((value) => value.trim().replace(/^`|`$/g, ""));

  const [idText, name, materials, priceText, stockText, image, summary] = columns;
  const id = Number(idText);

  if (!Number.isInteger(id) || id < 61 || id > 120) {
    continue;
  }

  importedProducts.push({
    id,
    name,
    price: Number(priceText.replace(/\D/g, "")),
    image,
    description: `${summary.replace(/[.。]$/, "")}. Chất liệu: ${materials}.`,
    category: currentSection.category,
    type: currentSection.type,
    is_best_seller: false,
    stock: Number(stockText),
    status: "active",
  });
}

if (importedProducts.length !== 60) {
  throw new Error(`Expected 60 products in the Markdown catalog, found ${importedProducts.length}.`);
}

const catalogById = new Map(existingCatalog.map((product) => [Number(product.id), product]));

for (const product of importedProducts) {
  catalogById.set(product.id, product);
}

const mergedCatalog = [...catalogById.values()].sort((left, right) => left.id - right.id);

const formattedCatalog = [
  "[",
  ...mergedCatalog.flatMap((product, productIndex) => [
    "    {",
    ...Object.entries(product).map(([key, value], fieldIndex, fields) =>
      `        ${JSON.stringify(key)}:  ${JSON.stringify(value)}${fieldIndex < fields.length - 1 ? "," : ""}`,
    ),
    `    }${productIndex < mergedCatalog.length - 1 ? "," : ""}`,
  ]),
  "]",
  "",
].join("\n");

await writeFile(catalogPath, formattedCatalog, "utf8");

console.log(`Imported products 61-120. Catalog now contains ${mergedCatalog.length} products.`);
