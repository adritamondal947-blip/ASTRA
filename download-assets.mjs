import fs from 'fs';
import path from 'path';
import https from 'https';

const prefix = 'https://www.figma.com/api/mcp/asset/7a8105b6-7690-4103-84e8-06f74bef2f17';
const assets = {
  'imgRadioOutline.svg': '3fe0e.svg',
  'imgSelectedRadioMark.svg': 'da821.svg',
  'imgEditableEnvironmentImage.png': 'de30f.png',
  'imgEnvironmentIcon.svg': '093f4.svg',
  'imgSelectionCheckmark.svg': '87f5c.svg',
  'imgEnvironmentIcon1.svg': '017b3.svg',
  'imgGroup.svg': '7f473.svg',
  'imgGroup1.svg': '8e237.svg',
  'imgVoiceAssistanceIcon.svg': '7c04c.svg',
  'imgKeyboardHelpIcon.svg': '73be7.svg',
  'imgAstraMissionEnvironmentDesktop.png': '24616.png',
  'imgDrElenaRamirezPortrait.png': '10fdd.png',
  'imgAstraOrbitalMark.svg': 'ae7cb.svg',
  'imgMissionEnvironmentIcon.svg': '32e2a.svg',
  'imgHomeIcon.svg': 'cefd1.svg',
  'imgBodyAssessmentIcon.svg': 'fb5c5.svg',
  'imgLockedUntilSetupIsComplete.svg': '1df07.svg',
  'imgVitalSignsIcon.svg': 'b473e.svg',
  'imgMentalWellbeingIcon.svg': '2711a.svg',
  'imgHealthAnalyticsIcon.svg': '75c21.svg',
  'imgRiskAssessmentIcon.svg': 'c8fb5.svg',
  'imgMedicalGuidanceIcon.svg': '23f04.svg',
  'imgReportsIcon.svg': '63188.svg',
  'imgSettingsIcon.svg': '28178.svg',
  'imgSettingsIcon1.svg': '02652.svg',
  'imgClockIcon.svg': '66f58.svg',
  'imgSignalIcon.svg': '5d627.svg',
  'imgAstraOrbitalMark1.svg': '66dd8.svg',
  'imgLockedConfirmation.svg': '42aa7.svg'
};

const targetDir = path.resolve('src/assets/figma');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function download(filename, remoteFile) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(targetDir, filename));
    https.get(`${prefix}/${remoteFile}`, (response) => {
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
  for (const [filename, remoteFile] of Object.entries(assets)) {
    console.log(`Downloading ${filename}...`);
    await download(filename, remoteFile);
  }
  console.log('All Figma assets downloaded successfully.');
}

run().catch(console.error);

