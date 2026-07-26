// db.js — sql.js load/save wrapper. Single source of truth for the SQLite DB.
const DB = (() => {
  const DB_PATH = 'data/spellquest.sqlite';
  const SCHEMA = `
    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY,
      name TEXT,
      order_index INTEGER,
      vehicle_id INTEGER,
      is_unlocked INTEGER DEFAULT 0
    );
    -- Word repository: one row per distinct word, independent of any unit.
    -- image_data/audio_data hold an admin-uploaded override (data: URL) that
    -- takes precedence over the built-in illustration / assets/words/ file.
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY,
      text TEXT,
      image_path TEXT,
      audio_path TEXT,
      image_data TEXT,
      audio_data TEXT
    );
    -- Placement of a repository word into a unit. The same word_id can
    -- appear in multiple units (multiple rows), each tracked separately.
    CREATE TABLE IF NOT EXISTS unit_words (
      id INTEGER PRIMARY KEY,
      unit_id INTEGER,
      word_id INTEGER,
      order_index INTEGER
    );
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY,
      name TEXT,
      type TEXT,
      part_count INTEGER,
      asset_dir TEXT,
      color TEXT
    );
    CREATE TABLE IF NOT EXISTS level_progress (
      id INTEGER PRIMARY KEY,
      unit_id INTEGER,
      level INTEGER,
      status TEXT,
      tests_completed INTEGER DEFAULT 0
    );
    -- Keyed by unit_word_id (a specific placement), not word_id, so the
    -- same repository word placed in two units tracks mastery separately.
    CREATE TABLE IF NOT EXISTS word_stats (
      id INTEGER PRIMARY KEY,
      unit_word_id INTEGER,
      level INTEGER,
      times_shown INTEGER DEFAULT 0,
      times_correct INTEGER DEFAULT 0,
      times_incorrect INTEGER DEFAULT 0,
      mastered_for_level INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS test_log (
      id INTEGER PRIMARY KEY,
      unit_id INTEGER,
      level INTEGER,
      score_pct REAL,
      words_json TEXT,
      timestamp TEXT
    );
    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY,
      unit_id INTEGER,
      parts_unlocked INTEGER DEFAULT 0,
      vehicle_complete INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `;

  let SQL = null;
  let db = null;
  let dirHandle = null; // File System Access API directory handle, if granted

  /* ---- IndexedDB: always-on local persistence for THIS device/browser.
     This is what keeps progress across closes when the app is installed as
     a standalone PWA on a phone with no folder access and no server. It is
     separate from the OneDrive-synced .sqlite file, which moves between
     devices only via the explicit Export/Import flow in Parent Admin. ---- */
  const IDB_NAME = 'spellquest-local';
  const IDB_STORE = 'files';
  const IDB_KEY = 'spellquest.sqlite';

  function idbOpen() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => { req.result.createObjectStore(IDB_STORE); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbLoad() {
    try {
      const conn = await idbOpen();
      return await new Promise((resolve, reject) => {
        const tx = conn.transaction(IDB_STORE, 'readonly');
        const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) { return null; }
  }

  async function idbSave(bytes) {
    try {
      const conn = await idbOpen();
      await new Promise((resolve, reject) => {
        const tx = conn.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put(bytes, IDB_KEY);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      return true;
    } catch (e) { return false; }
  }

  async function loadSqlJs() {
    if (SQL) return SQL;
    SQL = await initSqlJs({ locateFile: f => 'lib/' + f });
    return SQL;
  }

  async function fetchExistingBytes() {
    try {
      const res = await fetch(DB_PATH, { cache: 'no-store' });
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      if (buf.byteLength === 0) return null;
      return new Uint8Array(buf);
    } catch (e) { return null; }
  }

  // CREATE TABLE IF NOT EXISTS leaves an already-existing old-shape `words`
  // table untouched, so a device that installed before the word-repository
  // change still has the old columns (unit_id on words, word_id on
  // word_stats) and no unit_words table at all. Detect that shape and
  // migrate it forward once; safe to call on a fresh/already-migrated DB
  // too (no-ops immediately).
  function migrateToWordRepository() {
    const cols = all("PRAGMA table_info(words)").map(c => c.name);
    const isOldShape = cols.includes('unit_id');
    if (!isOldShape) return;

    run(`CREATE TABLE IF NOT EXISTS unit_words (
      id INTEGER PRIMARY KEY, unit_id INTEGER, word_id INTEGER, order_index INTEGER
    )`);
    run(`CREATE TABLE words_new (
      id INTEGER PRIMARY KEY, text TEXT, image_path TEXT, audio_path TEXT, image_data TEXT, audio_data TEXT
    )`);
    const oldWords = all('SELECT * FROM words');
    oldWords.forEach(w => {
      run('INSERT INTO words_new (id, text, image_path, audio_path, image_data, audio_data) VALUES (?,?,?,?,?,?)',
        [w.id, w.text, w.image_path, w.audio_path, null, null]);
      run('INSERT INTO unit_words (id, unit_id, word_id, order_index) VALUES (?,?,?,?)',
        [w.id, w.unit_id, w.id, w.order_index]);
    });
    run('DROP TABLE words');
    run('ALTER TABLE words_new RENAME TO words');

    const statCols = all("PRAGMA table_info(word_stats)").map(c => c.name);
    if (statCols.includes('word_id')) {
      run(`CREATE TABLE word_stats_new (
        id INTEGER PRIMARY KEY, unit_word_id INTEGER, level INTEGER,
        times_shown INTEGER DEFAULT 0, times_correct INTEGER DEFAULT 0,
        times_incorrect INTEGER DEFAULT 0, mastered_for_level INTEGER DEFAULT 0
      )`);
      // Old word_stats had no unit context; unit_words.id was set equal to
      // the original word's id above, so word_id doubles as the matching
      // unit_word_id for that word's single (pre-migration) placement.
      const oldStats = all('SELECT * FROM word_stats');
      oldStats.forEach(s => {
        run('INSERT INTO word_stats_new (id, unit_word_id, level, times_shown, times_correct, times_incorrect, mastered_for_level) VALUES (?,?,?,?,?,?,?)',
          [s.id, s.word_id, s.level, s.times_shown, s.times_correct, s.times_incorrect, s.mastered_for_level]);
      });
      run('DROP TABLE word_stats');
      run('ALTER TABLE word_stats_new RENAME TO word_stats');
    }
  }

  // Precedence: this device's IndexedDB save (most likely up to date for
  // ongoing play) > a spellquest.sqlite already sitting next to index.html
  // (e.g. right after a fresh install/first run) > brand new empty DB.
  async function open() {
    await loadSqlJs();
    const local = await idbLoad();
    const bytes = local || await fetchExistingBytes();
    db = bytes ? new SQL.Database(bytes) : new SQL.Database();
    db.run(SCHEMA);
    migrateToWordRepository();
    return db;
  }

  function all(sql, params) {
    const stmt = db.prepare(sql);
    if (params) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  function run(sql, params) {
    db.run(sql, params || []);
  }

  function exportBytes() {
    return db.export();
  }

  // Try File System Access API first (silent write to the same folder if
  // permission was already granted this session); otherwise fall back to a
  // download-triggered save the parent drags into the OneDrive folder.
  async function requestFolderAccess() {
    if (!window.showDirectoryPicker) return false;
    try {
      dirHandle = await window.showDirectoryPicker({ id: 'spellquest-data', startIn: 'documents' });
      return true;
    } catch (e) { return false; }
  }

  // Always persists to this device's IndexedDB (reliable, no permission
  // prompt, works identically on phone/laptop/any browser). Additionally
  // writes straight into the OneDrive-synced folder when folder access was
  // granted, as a convenience so you don't have to Export by hand every time
  // on desktop. Cross-device movement of the canonical file is still the
  // explicit Export/Import flow in Parent Admin.
  async function saveToDisk() {
    const bytes = exportBytes();
    await idbSave(bytes);
    if (dirHandle) {
      try {
        const dataDir = await dirHandle.getDirectoryHandle('data', { create: true });
        const fileHandle = await dataDir.getFileHandle('spellquest.sqlite', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(bytes);
        await writable.close();
        return { mode: 'fs', ok: true };
      } catch (e) {
        // fall through — still saved locally via IndexedDB above
      }
    }
    return { mode: 'local', ok: true, bytes };
  }

  function downloadCopy() {
    const bytes = exportBytes();
    const blob = new Blob([bytes], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'spellquest.sqlite'; a.click();
    URL.revokeObjectURL(url);
  }

  async function importBytes(bytes) {
    db.close();
    db = new SQL.Database(bytes);
    db.run(SCHEMA);
    await idbSave(bytes); // this device's local save now matches the imported file
  }

  return { open, all, run, exportBytes, saveToDisk, downloadCopy, importBytes, requestFolderAccess,
    hasFolderAccess: () => !!dirHandle };
})();
