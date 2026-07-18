#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { AspSpec } from "./types";
import { generateServerCode } from "./generators/generateServer";
import { generateListing } from "./generators/generateListing";
import { generatePrompts } from "./generators/generatePrompts";
import { generateDemoScript } from "./generators/generateDemoScript";

// No external packages needed. Just run:
//   npx ts-node src/index.ts build path/to/spec.json

const [, , command, specFile] = process.argv;

if (command !== "build" || !specFile) {
  console.log("Usage: aspad build <specFile>");
  process.exit(1);
}

const raw = fs.readFileSync(path.resolve(specFile), "utf-8");
const spec: AspSpec = JSON.parse(raw);

const outDir = path.resolve("generated", slug(spec.name));
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, "server.ts"), generateServerCode(spec));
fs.writeFileSync(path.join(outDir, "listing.md"), generateListing(spec));
fs.writeFileSync(
  path.join(outDir, "registration-prompts.md"),
  generatePrompts(spec)
);
fs.writeFileSync(
  path.join(outDir, "demo-script.md"),
  generateDemoScript(spec)
);
fs.writeFileSync(path.join(outDir, "package.json"), generatePackageJson(spec));

console.log("Built " + spec.name + " in " + outDir);
console.log(
  "Files: server.ts, listing.md, registration-prompts.md, demo-script.md, package.json"
);

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function generatePackageJson(spec: AspSpec): string {
  return JSON.stringify(
    {
      name: slug(spec.name),
      version: "0.1.0",
      main: "server.js",
      scripts: {
        build: "tsc server.ts",
        start: "node server.js",
      },
      dependencies: {
        express: "^4.19.0",
      },
      devDependencies: {
        typescript: "^5.4.0",
        "@types/express": "^4.17.0",
      },
    },
    null,
    2
  );
}
