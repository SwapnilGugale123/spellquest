#!/usr/bin/env node
// generate-audio.js — batch-generate premium neural-voice pronunciation MP3s
// for every word in the app, using ElevenLabs (spec D.4). Run this whenever
// new words are added; existing MP3s are skipped unless --force is passed.
//
// Usage:
//   ELEVENLABS_API_KEY=xxxx node scripts/generate-audio.js
//   node scripts/generate-audio.js --force              (regenerate everything)
//   node scripts/generate-audio.js --voice=<id>          (use a specific voice)
//   node scripts/generate-audio.js --speed=0.7           (0.7-1.2, default 0.75)
//   node scripts/generate-audio.js --voice=<id> --only=cat
//                                                         (preview just one word)
//
// The API key is read from the ELEVENLABS_API_KEY environment variable —
// never hardcode it in this file or pass it on the command line where it
// could end up in shell history.

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Missing ELEVENLABS_API_KEY environment variable.');
  console.error('Set it first, e.g.:');
  console.error('  PowerShell:  $env:ELEVENLABS_API_KEY = "your-key-here"');
  console.error('  Then run:    node scripts/generate-audio.js');
  process.exit(1);
}

const args = process.argv.slice(2);
const onlyArgForForce = args.find(a => a.startsWith('--only='));
const FORCE = args.includes('--force') || !!onlyArgForForce; // previewing one word should always regenerate it
const voiceArg = args.find(a => a.startsWith('--voice='));
// "Alice — Clear, Engaging Educator": a premade voice available on the
// free API tier, and well suited to a child-facing pronunciation app.
// Override with --voice=<voice_id>; run scripts/list-voices.js to see
// what else your account can use.
const VOICE_ID = voiceArg ? voiceArg.split('=')[1] : 'Xb7hH8MSUJpSbSDYk0k2';
const MODEL_ID = 'eleven_multilingual_v2';

const OUT_DIR = path.join(__dirname, '..', 'assets', 'words');

// Keep this in sync with the seed word list in js/app.js (Model.seed()).
const WORDS = [
  'cat', 'dog', 'sun', 'red', 'box', 'egg', 'ball', 'fish', 'milk', 'star', 'rain', 'tree',
  'ring', 'pink', 'gift', 'corn', 'long', 'pond', 'circle', 'fifteen', 'eighteen', 'twenty', 'nose', 'tongue',
  'blue', 'green', 'white', 'thirty', 'oval', 'curd', 'drum', 'girl', 'pune', 'black', 'bulb', 'under',
  'apple', 'river', 'bridge', 'inside', 'outside', 'car', 'van', 'bike', 'cycle', 'bird', 'garden', 'cloud',
];

// 0.7 = slowest ElevenLabs allows, well suited to a young child hearing a
// word for the first time. Override with --speed=<0.7-1.2> if needed.
const speedArg = args.find(a => a.startsWith('--speed='));
const SPEED = speedArg ? parseFloat(speedArg.split('=')[1]) : 0.75;
const onlyArg = args.find(a => a.startsWith('--only='));
const ONLY = onlyArg ? onlyArg.split('=')[1].split(',').map(w => w.trim().toLowerCase()) : null;

function requestTTS(word) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      text: word,
      model_id: MODEL_ID,
      voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true, speed: SPEED },
    });
    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${VOICE_ID}`,
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, res => {
      if (res.statusCode !== 200) {
        let errBody = '';
        res.on('data', c => errBody += c);
        res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${errBody}`)));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const wordList = ONLY ? WORDS.filter(w => ONLY.includes(w)) : WORDS;
  if (ONLY && wordList.length === 0) {
    console.error(`None of --only=${ONLY.join(',')} matched a known word.`);
    process.exit(1);
  }

  let generated = 0, skipped = 0, failed = 0;
  for (const word of wordList) {
    const outPath = path.join(OUT_DIR, `${word}.mp3`);
    if (!FORCE && fs.existsSync(outPath)) {
      console.log(`skip   ${word} (already exists, use --force to regenerate)`);
      skipped++;
      continue;
    }
    try {
      process.stdout.write(`gen    ${word} ... `);
      const bytes = await requestTTS(word);
      fs.writeFileSync(outPath, bytes);
      console.log(`ok (${(bytes.length / 1024).toFixed(1)} KB)`);
      generated++;
      // Be polite to the API — small delay between requests.
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
      failed++;
    }
  }

  console.log('');
  console.log(`Done. Generated ${generated}, skipped ${skipped}, failed ${failed}.`);
  if (failed > 0) process.exitCode = 1;
}

main();
