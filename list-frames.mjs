import fs from 'fs';
const text = fs.readFileSync('C:/Users/dell/.gemini/antigravity/brain/e25edac6-1965-4f58-8c62-d17b3da368f5/.system_generated/steps/202/output.txt', 'utf8');
const lines = text.split('\n');
for (const line of lines) {
  const m = line.match(/^  <frame id="([^"]+)" name="([^"]+)"/);
  if (m) {
    console.log(`${m[1]} -> ${m[2]}`);
  }
}

