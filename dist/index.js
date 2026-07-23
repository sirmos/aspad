#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const generateServer_1 = require("./generators/generateServer");
const generateListing_1 = require("./generators/generateListing");
const generatePrompts_1 = require("./generators/generatePrompts");
const generateDemoScript_1 = require("./generators/generateDemoScript");
// No external packages needed. Just run:
//   npx ts-node src/index.ts build path/to/spec.json
const [, , command, specFile] = process.argv;
if (command !== "build" || !specFile) {
    console.log("Usage: aspad build <specFile>");
    process.exit(1);
}
const raw = fs.readFileSync(path.resolve(specFile), "utf-8");
const spec = JSON.parse(raw);
const outDir = path.resolve("generated", slug(spec.name));
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "server.ts"), (0, generateServer_1.generateServerCode)(spec));
fs.writeFileSync(path.join(outDir, "listing.md"), (0, generateListing_1.generateListing)(spec));
fs.writeFileSync(path.join(outDir, "registration-prompts.md"), (0, generatePrompts_1.generatePrompts)(spec));
fs.writeFileSync(path.join(outDir, "demo-script.md"), (0, generateDemoScript_1.generateDemoScript)(spec));
fs.writeFileSync(path.join(outDir, "package.json"), generatePackageJson(spec));
console.log("Built " + spec.name + " in " + outDir);
console.log("Files: server.ts, listing.md, registration-prompts.md, demo-script.md, package.json");
function slug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function generatePackageJson(spec) {
    return JSON.stringify({
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
    }, null, 2);
}
