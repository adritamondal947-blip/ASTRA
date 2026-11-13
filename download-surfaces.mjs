import fs from 'fs';
import path from 'path';
import https from 'https';

const items = [
  { file: 'imgLunarResearchStation.png', url: 'https://www.figma.com/api/mcp/asset/de8b6e35-ffcf-4337-a507-e9438209d746/a12ba.png' },
  { file: 'imgMarsSettlement.png', url: 'https://www.figma.com/api/mcp/asset/2c6fa84c-20a5-48d4-9d0e-6c96144d383b/ba2ab.png' },
];

const targetDir = path.resolve('src/assets/figma');

function download(filename, url) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(targetDir, filename));
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        https.get(response.headers.location, (res2) => {
          res2.pipe(file);
          file.on('finish', () => file.close(resolve));
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => file.close(resolve));
      }
    }).on('error', reject);
  });
}

async function run() {
  for (const item of items) {
    console.log(`Downloading ${item.file}...`);
    await download(item.file, item.url);
  }
  console.log('Environments downloaded.');
}

run().catch(console.error);

