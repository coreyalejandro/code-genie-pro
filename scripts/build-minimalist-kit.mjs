import fs from "node:fs";
import path from "node:path";
import archiver from "archiver";
import { glob } from "glob";

const root = process.cwd();
const version = fs
  .readFileSync(path.join(root, "design-system/minimalist/VERSION.txt"), "utf8")
  .trim();

const outDir = path.join(root, "public", "downloads");
fs.mkdirSync(outDir, { recursive: true });

const zipName = `minimalist-design-kit_v${version}.zip`;
const outPath = path.join(outDir, zipName);

const output = fs.createWriteStream(outPath);
const archive = archiver("zip", { zlib: { level: 9 } });

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);

const patterns = [
  "design-system/minimalist/VERSION.txt",
  "design-system/minimalist/docs/**/*",
  "design-system/minimalist/kit/**/*",
];

for (const pattern of patterns) {
  const matches = await glob(pattern, { cwd: root, nodir: false, dot: true });
  for (const rel of matches) {
    const abs = path.join(root, rel);
    const stat = fs.statSync(abs);
    if (stat.isFile()) {
      archive.file(abs, { name: rel.replace("design-system/minimalist/", "") });
    }
  }
}

await archive.finalize();

console.log(`Wrote: ${path.relative(root, outPath)}`);
