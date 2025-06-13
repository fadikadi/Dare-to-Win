import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sounds = {
    success: 'https://raw.githubusercontent.com/fadikadi/common-assets/main/sounds/success.mp3',
    incorrect: 'https://raw.githubusercontent.com/fadikadi/common-assets/main/sounds/incorrect.mp3'
};

const downloadSound = (url, filename) => {
    const filepath = path.join(__dirname, '../../public/assets/sounds', filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${filename}`);
        });
    }).on('error', (err) => {
        fs.unlink(filepath, () => {});
        console.error(`Error downloading ${filename}:`, err.message);
    });
};

// Create sounds directory if it doesn't exist
const soundsDir = path.join(__dirname, '../../public/assets/sounds');
if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
}

// Download sounds
Object.entries(sounds).forEach(([name, url]) => {
    downloadSound(url, `${name}.mp3`);
});
