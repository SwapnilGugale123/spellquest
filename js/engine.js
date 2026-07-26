// engine.js — word selection, spaced repetition, mastery, retry/scoring logic.
// Pure functions operating on a `model` object (see app.js Model.load()).
const Engine = (() => {

  function stat(model, wordId, level) {
    let s = model.word_stats.find(x => x.word_id === wordId && x.level === level);
    if (!s) {
      s = { id: model._uid(), word_id: wordId, level, times_shown: 0, times_correct: 0, times_incorrect: 0, mastered_for_level: 0 };
      model.word_stats.push(s);
    }
    return s;
  }

  // Pool = words not yet mastered (3 correct) at this level.
  function pool(model, unitId, level) {
    return wordsOf(model, unitId).filter(w => stat(model, w.id, level).times_correct < 3);
  }

  function wordsOf(model, unitId) {
    return model.words.filter(w => w.unit_id === unitId).sort((a, b) => a.order_index - b.order_index);
  }

  // weight = base + incorrect*penalty - correct*decay, floored so every word
  // still has a chance to appear (light randomness handled by weighted pick).
  function weight(model, w, level) {
    const s = stat(model, w.id, level);
    return Math.max(0.15, 1 + s.times_incorrect * 2 - s.times_correct * 0.5);
  }

  function weightedPick(model, arr, level) {
    const total = arr.reduce((a, w) => a + weight(model, w, level), 0);
    let r = Math.random() * total;
    for (const w of arr) { r -= weight(model, w, level); if (r <= 0) return w; }
    return arr[arr.length - 1];
  }

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // Build one test: 5-10 words (default from settings), weighted toward
  // words with more incorrect attempts, minimum-exposure respected because
  // mastery itself requires 3 correct attempts (>= 3 exposures).
  //
  // For a small/shrinking pool (e.g. a deliberately small unit, or the last
  // few stragglers of a larger one), the test shrinks to the pool itself
  // instead of padding out to the full words_per_test with repeats — a
  // 4-word unit gets 4-word tests, not 5-word tests that repeat one word.
  // Never shrinks below 3 words (or the whole pool, if under 3) so a test
  // still feels substantial rather than one-word trivial.
  function buildTest(model, unitId, level) {
    const configured = model.settings.words_per_test || 5;
    const candidates = pool(model, unitId, level);
    const N = Math.min(configured, Math.max(3, candidates.length));
    const items = []; const avail = candidates.slice();
    while (items.length < N && avail.length > 0) {
      const w = weightedPick(model, avail, level);
      items.push(w); avail.splice(avail.indexOf(w), 1);
    }
    // Only pad with repeats if the pool itself is smaller than our 3-word
    // floor (e.g. exactly 1-2 words left to master).
    if (items.length < N && candidates.length > 0) {
      while (items.length < N) {
        let w = weightedPick(model, candidates, level);
        if (items.length && items[items.length - 1].id === w.id && candidates.length > 1) continue;
        items.push(w);
      }
    }
    return shuffle(items).map(w => w.id);
  }

  function isLevelComplete(model, unitId, level) {
    const ws = wordsOf(model, unitId);
    return ws.length > 0 && ws.every(w => stat(model, w.id, level).times_correct >= 3);
  }

  function decoys(exclude, count) {
    const ex = new Set(exclude);
    const pool = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(c => !ex.has(c)));
    return pool.slice(0, count);
  }

  // Build the on-screen board for a word at a given level (A.4).
  function buildBoard(model, w, level) {
    const letters = w.text.split('');
    const b = { wordId: w.id, word: w.text, level, letters, attempts: 0, status: 'active',
      slots: null, tray: null, filledCount: 0, blanks: null, nextBlank: 0, options: null, shakeId: null,
      image: level <= 4 };
    if (level === 1 || level === 2 || level === 6) {
      b.slots = letters.map(() => null);
      let tray = letters.slice();
      if (level === 2) tray = tray.concat(decoys(letters, 3));
      if (level === 6) tray = tray.concat(decoys(letters, Math.min(3, Math.max(2, letters.length <= 3 ? 2 : 3))));
      b.tray = shuffle(tray).map(ch => ({ id: model._uid(), ch, used: false }));
    } else {
      let nb = level === 3 ? 1 : Math.min(3, Math.max(2, Math.floor(letters.length / 2)));
      nb = Math.min(nb, letters.length - 1);
      const positions = shuffle(letters.map((_, i) => i)).slice(0, nb).sort((a, b2) => a - b2);
      b.blanks = positions.map(pos => ({ pos, ch: null }));
      const need = [...new Set(positions.map(p => letters[p]))];
      const optCount = level === 3 ? 3 : 5;
      let opts = [...need];
      opts = opts.concat(decoys(letters.concat(opts), optCount - opts.length));
      opts = opts.slice(0, optCount);
      b.options = shuffle(opts).map(ch => ({ id: model._uid(), ch }));
    }
    return b;
  }

  // Scoring tiers (A.5).
  function scoreTier(scoreFraction) {
    if (scoreFraction >= 0.8) return 'hi';
    if (scoreFraction >= 0.6) return 'mid';
    return 'low';
  }

  return { stat, pool, wordsOf, weight, weightedPick, shuffle, buildTest, isLevelComplete, decoys, buildBoard, scoreTier };
})();
