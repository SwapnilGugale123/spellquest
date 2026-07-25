// audio.js — pronunciation playback + UI tones.
// Prefers a real MP3 at assets/words/<word>.mp3 if present (drop-in premium
// TTS later, per spec D.4); falls back to the best-sounding system voice
// available via speechSynthesis so it still works fully offline today.
const Audio2 = (() => {
  let ac = null;
  let bestVoice = null;
  let voicesReady = false;
  const audioCache = {}; // word -> HTMLAudioElement | false (checked, missing)

  const PREFERRED_VOICE_NAMES = [
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Ana Online (Natural) - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Microsoft Guy Online (Natural) - English (United States)',
    'Google US English',
    'Samantha', // macOS
    'Microsoft Zira Desktop - English (United States)',
  ];

  function pickBestVoice() {
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (!voices.length) return null;
    for (const name of PREFERRED_VOICE_NAMES) {
      const v = voices.find(v => v.name === name);
      if (v) return v;
    }
    // Prefer any "Online"/"Natural" neural voice in en-US/en-GB before plain defaults.
    const neural = voices.find(v => /en-(US|GB)/i.test(v.lang) && /online|natural|neural/i.test(v.name));
    if (neural) return neural;
    const enUS = voices.find(v => v.lang === 'en-US' && v.localService === false);
    if (enUS) return enUS;
    return voices.find(v => /^en/i.test(v.lang)) || voices[0];
  }

  function ensureVoices() {
    if (!window.speechSynthesis) return;
    bestVoice = pickBestVoice();
    if (bestVoice) voicesReady = true;
    if (!voicesReady) {
      window.speechSynthesis.onvoiceschanged = () => {
        bestVoice = pickBestVoice();
        voicesReady = !!bestVoice;
      };
    }
  }
  ensureVoices();

  function tryFileAudio(word) {
    if (audioCache[word] !== undefined) return Promise.resolve(audioCache[word]);
    return new Promise(resolve => {
      const a = new Audio('assets/words/' + word.toLowerCase() + '.mp3');
      let settled = false;
      a.addEventListener('canplaythrough', () => { if (!settled) { settled = true; audioCache[word] = a; resolve(a); } }, { once: true });
      a.addEventListener('error', () => { if (!settled) { settled = true; audioCache[word] = false; resolve(false); } }, { once: true });
      a.load();
    });
  }

  // Resolves once the pronunciation has actually finished playing (not just
  // started) so callers can reliably sequence something after it — e.g. a
  // pause before advancing to the next word.
  async function speak(word) {
    const fileAudio = await tryFileAudio(word);
    if (fileAudio) {
      try {
        fileAudio.currentTime = 0;
        await fileAudio.play();
        await new Promise(resolve => {
          fileAudio.addEventListener('ended', resolve, { once: true });
          fileAudio.addEventListener('error', resolve, { once: true });
        });
        return;
      } catch (e) { /* fall through to TTS */ }
    }
    await new Promise(resolve => {
      try {
        const u = new SpeechSynthesisUtterance(word);
        u.rate = 0.85; u.pitch = 1.03; u.lang = 'en-US';
        if (bestVoice) u.voice = bestVoice;
        u.onend = resolve; u.onerror = resolve;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch (e) { resolve(); /* no-op: audio isn't essential to progress */ }
    });
  }

  function getAc() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    return ac;
  }

  // Short synthesized UI tones (tap/correct/wrong/win) — no files needed.
  function tone(kind, muted) {
    if (muted) return;
    const ctx = getAc(); if (!ctx) return;
    const seq = {
      pop: [[660, 0.06]],
      yes: [[660, 0.08], [880, 0.1]],
      nope: [[300, 0.14]],
      win: [[523, 0.1], [659, 0.1], [784, 0.14], [1046, 0.2]],
    }[kind] || [[660, 0.06]];
    let t = ctx.currentTime;
    seq.forEach(([f, d]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = kind === 'nope' ? 'sawtooth' : 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + d);
      t += d * 0.9;
    });
  }

  return { speak, tone };
})();
