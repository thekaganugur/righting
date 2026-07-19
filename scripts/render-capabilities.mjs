import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderCapabilityCatalogReference } from "../dist/src/capabilities.js";

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const referencePath = resolve(rootDirectory, "docs/capabilities.md");

mkdirSync(dirname(referencePath), { recursive: true });
writeFileSync(referencePath, renderCapabilityCatalogReference(), "utf8");
