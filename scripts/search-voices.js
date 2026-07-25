#!/usr/bin/env node
// search-voices.js — searches ElevenLabs' shared Voice Library (a much
// larger pool than your own account's voices) for a given accent/keyword.
// Note: using a Voice Library voice via the API may require a paid plan
// (the same restriction that blocked the default voice originally) — this
// script will tell you plainly if a given voice 402s.
//
// Usage:
//   ELEVENLABS_API_KEY=xxxx node scripts/search-voices.js indian
//   ELEVENLABS_API_KEY=xxxx node scripts/search-voices.js "indian english" --gender=female

const https = require('https');

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Missing ELEVENLABS_API_KEY environment variable. Set it first, same as generate-audio.js.');
  process.exit(1);
}

const args = process.argv.slice(2);
const query = args.filter(a => !a.startsWith('--')).join(' ') || 'indian';
const genderArg = args.find(a => a.startsWith('--gender='));
const gender = genderArg ? genderArg.split('=')[1] : null;

const params = new URLSearchParams({ search: query, page_size: '20' });
if (gender) params.set('gender', gender);

const options = {
  hostname: 'api.elevenlabs.io',
  path: `/v1/shared-voices?${params.toString()}`,
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
    const voices = data.voices || [];
    if (!voices.length) {
      console.log(`No results for "${query}". Try a broader term, e.g. "indian" or "english".`);
      return;
    }
    console.log(`Found ${voices.length} voice(s) in the shared library matching "${query}":\n`);
    voices.forEach(v => {
      console.log(`  ${v.name}  (${v.accent || 'accent unknown'}, ${v.gender || '?'}, ${v.age || '?'})`);
      console.log(`    voice_id: ${v.voice_id}`);
      console.log(`    description: ${v.description || '(none)'}`);
      console.log(`    preview: ${v.preview_url || '(none)'}`);
      console.log('');
    });
    console.log('Try one with:');
    console.log('  node scripts/generate-audio.js --voice=<voice_id> --force cat');
    console.log('(generate just one word first to check quality/access before running the full batch)');
  });
});
req.on('error', e => { console.error(e.message); process.exit(1); });
req.end();
