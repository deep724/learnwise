import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { createServer } from "node:net";
const app = fileURLToPath(new URL("../", import.meta.url));
const outer = resolve(app, "..");
const checks = [];
// Processes belong only to this test; no existing server is reused or stopped.
const stop = child => new Promise(resolveStop => {
  if (process.platform === "win32") {
    const killer = spawn("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
    killer.on("close", resolveStop);
  } else { child.kill("SIGTERM"); resolveStop(); }
});
const cases = [];
for (const cwd of [outer, app]) {
  for (const npm of ["npm", "npm.cmd"]) {
    for (const script of ["run dev", "start"]) cases.push({ cwd, command: `${npm} ${script}` });
  }
}
cases.push({ cwd: outer, command: "START-LEARNWISE.cmd", launcher: true });
for (let i = 0; i < cases.length; i++) {
  const item = cases[i];
  const port = 5200 + i;
  const command = `${item.command}${item.launcher ? "" : " --"} --port ${port} --strictPort`;
  const child = spawn("cmd.exe", ["/d", "/s", "/c", command], {
    cwd: item.cwd, windowsHide: true, env: { ...process.env, BROWSER: "none" }, stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", d => output += d);
  child.stderr.on("data", d => output += d);
  try {
    const deadline = Date.now() + 45000;
    while (!output.includes(`127.0.0.1:${port}`)) {
      if (child.exitCode !== null || Date.now() > deadline) throw Error(output || "Server did not start");
      await new Promise(r => setTimeout(r, 250));
    }
    const html = await (await fetch(`http://127.0.0.1:${port}/`)).text();
    const source = await (await fetch(`http://127.0.0.1:${port}/main.tsx`)).text();
    if (!html.includes("LearnWise") || !source.includes("ContextualQuiz")) throw Error("Unexpected application source");
    checks.push({ cwd: item.cwd, command, url: `http://127.0.0.1:${port}/`, status: "PASS", source: "main.tsx / ContextualQuiz" });
    console.log(`PASS ${item.cwd === outer ? "outer" : "learnwise"}: ${command}`);
  } finally { await stop(child); }
}
// Hold a test-only local port to check both documented conflict behaviors.
const occupied = createServer();
await new Promise((resolveListen, reject) => { occupied.once("error", reject); occupied.listen(5209, "127.0.0.1", resolveListen); });
try {
  for (const strict of [true, false]) {
    const command = `npm.cmd run dev -- --port 5209${strict ? " --strictPort" : ""}`;
    const child = spawn("cmd.exe", ["/d", "/s", "/c", command], { cwd: outer, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", d => output += d);
    child.stderr.on("data", d => output += d);
    try {
      const deadline = Date.now() + 45000;
      while (strict ? child.exitCode === null : !output.includes("Local:")) {
        if (Date.now() > deadline || (!strict && child.exitCode !== null)) throw Error(output || "Port check timed out");
        await new Promise(r => setTimeout(r, 250));
      }
      if (strict && (child.exitCode === 0 || !output.includes("5209 is already in use"))) throw Error(output);
      if (!strict && !output.includes("trying another one")) throw Error(output);
      checks.push({ command, status: "PASS", behavior: strict ? "Occupied port fails clearly" : "Occupied port selects another port and prints URL" });
      console.log(`PASS ${strict ? "strict port conflict" : "automatic port fallback"}`);
    } finally { if (child.exitCode === null) await stop(child); }
  }
} finally { await new Promise(resolveClose => occupied.close(resolveClose)); }
await writeFile(resolve(app, "artifacts/startup-check.json"), JSON.stringify({ checkedAt: new Date().toISOString(), checks }, null, 2));
