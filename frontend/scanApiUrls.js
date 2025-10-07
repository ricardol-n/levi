// scanApiUrls.js
import fs from "fs";
import path from "path";

// Root folder to scan
const rootDir = path.resolve("./src");

// Patterns to search for
const patterns = [
  /http:\/\/localhost/i,
  /https:\/\/.*onrender\.com/i,
  /\/api\//i
];

const ignoreDirs = ["node_modules", "dist", "build"];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name)) scanDir(fullPath);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/i.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf8");
      patterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          console.log(`⚠️  Found in ${fullPath}:`, matches[0]);
        }
      });
    }
  }
}

console.log(`🔍 Scanning for hardcoded API URLs in: ${rootDir}`);
scanDir(rootDir);
console.log("✅ Scan complete.");
