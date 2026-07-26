// app.js — game loop, screens, routing. Vanilla JS, no build step (B.2).
(() => {
  'use strict';

  // How long a passed test/level celebration lingers before auto-advancing.
  const AUTO_ADVANCE_DELAY = 2200;

  /* ---------- tiny DOM builder ---------- */
  function E(tag, attrs, children) {
    const e = document.createElement(tag);
    attrs = attrs || {};
    for (const k in attrs) {
      const v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'html') e.innerHTML = v;
      else e.setAttribute(k, v);
    }
    (children || []).forEach(c => {
      if (c === null || c === undefined || c === false) return;
      e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(c) : c);
    });
    return e;
  }

  /* ---------- Model: data + persistence over db.js ---------- */
  const Model = {
    data: null,
    _idCounter: 1000,
    _uid() { return ++this._idCounter; },
    // Engine.js/Rewards.js take a plain `model` object and call model._uid()
    // to mint ids without depending on the Model singleton; wire it through.
    _wireUid() { Object.defineProperty(this.data, '_uid', { value: () => this._uid(), enumerable: false, configurable: true }); },

    async load() {
      await DB.open();
      let units = DB.all('SELECT * FROM units');
      if (units.length === 0) { this.seed(); await this.persist(); return; }
      this.data = {
        units: DB.all('SELECT * FROM units'),
        words: DB.all('SELECT * FROM words'),
        unit_words: DB.all('SELECT * FROM unit_words'),
        vehicles: DB.all('SELECT * FROM vehicles'),
        level_progress: DB.all('SELECT * FROM level_progress'),
        word_stats: DB.all('SELECT * FROM word_stats'),
        test_log: DB.all('SELECT * FROM test_log'),
        rewards: DB.all('SELECT * FROM rewards'),
        settings: {},
      };
      this._wireUid();
      DB.all('SELECT * FROM settings').forEach(r => {
        let v = r.value;
        if (r.key === 'resume') { try { v = JSON.parse(v); } catch (e) { v = null; } }
        else if (v !== '' && !isNaN(v)) v = +v;
        this.data.settings[r.key] = v;
      });
      const maxId = Math.max(1000, ...['units', 'words', 'unit_words', 'vehicles', 'level_progress', 'word_stats', 'test_log', 'rewards']
        .flatMap(t => this.data[t].map(r => r.id || 0)));
      this._idCounter = maxId;
    },

    seed() {
      // D.5: child already knows ~30-40 words (~2-3 units). Seed Units 1-2 as
      // pre-completed/optional, Unit 3 as the current unit (parent will refine).
      this.data = {
        settings: { current_unit: 3, words_per_test: 5, muted: 0, resume: null },
        units: [
          { id: 1, name: 'Unit 1', order_index: 1, vehicle_id: 1, is_unlocked: 1 },
          { id: 2, name: 'Unit 2', order_index: 2, vehicle_id: 2, is_unlocked: 1 },
          { id: 3, name: 'Unit 3', order_index: 3, vehicle_id: 3, is_unlocked: 1 },
          { id: 4, name: 'Unit 4', order_index: 4, vehicle_id: 4, is_unlocked: 0 },
        ],
        vehicles: [1, 2, 3, 4].map(i => Rewards.vehicleForUnit(i, i)),
        words: [], unit_words: [],
        level_progress: [], word_stats: [], test_log: [],
        rewards: [
          { id: 1, unit_id: 1, parts_unlocked: 6, vehicle_complete: 1 },
          { id: 2, unit_id: 2, parts_unlocked: 6, vehicle_complete: 1 },
          { id: 3, unit_id: 3, parts_unlocked: 0, vehicle_complete: 0 },
          { id: 4, unit_id: 4, parts_unlocked: 0, vehicle_complete: 0 },
        ],
      };
      this._wireUid();
      const seedUnit = (unitId, list) => list.forEach(t => this.addWordToUnit(t, unitId));
      seedUnit(1, ['Cat', 'Dog', 'Sun', 'Red', 'Box', 'Egg', 'Ball', 'Fish', 'Milk', 'Star', 'Rain', 'Tree']);
      seedUnit(2, ['Ring', 'Pink', 'Gift', 'Corn', 'Long', 'Pond', 'Circle', 'Fifteen', 'Eighteen', 'Twenty', 'Nose', 'Tongue']);
      seedUnit(3, ['Blue', 'Green', 'White', 'Thirty', 'Oval', 'Curd', 'Drum', 'Girl', 'Pune', 'Black', 'Bulb', 'Under']);
      seedUnit(4, ['Apple', 'River', 'Bridge', 'Inside', 'Outside', 'Car', 'Van', 'Bike', 'Cycle', 'Bird', 'Garden', 'Cloud']);
      seedContentLibrary(this);
      [1, 2].forEach(u => { for (let l = 1; l <= 6; l++) this.data.level_progress.push({ id: this._uid(), unit_id: u, level: l, status: 'complete', tests_completed: 5 }); });
    },

    async persist() {
      const m = this.data;
      DB.run('DELETE FROM units'); DB.run('DELETE FROM words'); DB.run('DELETE FROM unit_words'); DB.run('DELETE FROM vehicles');
      DB.run('DELETE FROM level_progress'); DB.run('DELETE FROM word_stats'); DB.run('DELETE FROM test_log');
      DB.run('DELETE FROM rewards'); DB.run('DELETE FROM settings');
      m.units.forEach(u => DB.run('INSERT INTO units VALUES(?,?,?,?,?)', [u.id, u.name, u.order_index, u.vehicle_id, u.is_unlocked]));
      m.words.forEach(w => DB.run('INSERT INTO words VALUES(?,?,?,?,?,?)', [w.id, w.text, w.image_path, w.audio_path, w.image_data || null, w.audio_data || null]));
      m.unit_words.forEach(uw => DB.run('INSERT INTO unit_words VALUES(?,?,?,?)', [uw.id, uw.unit_id, uw.word_id, uw.order_index]));
      m.vehicles.forEach(v => DB.run('INSERT INTO vehicles VALUES(?,?,?,?,?,?)', [v.id, v.name, v.type, v.part_count, 'assets/vehicles/' + v.type, v.color]));
      m.level_progress.forEach(l => DB.run('INSERT INTO level_progress VALUES(?,?,?,?,?)', [l.id, l.unit_id, l.level, l.status, l.tests_completed]));
      m.word_stats.forEach(s => DB.run('INSERT INTO word_stats VALUES(?,?,?,?,?,?,?)', [s.id, s.unit_word_id, s.level, s.times_shown, s.times_correct, s.times_incorrect, s.mastered_for_level]));
      m.test_log.forEach(t => DB.run('INSERT INTO test_log VALUES(?,?,?,?,?,?)', [t.id, t.unit_id, t.level, t.score_pct, t.words_json, t.timestamp]));
      m.rewards.forEach(r => DB.run('INSERT INTO rewards VALUES(?,?,?,?)', [r.id, r.unit_id, r.parts_unlocked, r.vehicle_complete]));
      Object.entries(m.settings).forEach(([k, v]) => DB.run('INSERT INTO settings VALUES(?,?)', [k, typeof v === 'object' ? JSON.stringify(v) : String(v)]));
      const result = await DB.saveToDisk();
      return result;
    },

    unit(id) { return this.data.units.find(u => u.id === id); },
    // A "placement" is a word-in-a-unit row joined with its repository
    // text/image/audio — see engine.js header comment. `.id` on a placement
    // is the unit_word_id, which is what stats/board-building key against.
    wordsOf(unitId) { return Engine.wordsOf(this.data, unitId); },
    placementById(unitWordId) {
      const uw = this.data.unit_words.find(x => x.id === unitWordId);
      return uw ? Engine.toPlacement(this.data, uw) : null;
    },
    repoWordById(wordId) { return Engine.wordById(this.data, wordId); },
    vehicleOf(unitId) { const u = this.unit(unitId); return this.data.vehicles.find(v => v.id === u.vehicle_id); },
    reward(unitId) { return Rewards.reward(this.data, unitId); },
    lp(unitId, level) {
      let r = this.data.level_progress.find(x => x.unit_id === unitId && x.level === level);
      if (!r) { r = { id: this._uid(), unit_id: unitId, level, status: 'locked', tests_completed: 0 }; this.data.level_progress.push(r); }
      return r;
    },
    stat(unitWordId, level) { return Engine.stat(this.data, unitWordId, level); },

    levelPlayable(unitId, level) { if (level === 1) return true; return this.lp(unitId, level - 1).status === 'complete'; },
    levelStatus(unitId, level) {
      const s = this.lp(unitId, level).status;
      if (s === 'complete') return 'complete';
      if (this.levelPlayable(unitId, level)) return this.lp(unitId, level).tests_completed > 0 ? 'in_progress' : 'current';
      return 'locked';
    },
    unitStatus(unitId) {
      const done = [1, 2, 3, 4, 5, 6].every(l => this.lp(unitId, l).status === 'complete');
      if (done) return 'complete';
      if (!this.unit(unitId).is_unlocked) return 'locked';
      return 'current';
    },

    orderedUnits() { return [...this.data.units].sort((a, b) => a.order_index - b.order_index); },

    // Renumbers order_index to a clean 1..N sequence matching each unit's
    // current relative order — call after any insert/reorder so the
    // "unlock unit at order_index+1" logic in completeLevel() never sees
    // gaps or duplicate positions.
    renumberUnits() {
      this.orderedUnits().forEach((u, i) => { u.order_index = i + 1; });
    },

    // Inserts a brand-new empty unit immediately after `afterUnitId` (or at
    // the very start if null), shifting every later unit's order_index down
    // the list. Returns the new unit.
    insertUnitAfter(afterUnitId, name) {
      const ordered = this.orderedUnits();
      const afterIdx = afterUnitId ? ordered.findIndex(u => u.id === afterUnitId) : -1;
      const id = this._uid();
      const vehicleCatalogSlot = this.data.units.length + 1;
      this.data.vehicles.push(Rewards.vehicleForUnit(id, vehicleCatalogSlot));
      const newUnit = { id, name, order_index: 0, vehicle_id: id, is_unlocked: 0 };
      ordered.splice(afterIdx + 1, 0, newUnit);
      this.data.units.push(newUnit);
      ordered.forEach((u, i) => { u.order_index = i + 1; });
      this.data.rewards.push({ id: this._uid(), unit_id: id, parts_unlocked: 0, vehicle_complete: 0 });
      return newUnit;
    },

    renameUnit(unitId, name) {
      name = (name || '').trim(); if (!name) return;
      this.unit(unitId).name = name;
    },

    // Swaps this unit with its immediate neighbor in play order. Does not
    // touch is_unlocked/progress — those stay keyed to unit_id, so a unit's
    // completion status travels with it, only its position in the map moves.
    reorderUnit(unitId, direction) {
      const ordered = this.orderedUnits();
      const idx = ordered.findIndex(u => u.id === unitId);
      const swapIdx = idx + direction;
      if (swapIdx < 0 || swapIdx >= ordered.length) return;
      const a = ordered[idx], b = ordered[swapIdx];
      const tmp = a.order_index; a.order_index = b.order_index; b.order_index = tmp;
    },

    /* ----- word repository ----- */

    allWords() { return [...this.data.words].sort((a, b) => a.text.localeCompare(b.text)); },

    // Every unit a repository word currently appears in, as {unit, placement} pairs.
    placementsOfWord(wordId) {
      return this.data.unit_words.filter(uw => uw.word_id === wordId)
        .map(uw => ({ unit: this.unit(uw.unit_id), placement: Engine.toPlacement(this.data, uw) }))
        .filter(x => x.unit);
    },

    findWordByText(text) {
      text = (text || '').trim().toLowerCase();
      return this.data.words.find(w => w.text === text);
    },

    // Adds a word to the repository if it doesn't already exist by text
    // (case-insensitive) and returns the (possibly pre-existing) row —
    // callers should use this rather than pushing to data.words directly,
    // so the same word typed twice reuses one repository entry.
    findOrCreateWord(text) {
      text = (text || '').trim().toLowerCase(); if (!text) return null;
      const existing = this.findWordByText(text);
      if (existing) return existing;
      const w = { id: this._uid(), text, image_path: 'assets/words/' + text + '.png',
        audio_path: 'assets/words/' + text + '.mp3', image_data: null, audio_data: null };
      this.data.words.push(w);
      return w;
    },

    // Placing the same word_id into the same unit twice is a no-op (returns
    // the existing placement) rather than creating a duplicate row.
    assignWordToUnit(wordId, unitId) {
      const already = this.data.unit_words.find(uw => uw.word_id === wordId && uw.unit_id === unitId);
      if (already) return already;
      const order_index = this.data.unit_words.filter(uw => uw.unit_id === unitId).length;
      const uw = { id: this._uid(), unit_id: unitId, word_id: wordId, order_index };
      this.data.unit_words.push(uw);
      return uw;
    },

    // Convenience: repository-add-if-needed + assign to a unit in one call
    // (used by seeding and the simple "Add word" box in Admin).
    addWordToUnit(text, unitId) {
      const w = this.findOrCreateWord(text);
      if (!w) return null;
      return this.assignWordToUnit(w.id, unitId);
    },

    // Removes one placement (this unit only) and its stats. The repository
    // word itself, and any of its OTHER placements, are untouched.
    unassignFromUnit(unitWordId) {
      this.data.unit_words = this.data.unit_words.filter(uw => uw.id !== unitWordId);
      this.data.word_stats = this.data.word_stats.filter(s => s.unit_word_id !== unitWordId);
    },

    // Deletes a repository word entirely, including every placement of it
    // across every unit and all their stats. Use unassignFromUnit for "just
    // remove it from this one unit".
    deleteWordEverywhere(wordId) {
      const placementIds = this.data.unit_words.filter(uw => uw.word_id === wordId).map(uw => uw.id);
      this.data.unit_words = this.data.unit_words.filter(uw => uw.word_id !== wordId);
      this.data.word_stats = this.data.word_stats.filter(s => !placementIds.includes(s.unit_word_id));
      this.data.words = this.data.words.filter(w => w.id !== wordId);
    },

    setWordImageOverride(wordId, dataUrl) {
      const w = this.repoWordById(wordId); if (!w) return;
      w.image_data = dataUrl;
    },
    clearWordImageOverride(wordId) {
      const w = this.repoWordById(wordId); if (!w) return;
      w.image_data = null;
    },

    // Moves a placement to a different unit (changes which unit this
    // specific placement belongs to; the word stays exactly as placed in
    // any other unit it's also in, if any). Stats for this placement carry
    // over unchanged since they're keyed by unit_word_id, not by the unit.
    movePlacementToUnit(unitWordId, targetUnitId) {
      const uw = this.data.unit_words.find(x => x.id === unitWordId); if (!uw) return;
      uw.unit_id = targetUnitId;
      uw.order_index = this.data.unit_words.filter(x => x.unit_id === targetUnitId).length - 1;
    },

    // Splits a unit's words evenly across `count` new units inserted
    // immediately after it (so a 12-word unit becomes e.g. three 4-word
    // units in sequence). The original unit keeps its first share and name;
    // new units are named "<original name> (2)", "(3)", etc.
    splitUnit(unitId, count) {
      const placements = this.wordsOf(unitId);
      if (count < 2 || placements.length < count) return [];
      const perGroup = Math.ceil(placements.length / count);
      const original = this.unit(unitId);
      const created = [];
      let afterId = unitId;
      for (let g = 1; g < count; g++) {
        const nu = this.insertUnitAfter(afterId, `${original.name} (${g + 1})`);
        created.push(nu);
        afterId = nu.id;
      }
      // Walk groups from the LAST group backward so each slice's placements
      // are moved out of the original before the next slice is computed —
      // otherwise wordsOf(unitId) shrinks out from under the indices.
      for (let g = count - 1; g >= 1; g--) {
        const slice = placements.slice(g * perGroup, (g + 1) * perGroup);
        slice.forEach(p => this.movePlacementToUnit(p.id, created[g - 1].id));
      }
      return created;
    },
  };

  /* ---------- App state + controller ---------- */
  const App = {
    state: { ready: false, screen: 'loading', unitId: null, level: null, session: null, board: null,
      testResult: null, muted: false, confetti: 0, encourage: null, lastSaved: null,
      adminUnitId: null, busy: '', reveal: false, resumeAvail: null, paused: false, saveMode: 'memory', repoSearch: '' },

    async init() {
      await Model.load();
      const resume = Model.data.settings.resume;
      this.setState({ ready: true, screen: 'map', muted: !!Model.data.settings.muted, resumeAvail: resume || null });
    },

    setState(patch) { Object.assign(this.state, patch); render(); },

    async persist() {
      const r = await Model.persist();
      this.state.saveMode = r.mode;
      this.state.lastSaved = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      render();
    },

    /* ----- flow ----- */
    openUnit(unitId) { if (Model.unitStatus(unitId) === 'locked') return; this.setState({ unitId, screen: 'levelpath' }); },

    startLevel(unitId, level) {
      if (!Model.levelPlayable(unitId, level)) return;
      const lpr = Model.lp(unitId, level); if (lpr.status !== 'complete') lpr.status = 'in_progress';
      this.persist();
      this.setState({ unitId, level, session: null, testResult: null });
      this.nextTest();
    },

    nextTest() {
      const { unitId, level } = this.state;
      if (Engine.isLevelComplete(Model.data, unitId, level)) { this.completeLevel(); return; }
      const ids = Engine.buildTest(Model.data, unitId, level);
      const session = { words: ids, idx: 0, results: {}, kind: 'normal' };
      this.setState({ session, testResult: null, screen: 'game' });
      this.loadWord();
    },

    startSession(ids, kind) {
      const session = { words: ids, idx: 0, results: {}, kind };
      this.setState({ session, testResult: null, screen: 'game' });
      this.loadWord();
    },

    loadWord() {
      const { session, level, unitId } = this.state;
      const p = Model.placementById(session.words[session.idx]);
      const board = Engine.buildBoard(Model.data, p, level);
      Model.data.settings.resume = { unitId, level, words: session.words, idx: session.idx, kind: session.kind };
      this.persist();
      this.setState({ board, reveal: false });
      Audio2.speak(p.text, p.audio_data);
    },

    resume() {
      const r = this.state.resumeAvail || Model.data.settings.resume;
      if (!r) return;
      this.setState({ unitId: r.unitId, level: r.level, session: { words: r.words, idx: r.idx, results: {}, kind: r.kind || 'normal' }, screen: 'game', resumeAvail: null });
      this.loadWord();
    },

    cloneBoard() { return JSON.parse(JSON.stringify(this.state.board)); },

    tapTile(item) {
      const b = this.cloneBoard(); if (b.status !== 'active') return;
      const expected = b.letters[b.filledCount];
      const t = b.tray.find(x => x.id === item.id);
      if (t && !t.used && t.ch === expected) {
        t.used = true; b.slots[b.filledCount] = t.ch; b.filledCount++; Audio2.tone('pop', this.state.muted);
        if (b.filledCount >= b.letters.length) { this.setState({ board: b }); this.resolve(true); return; }
        this.setState({ board: b });
      } else { this.wrong(b, item.id); }
    },

    tapOption(item) {
      const b = this.cloneBoard(); if (b.status !== 'active') return;
      const blank = b.blanks[b.nextBlank]; if (!blank) return;
      const expected = b.letters[blank.pos];
      if (item.ch === expected) {
        blank.ch = item.ch; b.nextBlank++; Audio2.tone('pop', this.state.muted);
        if (b.nextBlank >= b.blanks.length) { this.setState({ board: b }); this.resolve(true); return; }
        this.setState({ board: b });
      } else { this.wrong(b, item.id); }
    },

    wrong(b, shakeId) {
      b.attempts++; b.shakeId = shakeId; Audio2.tone('nope', this.state.muted);
      if (b.attempts >= 3) {
        if (b.slots) { b.letters.forEach((ch, i) => { b.slots[i] = ch; }); b.filledCount = b.letters.length; if (b.tray) b.tray.forEach(t => t.used = true); }
        if (b.blanks) { b.blanks.forEach(bl => bl.ch = b.letters[bl.pos]); b.nextBlank = b.blanks.length; }
        b.status = 'revealed';
        this.setState({ board: b, reveal: true });
        this.resolve(false);
      } else {
        this.setState({ board: b });
        setTimeout(() => { const nb = this.cloneBoard(); if (nb) { nb.shakeId = null; this.setState({ board: nb }); } }, 360);
      }
    },

    async resolve(correct) {
      const { board, level, session } = this.state;
      if (board.status === 'correct' || board.status === 'done') return;
      const b = this.cloneBoard(); b.status = correct ? 'correct' : 'done';
      const st = Model.stat(b.wordId, level); st.times_shown++;
      if (correct) { st.times_correct++; if (st.times_correct >= 3) st.mastered_for_level = 1; Audio2.tone('yes', this.state.muted); }
      else { st.times_incorrect++; }
      session.results[session.idx] = correct;
      const enc = correct && Math.random() < 0.5 ? pick(['Nice!', 'Yes!', 'Good!', 'Great!', 'Woohoo!']) : null;
      this.persist();
      this.setState({ board: b, encourage: enc });
      if (correct) this.miniConfetti();
      if (correct) {
        // Hear the word once more while it's still on screen, then a short
        // beat, then move on — reinforces the spelling-to-sound link.
        await Audio2.speak(b.word, b.audioData);
        setTimeout(() => { this.setState({ encourage: null }); this.advance(); }, 500);
      } else {
        setTimeout(() => { this.setState({ encourage: null }); this.advance(); }, 1500);
      }
    },

    advance() {
      const s = { ...this.state.session }; s.idx++;
      this.setState({ session: s });
      if (s.idx >= s.words.length) this.finishTest(); else this.loadWord();
    },

    finishTest() {
      const { session, unitId, level } = this.state;
      const total = session.words.length;
      let correct = 0; const missed = [];
      for (let i = 0; i < total; i++) { if (session.results[i]) correct++; else missed.push(i); }
      const score = total ? correct / total : 0;
      Model.data.test_log.push({
        id: Model._uid(), unit_id: unitId, level, score_pct: +(score * 100).toFixed(0),
        words_json: JSON.stringify(session.words.map((wid, i) => ({ word: Model.placementById(wid).text, correct: !!session.results[i] }))),
        timestamp: new Date().toISOString(),
      });
      Model.lp(unitId, level).tests_completed++;
      const tier = Engine.scoreTier(score);
      Model.data.settings.resume = null;
      this.persist();
      this.setState({ testResult: { score, correct, total, missed, tier }, screen: 'testcomplete' });
      if (tier !== 'low') { this.bigConfetti(); Audio2.tone('win', this.state.muted); }
      // Passed (80-100%): no tap needed, move on to the next test by itself
      // after a moment to enjoy the celebration. 60-79%/below-60% still need
      // a tap since they're a real choice (retry tricky words vs continue,
      // or restart the whole test) — see A.5.
      if (tier === 'hi') {
        setTimeout(() => { if (this.state.screen === 'testcomplete') this.testContinue(); }, AUTO_ADVANCE_DELAY);
      }
    },

    testContinue() { this.setState({ testResult: null }); this.nextTest(); },
    retryMissed() { const { session, testResult } = this.state; const ids = testResult.missed.map(i => session.words[i]); this.startSession(ids, 'retry'); },
    retryWhole() { this.setState({ testResult: null }); this.nextTest(); },

    completeLevel() {
      const { unitId, level } = this.state;
      Model.lp(unitId, level).status = 'complete';
      Rewards.unlockPart(Model.data, unitId, level);
      if (level < 6) { const nx = Model.lp(unitId, level + 1); if (nx.status === 'locked') nx.status = 'current'; }
      const unitDone = [1, 2, 3, 4, 5, 6].every(l => Model.lp(unitId, l).status === 'complete');
      if (unitDone) {
        Rewards.completeVehicle(Model.data, unitId);
        const nu = Model.data.units.find(u => u.order_index === Model.unit(unitId).order_index + 1);
        if (nu) nu.is_unlocked = 1;
      }
      this.persist();
      const nextScreen = unitDone ? 'unitcomplete' : 'levelcomplete';
      this.setState({ screen: nextScreen });
      this.bigConfetti(); Audio2.tone('win', this.state.muted);
      // Level passed: automatically move into the next level's first test.
      // A completed unit still stops here — the child should linger on the
      // finished vehicle/Garage moment rather than being swept into Unit+1.
      if (!unitDone) {
        setTimeout(() => { if (this.state.screen === 'levelcomplete') this.startLevel(unitId, level + 1); }, AUTO_ADVANCE_DELAY);
      }
    },

    toggleMute() { const m = !this.state.muted; Model.data.settings.muted = m ? 1 : 0; this.persist(); this.setState({ muted: m }); },
    togglePause() { this.setState({ paused: !this.state.paused }); },

    bigConfetti() { this.setState({ confetti: 60 }); setTimeout(() => this.setState({ confetti: 0 }), 2600); },
    miniConfetti() { /* handled via inline glow */ },

    /* ----- admin actions ----- */
    setCurrentUnit(unitId) {
      Model.data.settings.current_unit = unitId;
      Model.data.units.forEach(u => { if (u.order_index <= Model.unit(unitId).order_index) u.is_unlocked = 1; });
      this.persist(); render();
    },
    markUnitComplete(unitId) {
      for (let l = 1; l <= 6; l++) Model.lp(unitId, l).status = 'complete';
      Rewards.completeVehicle(Model.data, unitId);
      Model.wordsOf(unitId).forEach(p => { for (let l = 1; l <= 6; l++) { const s = Model.stat(p.id, l); s.times_correct = Math.max(s.times_correct, 3); s.mastered_for_level = 1; } });
      this.persist(); render();
    },
    // Simple path used by the "Add word" box on a unit's page: repository
    // add-if-new + assign to this unit, in one step.
    addWord(unitId, text) {
      const uw = Model.addWordToUnit(text, unitId);
      if (!uw) return;
      this.persist(); render();
    },
    // Removes this word from just this one unit (its other placements, if
    // any, and the repository entry itself, are untouched).
    removeWordPlacement(unitWordId) {
      Model.unassignFromUnit(unitWordId);
      this.persist(); render();
    },
    // Deletes a repository word everywhere (every unit it's placed in).
    deleteWordEverywhere(wordId) {
      const placements = Model.placementsOfWord(wordId);
      const where = placements.map(p => p.unit.name).join(', ') || 'nowhere yet';
      if (!confirm(`Delete "${Model.repoWordById(wordId).text}" completely? It's placed in: ${where}. This removes it and its progress from ALL of those units.`)) return;
      Model.deleteWordEverywhere(wordId);
      this.persist(); render();
    },
    addUnit(name, afterUnitId) {
      name = (name || '').trim(); if (!name) return;
      const lastId = Model.orderedUnits().slice(-1)[0]?.id ?? null;
      const nu = Model.insertUnitAfter(afterUnitId !== undefined ? afterUnitId : lastId, name);
      this.persist(); this.setState({ adminUnitId: nu.id });
    },
    insertUnitAfter(afterUnitId) {
      const nu = Model.insertUnitAfter(afterUnitId, 'New unit');
      this.persist(); this.setState({ adminUnitId: nu.id });
    },
    renameUnit(unitId, name) {
      Model.renameUnit(unitId, name);
      this.persist(); render();
    },
    reorderUnit(unitId, direction) {
      Model.reorderUnit(unitId, direction);
      this.persist(); render();
    },
    // Moves one placement (this unit's copy of the word) to another unit.
    movePlacementToUnit(unitWordId, targetUnitId) {
      Model.movePlacementToUnit(unitWordId, targetUnitId);
      this.persist(); render();
    },
    // Repository: add this word to ANOTHER unit too, without removing it
    // from any unit it's already in (the "same item in multiple units" case).
    assignWordToUnit(wordId, unitId) {
      Model.assignWordToUnit(wordId, unitId);
      this.persist(); render();
    },
    splitUnit(unitId, count) {
      const created = Model.splitUnit(unitId, count);
      if (!created.length) return;
      this.persist(); this.setState({ adminUnitId: unitId });
    },
    setWordImage(wordId, dataUrl) {
      Model.setWordImageOverride(wordId, dataUrl);
      this.persist(); render();
    },
    clearWordImage(wordId) {
      Model.clearWordImageOverride(wordId);
      this.persist(); render();
    },
    resetAll() {
      if (!confirm('Reset ALL progress and content back to the seed data?')) return;
      Model.seed(); this.persist();
      this.setState({ screen: 'map', unitId: null, level: null });
    },
  };

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  // Adds the numbers/colors/home/animals/school/family word bank as new
  // units appended after whatever units already exist. Each `words` list
  // entry becomes a repository word (reused if it already exists — e.g.
  // "thirty" and "fifteen" already exist from the original seed, so these
  // units demonstrate placing an existing repository word into another
  // unit rather than creating a duplicate).
  function seedContentLibrary(model) {
    const groups = [
      ['Numbers 11-15', ['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen']],
      ['Numbers 16-20', ['sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']],
      ['Numbers 30-40', ['thirty', 'forty']],
      ['Colors A', ['red', 'blue', 'green', 'yellow', 'orange']],
      ['Colors B', ['black', 'white', 'pink', 'purple', 'brown']],
      ['Colors C', ['grey', 'gold']],
      ['Home Objects A', ['door', 'window', 'table', 'chair', 'bed']],
      ['Home Objects B', ['lamp', 'clock', 'mirror', 'key', 'roof']],
      ['Home Objects C', ['wall', 'floor', 'stairs', 'kitchen', 'sofa']],
      ['Home Objects D', ['pillow', 'blanket', 'spoon', 'plate', 'cup']],
      ['Animals A', ['lion', 'tiger', 'elephant', 'bear', 'monkey']],
      ['Animals B', ['horse', 'cow', 'sheep', 'goat', 'rabbit']],
      ['Animals C', ['duck', 'hen', 'frog', 'snake', 'deer']],
      ['School Objects A', ['pencil', 'pen', 'book', 'bag', 'eraser']],
      ['School Objects B', ['ruler', 'chalk', 'board', 'desk', 'bench']],
      ['School Objects C', ['crayon', 'scissors', 'glue', 'notebook', 'sharpener']],
      ['School Objects D', ['paint', 'brush', 'uniform', 'lunch', 'bus']],
      ['Family A', ['mother', 'father', 'sister', 'brother', 'baby']],
      ['Family B', ['grandmother', 'grandfather', 'uncle', 'aunt', 'cousin']],
    ];
    let afterId = model.orderedUnits().slice(-1)[0]?.id ?? null;
    groups.forEach(([name, words]) => {
      const unit = model.insertUnitAfter(afterId, name);
      words.forEach(t => model.addWordToUnit(t, unit.id));
      afterId = unit.id;
    });
  }

  /* ---------- Icons ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function icon(name, opt) {
    opt = opt || {}; const s = opt.size || 24; const c = opt.color || 'currentColor'; const sw = opt.stroke || 2.4;
    const svg = svgEl('svg', { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: c, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    svg.style.display = 'block';
    const p = d => svgEl('path', { d });
    const add = (...els) => els.forEach(el => svg.appendChild(el));
    switch (name) {
      case 'sound': add(svgEl('path', { d: 'M4 9.5h3l4.5-3.5v12L7 14.5H4z', fill: c, stroke: 'none' }), p('M16 8.6a4 4 0 010 6.8'), p('M18.6 6a7.5 7.5 0 010 12')); break;
      case 'mute': add(svgEl('path', { d: 'M4 9.5h3l4.5-3.5v12L7 14.5H4z', fill: c, stroke: 'none' }), p('M17 9.5l4.5 5'), p('M21.5 9.5l-4.5 5')); break;
      case 'garage': add(p('M4 21V9.2l8-4.8 8 4.8V21'), p('M8 21v-6h8v6'), p('M8 12.2h8')); break;
      case 'admin': add(p('M4 7.5h16'), p('M4 12h16'), p('M4 16.5h16'), svgEl('circle', { cx: 9, cy: 7.5, r: 2.3, fill: '#F1F6FF', stroke: c }), svgEl('circle', { cx: 15, cy: 12, r: 2.3, fill: '#F1F6FF', stroke: c }), svgEl('circle', { cx: 8, cy: 16.5, r: 2.3, fill: '#F1F6FF', stroke: c })); break;
      case 'lock': add(svgEl('rect', { x: 5, y: 10.5, width: 14, height: 9.8, rx: 2.6, fill: c, stroke: 'none' }), p('M8 10.5V8a4 4 0 018 0v2.5')); break;
      case 'check': add(p('M5 12.6l4.3 4.2L19 6.9')); break;
      case 'close': add(p('M6 6l12 12'), p('M18 6L6 18')); break;
      case 'back': add(p('M15 5l-7 7 7 7')); break;
      case 'play': add(svgEl('path', { d: 'M8 5.5v13l11-6.5z', fill: c, stroke: 'none' })); break;
      case 'pause': add(svgEl('rect', { x: 7, y: 5, width: 4, height: 14, rx: 1, fill: c, stroke: 'none' }), svgEl('rect', { x: 14, y: 5, width: 4, height: 14, rx: 1, fill: c, stroke: 'none' })); break;
      case 'home': add(p('M4 11l8-6.4 8 6.4'), p('M6 9.6V20h12V9.6'), p('M10 20v-5h4v5')); break;
      case 'doc': add(svgEl('rect', { x: 5, y: 3.5, width: 14, height: 17, rx: 2.6 }), p('M8.5 8.5h7'), p('M8.5 12h7'), p('M8.5 15.5h4')); break;
      default: break;
    }
    return svg;
  }

  function darken(hex) {
    const m = { '#3B82F6': '#2563EB', '#22C55E': '#16A34A', '#FB7185': '#E11D62', '#A78BFA': '#7C3AED', '#FACC15': '#CA8A04', '#FDBA74': '#F59E0B' };
    return m[hex] || 'rgba(0,0,0,.25)';
  }

  /* ---------- reusable UI pieces ---------- */
  function bigBtn(label, onClick, opt) {
    opt = opt || {};
    const bg = opt.bg || 'var(--blue)';
    return E('button', { class: 'big-btn' + (opt.full ? ' full' : '') + (opt.ghost ? ' ghost' : ''), disabled: opt.disabled,
      style: Object.assign({ background: opt.ghost ? undefined : bg, boxShadow: opt.disabled || opt.ghost ? undefined : '0 6px 0 ' + darken(bg) + ', 0 10px 20px rgba(30,41,59,.14)' }, opt.style || {}),
      onclick: onClick }, [label]);
  }
  function iconBtn(iconName, onClick, active) {
    return E('button', { class: 'icon-btn' + (active ? ' active' : ''), onclick: onClick }, [icon(iconName, { size: 22, color: active ? '#fff' : undefined })]);
  }
  function topBar(title, onBack, extra) {
    return E('div', { class: 'topbar' }, [
      onBack ? E('button', { class: 'icon-btn', onclick: onBack }, [icon('back', { size: 22 })]) : null,
      E('div', { class: 'topbar-title baloo' }, [title]),
      extra,
    ]);
  }
  // Small floating back button for full-bleed celebration screens that have
  // no topBar of their own (test/level complete) — lets a parent back out
  // without waiting for auto-advance or a decision button.
  function screenBackBtn(onClick) {
    return E('button', { class: 'icon-btn', style: { position: 'absolute', top: '16px', left: '16px', zIndex: 5 }, onclick: onClick }, [icon('back', { size: 22 })]);
  }
  function replayBtn(text, audioData) {
    return E('button', { class: 'replay-btn', onclick: () => Audio2.speak(text, audioData) }, [icon('sound', { size: 22, color: 'var(--blue)' }), 'Hear it']);
  }
  function imageBox(word, size, imageData) {
    size = size || 140;
    const box = E('div', { class: 'image-box', style: { width: size + 'px', height: size + 'px' } });
    if (imageData) box.appendChild(E('img', { src: imageData, style: { width: '100%', height: '100%', objectFit: 'contain', borderRadius: '18px' } }));
    else box.appendChild(Illustrations.render(word));
    return box;
  }
  function vehicleBox(type, parts, color, opt) {
    const wrap = E('div', { style: { width: (opt && opt.width) || '100%', margin: '0 auto' } });
    wrap.appendChild(Vehicles.render(type, parts, color, opt));
    return wrap;
  }

  /* ---------- Screens ---------- */
  function viewMap() {
    const units = [...Model.data.units].sort((a, b) => a.order_index - b.order_index);
    const rows = [];
    units.forEach((u, i) => {
      const st = Model.unitStatus(u.id); const rw = Model.reward(u.id); const veh = Model.vehicleOf(u.id); const locked = st === 'locked';
      const grad = locked ? 'linear-gradient(180deg,#E5EAF2,#CBD5E1)' : 'linear-gradient(180deg, rgba(255,255,255,.45), rgba(255,255,255,0) 52%), ' + veh.color;
      const ring = locked ? 'rgba(0,0,0,.06)' : darken(veh.color);
      const off = i % 2 === 0 ? -44 : 44;
      const btn = E('button', { class: 'unit-node-btn' + (st === 'current' ? ' current' : ''), disabled: locked,
        style: { transform: 'translateX(' + off + 'px)', background: grad, boxShadow: 'inset 0 -7px 0 ' + ring + ', 0 14px 28px rgba(30,41,59,.16)' },
        onclick: () => App.openUnit(u.id) },
        [E('div', { class: 'unit-node-inner' }, [locked ? icon('lock', { size: 32, color: 'var(--muted)' }) : (() => { const b = vehicleBox(veh.type, 6, veh.color, { width: '56px' }); return b; })()]),
         st === 'complete' ? E('div', { class: 'unit-badge' }, [icon('check', { size: 18, color: '#8A5A08', stroke: 3 })]) : null]);
      rows.push(E('div', { class: 'unit-node-wrap' }, [
        E('div', { style: { transform: 'translateX(' + off + 'px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' } }, [
          btn,
          E('div', { class: 'unit-name-pill', style: { color: locked ? 'var(--muted)' : 'var(--text)' } }, [u.name]),
          E('div', { class: 'unit-status-text', style: { color: st === 'complete' ? 'var(--green)' : (locked ? 'var(--muted)' : 'var(--blue-dk)') } },
            [st === 'complete' ? 'Mastered' : st === 'current' ? (rw.parts_unlocked > 0 ? rw.parts_unlocked + ' / 6 parts' : 'Start here') : 'Locked']),
        ]),
      ]));
      if (i < units.length - 1) rows.push(E('div', { class: 'unit-connector' }, [E('div', { class: 'unit-connector-track' })]));
    });
    rows.push(E('div', { style: { position: 'relative', height: '80px', marginTop: '14px', textAlign: 'center', color: '#0F766E', fontWeight: 700, fontFamily: "'Baloo 2',sans-serif", fontSize: '13px', opacity: .7, paddingTop: '30px' } }, ['More adventures soon!']));

    const cur = Model.unit(Model.data.settings.current_unit) || Model.data.units[0];
    const veh = Model.vehicleOf(cur.id);
    const parts = Model.reward(cur.id).parts_unlocked;
    let lvl = 6; for (let l = 1; l <= 6; l++) { if (Model.lp(cur.id, l).status !== 'complete') { lvl = l; break; } }
    const dots = []; for (let i = 0; i < 6; i++) dots.push(E('div', { class: 'hero-dot' + (i < parts ? ' on' : '') }));

    return E('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '44px' } }, [
      E('div', { class: 'map-header' }, [
        E('div', { class: 'map-logo' }, ['S']),
        E('div', { style: { flex: 1 } }, [
          E('div', { class: 'map-title' }, [E('span', { class: 'brand-1' }, ['Spell']), E('span', { class: 'brand-2' }, ['Quest'])]),
          E('div', { class: 'saved-row' }, [E('div', { class: 'saved-dot' }), E('div', { class: 'saved-text' }, ['Saved ' + (App.state.lastSaved || '')])]),
        ]),
        iconBtn(App.state.muted ? 'mute' : 'sound', () => App.toggleMute()),
        iconBtn('garage', () => App.setState({ screen: 'garage' })),
        iconBtn('admin', () => App.setState({ screen: 'admin', adminUnitId: Model.data.settings.current_unit })),
      ]),
      E('div', { class: 'hero' }, [
        E('div', { class: 'hero-eyebrow' }, ['Current adventure']),
        E('div', { class: 'hero-name' }, [cur.name]),
        E('div', { class: 'hero-sub' }, ['Level ' + lvl + ' • ' + veh.name]),
        E('div', { class: 'hero-dots' }, dots),
        E('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginTop: '16px' } }, [
          E('button', { class: 'hero-play', onclick: () => App.openUnit(cur.id) }, [icon('play', { size: 18, color: '#fff' }), 'Play']),
          E('div', { style: { fontSize: '12.5px', fontWeight: 700, opacity: .92 } }, [parts + ' / 6 parts built']),
        ]),
      ]),
      App.state.resumeAvail ? E('div', { class: 'resume-banner' }, [
        E('div', { class: 'resume-text' }, ['Pick up where you left off']),
        bigBtn('Resume', () => App.resume(), { style: { padding: '10px 18px', fontSize: '14px' } }),
      ]) : null,
      E('div', { class: 'section-label' }, ['Adventure Map']),
      E('div', { style: { display: 'flex', flexDirection: 'column', marginTop: '8px', paddingTop: '6px' } }, rows),
    ]);
  }

  const LV = [
    { n: 1, name: 'Arrange', sub: 'Own letters', support: 'Word · Picture · Sound' },
    { n: 2, name: 'Arrange+', sub: 'Spot the right letters', support: 'Word · Picture · Sound' },
    { n: 3, name: 'One blank', sub: 'Pick 1 of 3', support: 'Picture · Sound' },
    { n: 4, name: 'More blanks', sub: 'Pick from 5', support: 'Picture · Sound' },
    { n: 5, name: 'Skeleton', sub: 'No picture', support: 'Sound only' },
    { n: 6, name: 'From sound', sub: 'You spell it', support: 'Sound only' },
  ];

  function viewLevelPath() {
    const u = Model.unit(App.state.unitId); const veh = Model.vehicleOf(u.id); const rw = Model.reward(u.id);
    const nodes = LV.map(lv => {
      const st = Model.levelStatus(u.id, lv.n); const locked = st === 'locked';
      const color = st === 'complete' ? 'var(--green)' : locked ? '#E2E8F0' : 'var(--blue)';
      return E('button', { class: 'level-node' + (locked ? ' locked' : '') + ((st === 'current' || st === 'in_progress') ? ' current' : ''), disabled: locked,
        onclick: () => App.startLevel(u.id, lv.n) }, [
        E('div', { class: 'level-node-badge', style: { background: color } }, [locked ? icon('lock', { size: 24, color: '#fff' }) : st === 'complete' ? icon('check', { size: 26, color: '#fff', stroke: 3 }) : String(lv.n)]),
        E('div', { style: { flex: 1 } }, [
          E('div', { class: 'level-node-title', style: { color: locked ? 'var(--muted)' : 'var(--text)' } }, ['Level ' + lv.n + ' · ' + lv.name]),
          E('div', { class: 'level-node-sub' }, [lv.sub + ' • ' + lv.support]),
        ]),
        st === 'complete' ? E('div', { style: { fontSize: '12px', fontWeight: 700, color: 'var(--green)' } }, ['part ' + lv.n]) : null,
      ]);
    });
    return E('div', { style: { flex: 1, display: 'flex', flexDirection: 'column' } }, [
      topBar(u.name, () => App.setState({ screen: 'map' }), iconBtn('garage', () => App.setState({ screen: 'garage' }))),
      E('div', { style: { padding: '6px 18px 0' } }, [
        E('div', { class: 'veh-preview-card' }, [
          E('div', { style: { fontSize: '13px', fontWeight: 700, color: 'var(--muted)', textAlign: 'center', marginBottom: '4px' } }, ['Building: ' + veh.name + ' — ' + rw.parts_unlocked + ' / 6 parts']),
          vehicleBox(veh.type, rw.parts_unlocked, veh.color, { width: '220px' }),
        ]),
      ]),
      E('div', { style: { padding: '0 18px 30px' } }, nodes),
    ]);
  }

  function renderSlots(b) {
    return E('div', { class: 'slots-row' }, b.slots.map((ch, i) => {
      const filling = i === b.filledCount && b.status === 'active';
      const ok = b.status === 'correct';
      return E('div', { class: 'slot' + (ch ? ' filled' : '') + (ch && ok ? ' correct' : '') + (filling ? ' filling' : '') + (ok && ch ? ' glow' : '') }, [ch || '']);
    }));
  }
  function renderTray(b) {
    const disabled = b.status !== 'active';
    return E('div', { class: 'tray-row' }, b.tray.map(t => t.used
      ? E('div', { class: 'tray-tile used' })
      : E('button', { class: 'tray-tile' + (b.shakeId === t.id ? ' shake' : ''), disabled, onclick: () => App.tapTile(t) }, [t.ch])));
  }
  function renderBlanks(b) {
    return E('div', { class: 'blanks-row' }, b.letters.map((ch, i) => {
      const bl = b.blanks.find(x => x.pos === i); const isBlank = !!bl; const filled = isBlank && bl.ch;
      const active = isBlank && bl === b.blanks[b.nextBlank] && b.status === 'active';
      const ok = b.status === 'correct';
      return E('div', { class: 'blank-cell ' + (isBlank ? 'blank' : 'letter') + (filled ? ' filled' : '') + (filled && ok ? ' correct' : '') + (active ? ' active' : '') + (ok && filled ? ' glow' : '') },
        [isBlank ? (filled ? bl.ch : '') : ch]);
    }));
  }
  function renderOptions(b) {
    const disabled = b.status !== 'active';
    return E('div', { class: 'options-row' }, b.options.map(o =>
      E('button', { class: 'option-btn' + (b.shakeId === o.id ? ' shake' : ''), disabled, onclick: () => App.tapOption(o) }, [o.ch])));
  }

  function viewGame() {
    const b = App.state.board; const s = App.state.session; if (!b) return E('div');
    const progW = ((s.idx + (b.status !== 'active' ? 1 : 0)) / s.words.length) * 100;
    const showWord = App.state.level <= 2;
    return E('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' } }, [
      E('div', { class: 'game-top' }, [
        E('button', { class: 'icon-btn', onclick: () => App.togglePause() }, [icon('back', { size: 22 })]),
        E('div', { class: 'game-progress-track' }, [E('div', { class: 'game-progress-fill', style: { width: progW + '%' } })]),
        iconBtn(App.state.muted ? 'mute' : 'sound', () => App.toggleMute()),
      ]),
      E('div', { class: 'game-word-count' }, ['Word ' + (s.idx + 1) + ' of ' + s.words.length + ' · Level ' + App.state.level]),
      E('div', { class: 'stimulus' }, [
        showWord ? E('div', { class: 'stimulus-word baloo' }, [b.word]) : null,
        b.image ? imageBox(b.word, 130, b.imageData) : null,
        E('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } }, [
          replayBtn(b.word, b.audioData),
          App.state.level >= 5 ? E('div', { style: { fontSize: '12px', fontWeight: 700, color: 'var(--muted)', fontFamily: 'monospace' } }, [App.state.level === 6 ? 'SOUND ONLY' : 'NO PICTURE']) : null,
        ]),
      ]),
      E('div', { class: 'answer-area' }, [
        b.slots ? renderSlots(b) : renderBlanks(b),
        App.state.encourage ? E('div', { class: 'encourage-text baloo' }, [App.state.encourage]) : null,
        b.status === 'revealed' ? E('div', { class: 'reveal-text' }, ['The word is “' + b.word + '” — you’ll get it next time!']) : null,
      ]),
      E('div', { class: 'input-tray' }, [b.tray ? renderTray(b) : renderOptions(b)]),
      App.state.paused ? viewPauseOverlay() : null,
    ]);
  }

  function viewPauseOverlay() {
    return E('div', { class: 'pause-overlay' }, [
      E('div', { class: 'pause-card' }, [
        E('div', { class: 'pause-title' }, ['Paused']),
        bigBtn('Resume', () => App.togglePause(), { full: true, bg: 'var(--green)' }),
        bigBtn(App.state.muted ? 'Unmute sound' : 'Mute sound', () => App.toggleMute(), { full: true, ghost: true }),
        bigBtn('Back to map', () => { App.setState({ paused: false, screen: 'map' }); }, { full: true, ghost: true }),
      ]),
    ]);
  }

  function viewTestComplete() {
    const r = App.state.testResult;
    if (!r) return E('div'); // mid-transition to the next test; next render() has the real screen
    const pct = Math.round(r.score * 100);
    const cfg = r.tier === 'hi' ? { title: 'Fantastic! Great job!', color: 'var(--green)', sub: 'You nailed it!' }
      : r.tier === 'mid' ? { title: 'Great job!', color: 'var(--blue)', sub: 'A few tricky ones left.' }
      : { title: 'Almost there!', color: 'var(--amber-dk)', sub: 'Let’s try that again.' };
    const ring = E('div', { class: 'tc-ring', style: { background: `conic-gradient(${cfg.color} ${pct * 3.6}deg, #E2E8F0 0deg)` } }, [
      E('div', { class: 'tc-ring-inner' }, [E('div', { class: 'tc-pct baloo', style: { color: cfg.color } }, [pct + '%']), E('div', { class: 'tc-frac' }, [r.correct + ' / ' + r.total])]),
    ]);
    const btns = [];
    if (r.tier === 'hi') btns.push(bigBtn('Continue', () => App.testContinue(), { full: true, bg: 'var(--green)' }));
    if (r.tier === 'mid') {
      btns.push(bigBtn('Retry the tricky ones', () => App.retryMissed(), { full: true, bg: 'var(--blue)' }));
      btns.push(bigBtn('Continue anyway', () => App.testContinue(), { full: true, ghost: true }));
    }
    if (r.tier === 'low') btns.push(bigBtn('Try again', () => App.retryWhole(), { full: true, bg: 'var(--amber-dk)' }));
    return E('div', { class: 'tc-wrap' }, [
      screenBackBtn(() => App.setState({ screen: 'map' })),
      E('div', { class: 'tc-title baloo', style: { color: cfg.color } }, [cfg.title]),
      ring,
      E('div', { class: 'tc-sub' }, [cfg.sub]),
      E('div', { class: 'tc-btns' }, btns),
    ]);
  }

  function viewLevelComplete() {
    const u = Model.unit(App.state.unitId); const veh = Model.vehicleOf(u.id); const rw = Model.reward(u.id);
    const level = App.state.level;
    return E('div', { class: 'lc-wrap' }, [
      screenBackBtn(() => App.setState({ screen: 'levelpath' })),
      E('div', { class: 'lc-title baloo' }, ['New part unlocked!']),
      E('div', { class: 'lc-card' }, [vehicleBox(veh.type, rw.parts_unlocked, veh.color, { width: '220px' })]),
      E('div', { class: 'lc-caption' }, ['You’ve built ' + rw.parts_unlocked + ' of 6 parts!']),
      E('div', { class: 'lc-body' }, ['Keep going to finish your ' + veh.name + '.']),
      bigBtn('Continue', () => App.startLevel(u.id, level + 1), { bg: 'var(--green)', style: { marginTop: '8px', minWidth: '200px' } }),
    ]);
  }

  function viewUnitComplete() {
    const u = Model.unit(App.state.unitId); const veh = Model.vehicleOf(u.id);
    return E('div', { class: 'lc-wrap' }, [
      E('div', { class: 'uc-title baloo' }, [u.name + ' mastered!']),
      E('div', { class: 'uc-drive-wrap' }, [E('div', { class: 'uc-drive' }, [vehicleBox(veh.type, 6, veh.color, { width: '260px' })])]),
      E('div', { class: 'lc-caption' }, ['Your ' + veh.name + ' is complete! 🎉']),
      E('div', { class: 'uc-btns' }, [
        bigBtn('See my Garage', () => App.setState({ screen: 'garage' }), { bg: 'var(--violet)' }),
        bigBtn('Unit report', () => App.setState({ screen: 'report' }), { ghost: true }),
        bigBtn('Back to map', () => App.setState({ screen: 'map' }), { bg: 'var(--blue)' }),
      ]),
    ]);
  }

  function viewGarage() {
    const cards = Model.data.units.map(u => {
      const veh = Model.vehicleOf(u.id); const rw = Model.reward(u.id); const done = rw.vehicle_complete;
      return E('div', { class: 'garage-card' }, [
        E('div', { style: { cursor: 'pointer' }, onclick: () => { Audio2.speak(veh.name); Audio2.tone('win', App.state.muted); } }, [vehicleBox(veh.type, done ? 6 : rw.parts_unlocked, veh.color, { width: '160px' })]),
        E('div', { class: 'garage-name' }, [veh.name]),
        E('div', { class: 'garage-status' + (done ? ' done' : '') }, [done ? '★ Complete' : rw.parts_unlocked > 0 ? rw.parts_unlocked + ' / 6 built' : 'Not started — ' + u.name]),
      ]);
    });
    return E('div', { style: { flex: 1, display: 'flex', flexDirection: 'column' } }, [
      topBar('My Garage', () => App.setState({ screen: 'map' })),
      E('div', { class: 'garage-grid' }, cards),
    ]);
  }

  function viewReport() {
    const u = Model.unit(App.state.unitId || Model.data.settings.current_unit);
    const rows = Model.wordsOf(u.id).map(w => {
      let shown = 0, cor = 0, inc = 0;
      [1, 2, 3, 4, 5, 6].forEach(l => { const s = Model.stat(w.id, l); shown += s.times_shown; cor += s.times_correct; inc += s.times_incorrect; });
      const acc = shown ? Math.round(cor / (cor + inc || 1) * 100) : 0;
      return { w, shown, cor, inc, acc };
    });
    const weak = [...rows].filter(r => r.shown > 0).sort((a, b) => a.acc - b.acc).slice(0, 3).map(r => r.w.id);
    return E('div', { style: { flex: 1, display: 'flex', flexDirection: 'column' } }, [
      topBar('Report · ' + u.name, () => App.setState({ screen: 'map' }), bigBtn('Print', () => window.print(), { style: { padding: '8px 14px', fontSize: '13px' } })),
      E('div', { style: { padding: '6px 18px 30px' } }, [
        E('div', { class: 'report-table' }, [
          E('div', { class: 'report-row head' }, [E('div', {}, ['Word']), E('div', {}, ['Shown']), E('div', {}, ['✓']), E('div', {}, ['✗']), E('div', {}, ['Accuracy'])]),
          ...rows.map(r => E('div', { class: 'report-row' + (weak.includes(r.w.id) ? ' weak' : '') }, [
            E('div', { style: { fontWeight: 700 } }, [r.w.text + (weak.includes(r.w.id) ? ' ⚑' : '')]),
            E('div', {}, [String(r.shown)]),
            E('div', { style: { color: 'var(--green)', fontWeight: 700 } }, [String(r.cor)]),
            E('div', { style: { color: 'var(--coral)', fontWeight: 700 } }, [String(r.inc)]),
            E('div', { style: { fontWeight: 700 } }, [r.acc + '%']),
          ])),
        ]),
        E('div', { class: 'report-note' }, ['⚑ = focus words for targeted practice. Print this page, export it to PDF, or ', E('a', { href: '#', onclick: e => { e.preventDefault(); downloadStaticReport(u, rows, weak); } }, ['save a copy into /reports/']), '.']),
      ]),
    ]);
  }

  function downloadStaticReport(u, rows, weak) {
    const dateStr = new Date().toLocaleDateString();
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>SpellQuest Report — ${u.name}</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;background:#F8FAFC;color:#1E293B;margin:0;padding:32px;}
  h1{font-size:22px;margin:0 0 4px;} .sub{color:#64748B;font-size:13px;margin-bottom:20px;}
  table{width:100%;max-width:640px;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(30,41,59,.08);}
  th,td{text-align:left;padding:10px 14px;font-size:14px;} th{background:#F1F5F9;color:#64748B;font-size:12.5px;text-transform:uppercase;letter-spacing:.4px;}
  tr.weak{background:#FFF7ED;} tr:not(:first-child) td{border-top:1px solid #F1F5F9;}
  .note{margin-top:16px;font-size:13px;color:#64748B;max-width:640px;}
  @media print{ body{padding:0;} }
</style></head><body>
  <h1>SpellQuest — ${u.name} Report</h1>
  <div class="sub">Generated ${dateStr}</div>
  <table><tr><th>Word</th><th>Shown</th><th>Correct</th><th>Incorrect</th><th>Accuracy</th></tr>
  ${rows.map(r => `<tr class="${weak.includes(r.w.id) ? 'weak' : ''}"><td>${r.w.text}${weak.includes(r.w.id) ? ' ⚑' : ''}</td><td>${r.shown}</td><td>${r.cor}</td><td>${r.inc}</td><td>${r.acc}%</td></tr>`).join('')}
  </table>
  <div class="note">⚑ = focus words for targeted practice with the child.</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'report-' + u.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() + '.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Inline "Split into N" control shown next to units with enough words to
  // usefully split (used from the units list — see splitControl(u) below).
  function splitControl(u) {
    const count = Model.wordsOf(u.id).length;
    const maxSplit = Math.min(4, count);
    const select = E('select', { class: 'admin-input', style: { flex: '0 0 auto', width: 'auto', padding: '6px 8px', fontSize: '12px' } },
      Array.from({ length: maxSplit - 1 }, (_, i) => i + 2).map(n => E('option', { value: String(n) }, ['Split into ' + n])));
    return E('div', { style: { display: 'flex', gap: '4px' } }, [
      select,
      E('button', { class: 'pill-btn', style: { background: '#FFF7ED', color: 'var(--amber-dk)' }, onclick: () => {
        const n = +select.value;
        if (!confirm(`Split "${u.name}" (${count} words) into ${n} smaller units? Word progress carries over; this can't be auto-undone.`)) return;
        App.splitUnit(u.id, n);
      } }, ['Split']),
    ]);
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // One row for a word placement (this unit's copy of a repository word):
  // thumbnail + upload/clear image override, audio preview, "also in N
  // other units" note, move-to-unit picker, add-to-another-unit picker,
  // and remove-from-this-unit only (repository entry survives).
  function wordPlacementRow(p, currentUnitId, otherUnitsFn) {
    const w = Model.repoWordById(p.word_id);
    const placements = Model.placementsOfWord(p.word_id);
    const otherPlacementUnits = placements.filter(x => x.unit.id !== currentUnitId).map(x => x.unit.name);
    const thumb = E('div', { style: { width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      [w.image_data ? E('img', { src: w.image_data, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : Illustrations.render(w.text)]);

    const otherUnits = otherUnitsFn();
    const assignSelect = E('select', { class: 'admin-input', style: { flex: '0 0 auto', width: 'auto', padding: '6px 8px', fontSize: '12px' } }, [
      E('option', { value: '' }, ['+ Also add to…']),
      ...otherUnits.filter(u => !placements.some(x => x.unit.id === u.id)).map(u => E('option', { value: String(u.id) }, [u.name])),
    ]);

    return E('div', { class: 'admin-row', style: { flexWrap: 'wrap', gap: '6px' } }, [
      thumb,
      E('div', { style: { flex: 1, minWidth: '90px' } }, [
        E('div', { style: { fontSize: '14px', fontWeight: 600 } }, [w.text]),
        otherPlacementUnits.length ? E('div', { style: { fontSize: '11px', color: 'var(--muted)' } }, ['also in: ' + otherPlacementUnits.join(', ')]) : null,
      ]),
      E('button', { class: 'pill-btn', style: { background: '#F1F5F9' }, onclick: () => Audio2.speak(w.text, w.audio_data) }, ['▶']),
      E('label', { class: 'pill-btn', style: { background: '#F1F5F9', cursor: 'pointer' } }, [
        'Image',
        E('input', { type: 'file', accept: 'image/*', style: { display: 'none' },
          onchange: async e => {
            const file = e.target.files[0]; if (!file) return;
            const dataUrl = await fileToDataUrl(file);
            App.setWordImage(w.id, dataUrl);
          } }),
      ]),
      w.image_data ? E('button', { class: 'pill-btn', style: { background: '#FFF7ED', color: 'var(--amber-dk)' }, onclick: () => App.clearWordImage(w.id) }, ['Reset img']) : null,
      E('select', { class: 'admin-input', style: { flex: '0 0 auto', width: 'auto', padding: '6px 8px', fontSize: '12px' },
        onchange: e => { const target = +e.target.value; if (target) App.movePlacementToUnit(p.id, target); e.target.value = ''; } }, [
        E('option', { value: '' }, ['Move to…']),
        ...otherUnits.map(u => E('option', { value: String(u.id) }, [u.name])),
      ]),
      assignSelect,
      E('button', { class: 'pill-btn', style: { background: '#EEF2FF', color: 'var(--blue-dk)' }, onclick: () => { const v = +assignSelect.value; if (v) App.assignWordToUnit(w.id, v); } }, ['Add']),
      E('button', { class: 'pill-btn', style: { background: '#FEF2F2', color: 'var(--coral)', fontWeight: 700 }, onclick: () => App.removeWordPlacement(p.id) }, ['✕ this unit']),
    ]);
  }

  // Browse/search every word in the repository regardless of which unit
  // (if any) it's assigned to, with quick "assign to a unit" and image
  // upload right there — this is the "one item added to multiple units"
  // and "fix a specific picture" surface.
  function wordRepositorySection(au) {
    const query = App.state.repoSearch.trim().toLowerCase();
    const all = Model.allWords();
    const filtered = query ? all.filter(w => w.text.includes(query)) : all;
    const searchInput = E('input', { class: 'admin-input', placeholder: 'Search the word repository…', value: App.state.repoSearch,
      oninput: e => App.setState({ repoSearch: e.target.value }) });

    const rows = filtered.slice(0, 60).map(w => {
      const placements = Model.placementsOfWord(w.id);
      const inUnitNames = placements.map(p => p.unit.name);
      const assignSelect = E('select', { class: 'admin-input', style: { flex: '0 0 auto', width: 'auto', padding: '6px 8px', fontSize: '12px' } }, [
        E('option', { value: '' }, ['Assign to…']),
        ...Model.orderedUnits().filter(u => !placements.some(p => p.unit.id === u.id)).map(u => E('option', { value: String(u.id) }, [u.name])),
      ]);
      const thumb = E('div', { style: { width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        [w.image_data ? E('img', { src: w.image_data, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : Illustrations.render(w.text)]);
      return E('div', { class: 'admin-row', style: { flexWrap: 'wrap', gap: '6px' } }, [
        thumb,
        E('div', { style: { flex: 1, minWidth: '90px' } }, [
          E('div', { style: { fontSize: '14px', fontWeight: 600 } }, [w.text]),
          E('div', { style: { fontSize: '11px', color: 'var(--muted)' } }, [inUnitNames.length ? 'in: ' + inUnitNames.join(', ') : 'not placed in any unit yet']),
        ]),
        E('button', { class: 'pill-btn', style: { background: '#F1F5F9' }, onclick: () => Audio2.speak(w.text, w.audio_data) }, ['▶']),
        E('label', { class: 'pill-btn', style: { background: '#F1F5F9', cursor: 'pointer' } }, [
          'Image',
          E('input', { type: 'file', accept: 'image/*', style: { display: 'none' },
            onchange: async e => { const file = e.target.files[0]; if (!file) return; App.setWordImage(w.id, await fileToDataUrl(file)); } }),
        ]),
        w.image_data ? E('button', { class: 'pill-btn', style: { background: '#FFF7ED', color: 'var(--amber-dk)' }, onclick: () => App.clearWordImage(w.id) }, ['Reset img']) : null,
        assignSelect,
        E('button', { class: 'pill-btn', style: { background: '#EEF2FF', color: 'var(--blue-dk)' }, onclick: () => { const v = +assignSelect.value; if (v) App.assignWordToUnit(w.id, v); } }, ['Add']),
        E('button', { class: 'pill-btn', style: { background: '#FEF2F2', color: 'var(--coral)', fontWeight: 700 }, onclick: () => App.deleteWordEverywhere(w.id) }, ['✕ everywhere']),
      ]);
    });

    return E('div', {}, [
      E('div', { class: 'admin-label' }, ['Word Repository (' + all.length + ' words)']),
      E('div', { class: 'admin-note', style: { marginTop: 0, marginBottom: '8px' } }, [
        'Every word lives here once, even if it appears in several units — search, fix a picture, or assign it to another unit without retyping it. Removing a word from a single unit (✕ this unit, above) keeps it here; "✕ everywhere" deletes it and all its placements for good.',
      ]),
      searchInput,
      E('div', { class: 'admin-list', style: { marginTop: '8px', maxHeight: '340px', overflowY: 'auto' } }, rows.length ? rows : [E('div', { style: { padding: '12px', color: 'var(--muted)', fontSize: '14px' } }, ['No matches.'])]),
      filtered.length > 60 ? E('div', { class: 'admin-note' }, [filtered.length - 60 + ' more — narrow your search to see them.']) : null,
    ]);
  }

  function viewAdmin() {
    const au = App.state.adminUnitId || Model.data.units[0].id;
    const orderedUnits = Model.orderedUnits();
    const unitRows = orderedUnits.map((u, i) => {
      const cur = Model.data.settings.current_unit === u.id; const st = Model.unitStatus(u.id);
      const nameInput = E('input', { class: 'admin-input', style: { fontWeight: cur ? 700 : 500, fontSize: '14px', padding: '6px 8px' }, value: u.name,
        onchange: e => App.renameUnit(u.id, e.target.value),
        onkeydown: e => { if (e.key === 'Enter') e.target.blur(); } });
      return E('div', { class: 'admin-row' + (App.state.adminUnitId === u.id ? ' current' : ''), style: { flexWrap: 'wrap', gap: '6px' } }, [
        E('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } }, [
          E('button', { class: 'pill-btn', style: { background: 'transparent', padding: '2px', opacity: i === 0 ? .3 : 1 }, disabled: i === 0, onclick: () => App.reorderUnit(u.id, -1) }, ['▲']),
          E('button', { class: 'pill-btn', style: { background: 'transparent', padding: '2px', opacity: i === orderedUnits.length - 1 ? .3 : 1 }, disabled: i === orderedUnits.length - 1, onclick: () => App.reorderUnit(u.id, 1) }, ['▼']),
        ]),
        E('button', { style: { flex: 0, background: 'transparent' }, onclick: () => App.setState({ adminUnitId: u.id }) }, [icon('play', { size: 14, color: App.state.adminUnitId === u.id ? 'var(--blue)' : 'var(--muted)' })]),
        E('div', { style: { flex: 1, minWidth: '120px' } }, [nameInput]),
        E('div', { style: { fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' } }, [Model.wordsOf(u.id).length + ' words' + (cur ? ' · current' : '') + (st === 'complete' ? ' · ✓' : '')]),
        E('button', { class: 'pill-btn', style: { background: '#EFF6FF', color: 'var(--blue-dk)' }, onclick: () => App.setCurrentUnit(u.id) }, ['Set current']),
        E('button', { class: 'pill-btn', style: { background: '#ECFDF5', color: 'var(--green)' }, onclick: () => App.markUnitComplete(u.id) }, ['Mark done']),
        E('button', { class: 'pill-btn', style: { background: '#F5F3FF', color: 'var(--violet-dk)' }, onclick: () => App.insertUnitAfter(u.id) }, ['+ Insert unit after']),
        Model.wordsOf(u.id).length >= 6 ? splitControl(u) : null,
      ]);
    });
    let newWordVal = '', newUnitVal = '';
    const otherUnits = () => Model.orderedUnits().filter(u => u.id !== au);
    const words = Model.wordsOf(au).map(p => wordPlacementRow(p, au, otherUnits));
    const label = t => E('div', { class: 'admin-label' }, [t]);

    const newWordInput = E('input', { class: 'admin-input', placeholder: 'Add a word (e.g. bridge)',
      onkeydown: e => { if (e.key === 'Enter') { App.addWord(au, e.target.value); } } });
    const newUnitInput = E('input', { class: 'admin-input', placeholder: 'New unit name' });

    return E('div', { class: 'admin-shell' }, [
      E('div', { class: 'admin-header' }, [
        E('button', { class: 'admin-btn', style: { background: '#F1F5F9' }, onclick: () => App.setState({ screen: 'map' }) }, ['‹ Back to game']),
        E('div', { style: { fontWeight: 700, fontSize: '16px' } }, ['Parent Admin']),
      ]),
      E('div', { class: 'admin-body' }, [
        label('Units'),
        E('div', { class: 'admin-note', style: { marginTop: 0, marginBottom: '8px' } }, [
          'Units play in the order shown (▲▼ to reorder). If a unit has too many words and your child is taking a long time to finish it, use "Split" to break it into smaller units automatically, or move individual words below.',
        ]),
        E('div', { class: 'admin-list' }, unitRows),
        E('div', { style: { display: 'flex', gap: '8px', marginTop: '10px' } }, [
          newUnitInput,
          E('button', { class: 'admin-btn', style: { background: 'var(--blue)', color: '#fff' }, onclick: () => App.addUnit(newUnitInput.value) }, ['Add unit at end']),
        ]),
        label('Words in ' + Model.unit(au).name),
        E('div', { class: 'admin-list' }, words.length ? words : [E('div', { style: { padding: '12px', color: 'var(--muted)', fontSize: '14px' } }, ['No words yet.'])]),
        E('div', { style: { display: 'flex', gap: '8px', marginTop: '10px' } }, [
          newWordInput,
          E('button', { class: 'admin-btn', style: { background: 'var(--green)', color: '#fff' }, onclick: () => App.addWord(au, newWordInput.value) }, ['Add word']),
        ]),
        E('div', { class: 'admin-note' }, ['Adding a word here reuses it from the repository below if it already exists, or creates it. Use the repository to add the same word to more than one unit, or fix a picture.']),

        wordRepositorySection(au),

        label('Move progress to another device (OneDrive sync)'),
        E('div', { class: 'admin-note', style: { marginTop: 0, marginBottom: '8px' } }, [
          'Progress always saves automatically on THIS device as you play — nothing to do for that. To bring that progress to a different phone or the laptop: tap Export here, save the file into the SpellQuest folder in OneDrive (replacing the old one), let it sync, then on the other device open Parent Admin and tap Import and pick that same file.',
        ]),
        E('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } }, [
          E('button', { class: 'admin-btn', style: { background: 'var(--blue)', color: '#fff' }, onclick: () => { DB.downloadCopy(); App.setState({ busy: 'Downloaded — now save it into your OneDrive SpellQuest/data folder.' }); setTimeout(() => App.setState({ busy: '' }), 4000); } }, ['⬆ Export progress']),
          E('label', { class: 'admin-btn', style: { background: '#fff', border: '1px solid #CBD5E1', cursor: 'pointer' } }, [
            '⬇ Import progress',
            E('input', { type: 'file', accept: '.sqlite,.db,application/x-sqlite3', style: { display: 'none' },
              onchange: async e => {
                const file = e.target.files[0]; if (!file) return;
                if (!confirm('Importing will REPLACE all progress currently on this device with the file you picked. Continue?')) { e.target.value = ''; return; }
                App.setState({ busy: 'Importing…' });
                const buf = await file.arrayBuffer();
                await DB.importBytes(new Uint8Array(buf));
                await Model.load();
                App.setState({ busy: 'Imported ✓', ready: true, screen: 'admin', adminUnitId: Model.data.settings.current_unit });
                setTimeout(() => App.setState({ busy: '' }), 2000);
              } }),
          ]),
        ]),
        E('div', { class: 'admin-note' }, ['Last saved on this device: ' + (App.state.lastSaved || 'never') + '.']),

        label('Advanced: direct folder access (desktop browsers only)'),
        E('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } }, [
          E('button', { class: 'admin-btn', style: { background: '#fff', border: '1px solid #CBD5E1' }, onclick: async () => { const ok = await DB.requestFolderAccess(); App.setState({ busy: ok ? 'Folder access granted ✓' : 'Folder access not granted.' }); setTimeout(() => App.setState({ busy: '' }), 2200); await App.persist(); } }, ['Grant folder access']),
        ]),
        E('div', { class: 'admin-note' }, ['Optional, laptop/Chrome/Edge only: once granted, this device also writes straight into data/spellquest.sqlite in this folder on every save, skipping the manual Export step (Import on other devices still works the same way).']),

        label('Reports'),
        E('button', { class: 'admin-btn', style: { background: '#fff', border: '1px solid #CBD5E1' }, onclick: () => App.setState({ screen: 'report', unitId: au }) }, ['Open ' + Model.unit(au).name + ' report']),

        label('Danger zone'),
        E('button', { class: 'admin-btn', style: { background: '#FEF2F2', color: 'var(--coral)', border: '1px solid #FECACA' }, onclick: () => App.resetAll() }, ['Reset all progress & content']),
      ]),
    ]);
  }

  /* ---------- shell + render ---------- */
  function confettiLayer() {
    const cols = ['var(--blue)', 'var(--green)', 'var(--yellow)', 'var(--coral)', 'var(--violet)'];
    const parts = [];
    for (let i = 0; i < App.state.confetti; i++) {
      const left = Math.random() * 100, dur = 1.8 + Math.random() * 1.2, delay = Math.random() * 0.5, sz = 7 + Math.random() * 8;
      parts.push(E('div', { class: 'confetti-piece', style: { left: left + '%', width: sz + 'px', height: (sz * 1.4) + 'px', background: cols[i % cols.length], animationDuration: dur + 's', animationDelay: delay + 's' } }));
    }
    return E('div', { class: 'confetti-layer' }, parts);
  }

  function tabBar(active) {
    const items = [['map', 'home', 'Home'], ['garage', 'garage', 'Garage'], ['report', 'doc', 'Report'], ['admin', 'admin', 'Parent']];
    const go = k => {
      if (k === 'report') App.setState({ screen: 'report', unitId: Model.data.settings.current_unit });
      else if (k === 'admin') App.setState({ screen: 'admin', adminUnitId: Model.data.settings.current_unit });
      else App.setState({ screen: k });
    };
    return E('div', { class: 'tabbar' }, items.map(([k, ic, label]) =>
      E('button', { class: 'tab' + (active === k ? ' active' : ''), onclick: () => go(k) }, [icon(ic, { size: 24 }), E('div', { class: 'tab-label' }, [label])])));
  }

  function render() {
    const root = document.getElementById('root');
    root.innerHTML = '';
    if (!App.state.ready) {
      root.appendChild(shell(E('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: '16px' } }, [
        E('div', { class: 'spinner' }), E('div', { style: { color: 'var(--muted)', fontWeight: 600 } }, ['Loading SpellQuest…']),
      ])));
      return;
    }
    let body;
    switch (App.state.screen) {
      case 'map': body = viewMap(); break;
      case 'levelpath': body = viewLevelPath(); break;
      case 'game': body = viewGame(); break;
      case 'testcomplete': body = viewTestComplete(); break;
      case 'levelcomplete': body = viewLevelComplete(); break;
      case 'unitcomplete': body = viewUnitComplete(); break;
      case 'garage': body = viewGarage(); break;
      case 'admin': body = viewAdmin(); break;
      case 'report': body = viewReport(); break;
      default: body = viewMap();
    }
    root.appendChild(shell(body));
  }

  // Where a right-swipe (or a screen's back button) should go. Kept as one
  // map so swipe-back and tap-back can never disagree with each other.
  function backTargetFor(screen) {
    switch (screen) {
      case 'levelpath': return () => App.setState({ screen: 'map' });
      case 'garage': return () => App.setState({ screen: 'map' });
      case 'report': return () => App.setState({ screen: 'map' });
      case 'admin': return () => App.setState({ screen: 'map' });
      case 'testcomplete': return App.state.testResult ? () => App.setState({ screen: 'map' }) : null;
      case 'levelcomplete': return () => App.setState({ screen: 'levelpath' });
      case 'unitcomplete': return () => App.setState({ screen: 'map' });
      // Mid-test: open the pause menu rather than jump straight out, so a
      // swipe/tap can't silently abandon progress on the current word.
      case 'game': return App.state.paused ? null : () => App.togglePause();
      default: return null; // top-level map has nowhere to go back to
    }
  }

  function initSwipeBack() {
    let startX = null, startY = null, startT = 0;
    const EDGE = 40; // must start near the left edge, like iOS/Android back-swipe
    const MIN_DX = 70, MAX_DY = 60, MAX_MS = 700;
    document.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      if (t.clientX > EDGE) { startX = null; return; }
      startX = t.clientX; startY = t.clientY; startT = Date.now();
    }, { passive: true });
    document.addEventListener('touchend', e => {
      if (startX === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX, dy = Math.abs(t.clientY - startY), dt = Date.now() - startT;
      startX = null;
      if (dx > MIN_DX && dy < MAX_DY && dt < MAX_MS) {
        const go = backTargetFor(App.state.screen);
        if (go) go();
      }
    }, { passive: true });
  }

  function shell(body) {
    const sc = App.state.screen;
    const showTab = ['map', 'garage', 'report'].indexOf(sc) >= 0;
    const noDeco = sc === 'admin';
    const bg = noDeco ? null : E('div', { class: 'shell-bg' }, [
      E('div', { style: { position: 'absolute', left: '-40px', top: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(34,197,94,.18)', filter: 'blur(30px)' } }),
      E('div', { style: { position: 'absolute', right: '-24px', top: '26px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(251,113,133,.18)', filter: 'blur(28px)' } }),
      E('div', { style: { position: 'absolute', right: '70px', top: '-24px', width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(250,204,21,.2)', filter: 'blur(24px)' } }),
    ]);
    const s = E('div', { class: 'shell' }, [bg, E('div', { class: 'shell-content' }, [body]), showTab ? tabBar(sc) : null,
      App.state.confetti ? confettiLayer() : null, App.state.busy ? E('div', { class: 'busy-bar' }, [App.state.busy]) : null]);
    return s;
  }

  window.addEventListener('DOMContentLoaded', () => {
    initSwipeBack();
    App.init().then(() => {
      if (window.SPELLQUEST_START_SCREEN === 'admin') {
        App.setState({ screen: 'admin', adminUnitId: Model.data.settings.current_unit });
      }
    });
  });
  window.SpellQuestApp = App; window.SpellQuestModel = Model;
})();
