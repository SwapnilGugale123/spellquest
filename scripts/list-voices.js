#!/usr/bin/env node
// list-voices.js — lists the ElevenLabs voices your API key can actually
// use (read-only). Run this if generate-audio.js fails with a 402/403 on
// the default voice, to find one your plan is allowed to call.
//
// Usage: ELEVENLABS_API_KEY=xxxx node scripts/list-voices.js

const https = require('https');

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Missing ELEVENLABS_API_KEY environment variable. Set it first, same as generate-audio.js.');
  process.exit(1);
}

const options = {
  hostname: 'api.elevenlabs.io',
  path: '/v1/voices',
  method: 'GET',
  headers: { 'xi-api-key': API_KEY },
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`HTTP ${res.statusCode}: ${body}`);
      process.exit(1);
    }
    const data = JSON.parse(body);
    console.log(`Found ${data.voices.length} voice(s) available to your account:\n`);
    data.voices.forEach(v => {
      console.log(`  ${v.name}`);
      console.log(`    voice_id: ${v.voice_id}`);
      console.log(`    category: ${v.category}`);
      console.log('');
    });
    console.log('Use one of these voice_id values with:');
    console.log('  node scripts/generate-audio.js --voice=<voice_id>');
  });
});
req.on('error', e => { console.error(e.message); process.exit(1); });
req.end();
