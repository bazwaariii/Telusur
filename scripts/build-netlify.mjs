import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rootDir = process.cwd();
const nextDir = path.join(rootDir, ".next");
const appServerDir = path.join(nextDir, "server", "app");
const staticDir = path.join(nextDir, "static");
const publicDir = path.join(rootDir, "public");
const outDir = path.join(rootDir, "out");
const dropDir = path.join(rootDir, "SIAP_DROP_KE_NETLIFY");

function copyRecursive(src, dest, filterFn) {
  if (!fs.existsSync(src)) return;
  if (filterFn && !filterFn(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry), filterFn);
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

console.log("[TELUSUR] Menjalankan next build...");
execSync("npx next build", { stdio: "inherit" });

for (const targetDir of [outDir, dropDir]) {
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // 1. Salin aset public (kecuali runtime-state sementara)
  copyRecursive(publicDir, targetDir, (p) => !path.basename(p).startsWith("runtime-state"));

  // 2. Salin bundle statis _next/static
  copyRecursive(staticDir, path.join(targetDir, "_next", "static"));

  // 3. Salin seluruh halaman HTML yang telah di-prerender oleh Next.js
  if (fs.existsSync(appServerDir)) {
    for (const entry of fs.readdirSync(appServerDir)) {
      if (entry.endsWith(".html")) {
        const srcHtml = path.join(appServerDir, entry);
        const pageName = entry.slice(0, -5);
        if (pageName === "index") {
          fs.copyFileSync(srcHtml, path.join(targetDir, "index.html"));
        } else if (pageName === "_not-found") {
          fs.copyFileSync(srcHtml, path.join(targetDir, "404.html"));
        } else {
          fs.copyFileSync(srcHtml, path.join(targetDir, `${pageName}.html`));
          const subDir = path.join(targetDir, pageName);
          fs.mkdirSync(subDir, { recursive: true });
          fs.copyFileSync(srcHtml, path.join(subDir, "index.html"));
        }
      }
    }
  }

  // 4. Tambahkan _headers dan _redirects untuk Netlify
  const headersContent = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`;
  fs.writeFileSync(path.join(targetDir, "_headers"), headersContent, "utf-8");

  const redirectsContent = `/tim /akses 301
`;
  fs.writeFileSync(path.join(targetDir, "_redirects"), redirectsContent, "utf-8");
}

console.log("[TELUSUR] Paket statis berhasil dibuat di folder 'out' dan 'SIAP_DROP_KE_NETLIFY'.");
