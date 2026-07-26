// engine.js — word selection, spaced repetition, mastery, retry/scoring logic.
// Pure functions operating on a `model` object (see app.js Model.load()).
//
// Word repository model: `model.words` holds the repository (one row per
// distinct word: text/image/audio, no unit). `model.unit_words` is the
// join/placement table (one row per word-in-a-unit; the same word can be
// placed in several units via several rows). Everywhere in this file that
// deals with "a word in a unit" operates on a *placement* — an object
// shaped like { id: <unit_word_id>, word_id, unit_id, text, image_path,
// audio_path, image_data, audio_data, order_index } — so callers (game
// screen, stats, board-building) keep using `.id` as the identity that
// mastery/exposure is tracked against, same as before, except it now means
// "this placement" rather than "this word" — which is exactly what makes
// the same word in two units track separately.
const Engine = (() => {

  function stat(model, unitWordId, level) {
    let s = model.word_stats.find(x => x.unit_word_id === unitWordId && x.level === level);
    if (!s) {
      s = { id: model._uid(), unit_word_id: unitWordId, level, times_shown: 0, times_correct: 0, times_incorrect: 0, mastered_for_level: 0 };
      model.word_stats.push(s);
    }
    return s;
  }

  function wordById(model, wordId) {
    return model.words.find(w => w.id === wordId);
  }

  // All placements (word-in-unit rows) for a unit, joined with the
  // repository word's text/image/audio, in placement order.
  function wordsOf(model, unitId) {
    return model.unit_words
      .filter(uw => uw.unit_id === unitId)
      .sort((a, b) => a.order_index - b.order_index)
      .map(uw => toPlacement(model, uw))
      .filter(Boolean); // defensive: skip a placement whose word row is missing
  }

  function toPlacement(model, uw) {
    const w = wordById(model, uw.word_id);
    if (!w) return null;
    return {
      id: uw.id, word_id: uw.word_id, unit_id: uw.unit_id, order_index: uw.order_index,
      text: w.text, image_path: w.image_path, audio_path: w.audio_path,
      image_data: w.image_data, audio_data: w.audio_data,
    };
  }

  // Pool = placements not yet mastered (3 correct) at this level.
  function pool(model, unitId, level) {
    return wordsOf(model, unitId).filter(p => stat(model, p.id, level).times_correct < 3);
  }

  // weight = base + incorrect*penalty - correct*decay, floored so every word
  // still has a chance to appear (light randomness handled by weighted pick).
  function weight(model, placement, level) {
    const s = stat(model, placement.id, level);
    return Math.max(0.15, 1 + s.times_incorrect * 2 - s.times_correct * 0.5);
  }

  function weightedPick(model, arr, level) {
    const total = arr.reduce((a, p) => a + weight(model, p, level), 0);
    let r = Math.random() * total;
    for (const p of arr) { r -= weight(model, p, level); if (r <= 0) return p; }
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
  //
  // Returns an array of placement ids (unit_word_id), which is what the
  // rest of the game loop (session.words, board.wordId, etc.) treats as
  // "the word" for this test.
  function buildTest(model, unitId, level) {
    const configured = model.settings.words_per_test || 5;
    const candidates = pool(model, unitId, level);
    const N = Math.min(configured, Math.max(3, candidates.length));
    const items = []; const avail = candidates.slice();
    while (items.length < N && avail.length > 0) {
      const p = weightedPick(model, avail, level);
      items.push(p); avail.splice(avail.indexOf(p), 1);
    }
    // Only pad with repeats if the pool itself is smaller than our 3-word
    // floor (e.g. exactly 1-2 words left to master).
    if (items.length < N && candidates.length > 0) {
      while (items.length < N) {
        let p = weightedPick(model, candidates, level);
        if (items.length && items[items.length - 1].id === p.id && candidates.length > 1) continue;
        items.push(p);
      }
    }
    return shuffle(items).map(p => p.id);
  }

  function isLevelComplete(model, unitId, level) {
    const ps = wordsOf(model, unitId);
    return ps.length > 0 && ps.every(p => stat(model, p.id, level).times_correct >= 3);
  }

  function decoys(exclude, count) {
    const ex = new Set(exclude);
    const pool = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(c => !ex.has(c)));
    return pool.slice(0, count);
  }

  // Build the on-screen board for a placement at a given level (A.4).
  // `placement` is one of the objects returned by wordsOf()/placementById().
  function buildBoard(model, placement, level) {
    const letters = placement.text.split('');
    const b = { wordId: placement.id, word: placement.text, level, letters, attempts: 0, status: 'active',
      slots: null, tray: null, filledCount: 0, blanks: null, nextBlank: 0, options: null, shakeId: null,
      image: level <= 4, imageData: placement.image_data || null, audioData: placement.audio_data || null };
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

  return { stat, wordById, toPlacement, pool, wordsOf, weight, weightedPick, shuffle, buildTest, isLevelComplete, decoys, buildBoard, scoreTier };
})();
