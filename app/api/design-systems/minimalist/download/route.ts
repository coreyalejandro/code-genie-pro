import archiver from "archiver";
import { glob } from "glob";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const root = process.cwd();
  const versionPath = path.join(root, "design-system/minimalist/VERSION.txt");
  const version = fs.readFileSync(versionPath, "utf8").trim();

  const zipName = `minimalist-design-kit_v${version}.zip`;

  const stream = new ReadableStream({
    start(controller) {
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.on("data", (chunk) => controller.enqueue(chunk));
      archive.on("end", () => controller.close());
      archive.on("warning", (err) => controller.error(err));
      archive.on("error", (err) => controller.error(err));

      (async () => {
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
      })().catch((e) => controller.error(e));
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}"`,
      "Cache-Control": "no-store",
    },
  });
}
