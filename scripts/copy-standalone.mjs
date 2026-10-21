import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneNext = path.join(root, ".next", "standalone", ".next");
const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standaloneNext, "static");
const publicSrc = path.join(root, "public");
const publicDest = path.join(root, ".next", "standalone", "public");

if (fs.existsSync(staticSrc)) {
  fs.mkdirSync(standaloneNext, { recursive: true });
  fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
}

if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
}

console.log("Standalone assets copied successfully.");
