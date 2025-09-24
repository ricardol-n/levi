// scan-routes.js
const fs = require("fs");
const path = require("path");

console.log("🔍 Scanning project for routes & API URLs...");

const ROOT_DIR = path.join(__dirname, "..");
const IGNORE_DIRS = ["node_modules", "build", "dist", ".git"];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && IGNORE_DIRS.includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    // backend express routes
    if (/\b(app|router)\.(use|get|post|put|delete|patch)\s*\(/.test(line)) {
      checkLine(filePath, line, idx + 1, "Backend Route");
    }

    // frontend API calls
    if (/(axios|fetch)\s*\(\s*["'`]/.test(line)) {
      checkLine(filePath, line, idx + 1, "Frontend API");
    }

    // React Router
    if (/path\s*=\s*["'`]/.test(line)) {
      checkLine(filePath, line, idx + 1, "React Router Path");
    }

    // generic absolute URLs
    if (/https?:\/\//.test(line)) {
      checkLine(filePath, line, idx + 1, "Absolute URL");
    }
  });
}

function checkLine(filePath, line, lineNumber, type) {
  let issue = null;

  if (/https?:\/\//.test(line)) {
    issue = "❌ Absolute URL detected (use relative or env variable)";
  } else if (
    /path\s*=\s*["'`][^/]/.test(line) &&
    !/path\s*=\s*["'`]\*/.test(line)
  ) {
    issue = "⚠️ Path does not start with '/'";
  }

  if (issue) {
    console.log(
      `\n🚨 Suspicious ${type} in ${filePath}:${lineNumber}\n   → ${line.trim()}\n   ↳ ${issue}`
    );
  }
}

// run
scanDir(ROOT_DIR);

console.log("\n✅ Scan complete.");
