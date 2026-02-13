import { spawnSync } from "node:child_process";

// Basic sanity: ensure the wrapper starts and the CLI exists.
const r = spawnSync("openclaw", ["--version"], { encoding: "utf8" });
const out = String(r.stdout || "").trim();
const err = String(r.stderr || "").trim();

if (r.error) {
  console.error("openclaw launch error:", r.error.message);
  process.exit(1);
}

if (r.status !== 0) {
  console.error(out || err || "openclaw --version failed with no output");
  process.exit(r.status ?? 1);
}

if (!out) {
  console.error("openclaw --version returned empty output");
  process.exit(1);
}

console.log("openclaw ok:", out);
