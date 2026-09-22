import { spawn } from "node:child_process";

export function which(cmd) {
  const safe = String(cmd || "").replace(/[^a-zA-Z0-9._+-]/g, "");
  if (!safe) return Promise.resolve("");
  return new Promise((r) => {
    const child = spawn("bash", ["-lc", `command -v ${safe}`], { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.on("close", (c) => r(c === 0 ? out.trim() : ""));
  });
}

export function run(bin, args, { timeoutMs = 30_000, maxOut = 60_000 } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const t = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("timeout"));
    }, timeoutMs);
    child.stdout.on("data", (d) => {
      stdout += d;
      if (stdout.length > maxOut * 2) child.kill("SIGKILL");
    });
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (code) => {
      clearTimeout(t);
      resolvePromise({
        code,
        stdout: stdout.slice(0, maxOut),
        stderr: stderr.slice(0, 4000),
        truncated: stdout.length > maxOut,
      });
    });
    child.on("error", (e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

export async function mailStatus() {
  return {
    ok: true,
    himalaya: (await which("himalaya")) || null,
    notmuch: (await which("notmuch")) || null,
  };
}

export async function himalayaList({ folder = "INBOX", limit = 20, timeoutMs } = {}) {
  const bin = (await which("himalaya")) || "himalaya";
  const n = Math.min(50, Math.max(1, Number(limit) || 20));
  const folderSafe = String(folder || "INBOX").replace(/[^A-Za-z0-9._/+-]/g, "");
  // himalaya envelope list
  const r = await run(bin, ["envelope", "list", "-f", folderSafe, "-s", String(n), "-o", "json"], {
    timeoutMs,
    maxOut: 80_000,
  });
  if (r.code !== 0) {
    // fallback without json
    const r2 = await run(bin, ["envelope", "list", "-f", folderSafe, "-s", String(n)], { timeoutMs });
    if (r2.code !== 0) throw new Error(`himalaya list failed: ${r2.stderr || r2.code}`);
    return { ok: true, folder: folderSafe, output: r2.stdout, truncated: r2.truncated };
  }
  let items;
  try {
    items = JSON.parse(r.stdout || "[]");
  } catch {
    return { ok: true, folder: folderSafe, output: r.stdout };
  }
  const list = (Array.isArray(items) ? items : []).slice(0, n).map((e) => ({
    id: e.id,
    subject: e.subject,
    from: e.from,
    date: e.date,
  }));
  return { ok: true, folder: folderSafe, count: list.length, envelopes: list };
}

export async function notmuchSearch({ query, limit = 20, timeoutMs } = {}) {
  const q = String(query || "").trim();
  if (!q || q.length > 500) throw new Error("invalid notmuch query");
  const bin = (await which("notmuch")) || "notmuch";
  const n = Math.min(50, Math.max(1, Number(limit) || 20));
  const r = await run(bin, ["search", "--limit", String(n), "--format=json", "--output=summary", q], {
    timeoutMs,
    maxOut: 80_000,
  });
  if (r.code !== 0) throw new Error(`notmuch search failed: ${r.stderr || r.code}`);
  let items;
  try {
    items = JSON.parse(r.stdout || "[]");
  } catch {
    return { ok: true, output: r.stdout };
  }
  return { ok: true, count: Array.isArray(items) ? items.length : 0, results: items };
}
