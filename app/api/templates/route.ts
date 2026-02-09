import fs from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const p = path.join(process.cwd(), "public", "templates", "manifest.json");
  const raw = await fs.readFile(p, "utf-8");
  return new Response(raw, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
