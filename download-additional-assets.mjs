import fs from 'fs';
import path from 'path';
import https from 'https';

const prefix = "https://www.figma.com/api/mcp/asset/ef814336-4561-4515-93c9-ca262093bd81";
const prefix2 = "https://www.figma.com/api/mcp/asset/c9bf8908-4d06-402c-8ba8-e8d098b903de";

const newAssets = [
  { name: 'img3DMedicalBodyIllustrative.png', url: `${prefix}/18aa7.png` },
  { name: 'imgHomeIconActive.svg', url: `${prefix}/86a15.svg` },
  { name: 'imgBodyAssessmentIconActive.svg', url: `${prefix}/682f0.svg` },
  { name: 'imgVitalSignsIconActive.svg', url: `${prefix}/0466e.svg` },
  { name: 'imgMentalWellbeingIconActive.svg', url: `${prefix}/c2b47.svg` },
  { name: 'imgRiskAssessmentIconActive.svg', url: `${prefix}/ca5eb.svg` },
  { name: 'imgMedicalGuidanceIconActive.svg', url: `${prefix}/c3024.svg` },
  { name: 'imgHealthAnalyticsIconActive.svg', url: `${prefix}/1f341.svg` },
  { name: 'imgReportsIconActive.svg', url: `${prefix}/02e3d.svg` },
  { name: 'imgSettingsIconActive.svg', url: `${prefix}/e5d01.svg` },
  { name: 'imgContinueArrow.svg', url: `${prefix2}/72a05.svg` },
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
  for (const asset of newAssets) {
    console.log(`Downloading ${asset.name}...`);
    await download(asset.name, asset.url);
  }
  console.log('All additional Figma assets downloaded.');
}

run().catch(console.error);

