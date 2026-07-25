# SpellQuest

A gamified, offline spelling app. See `uploads/SpellQuest_Design_and_Build_Specification.md`
(one level up, in the parent Word Game folder) for the full design spec.

## Installing it (do this once per device)

SpellQuest is a PWA (installable web app) — installed once, it runs fully
offline afterward like a normal app icon, no server or Wi-Fi required to play.

**Step 1 — get it onto the device the first time.** You need to open it over
`http://`/`https://` at least once (never as a double-clicked file — phone
and desktop browsers both block the local file access this app needs when
opened that way). The simplest way, with everything staying local to your
home network:

1. On the parent's laptop, from this folder, run:
   ```
   python -m http.server 8080
   ```
2. On the SAME Wi-Fi, open `http://<laptop's-local-IP>:8080/index.html` on
   the phone (find the laptop's IP with `ipconfig`, e.g. `192.168.1.23`).

**Step 2 — install it on that device.**
- **Android (Chrome):** tap the ⋮ menu → "Add to Home screen" / "Install app".
- **iPhone (Safari):** tap the Share icon → "Add to Home Screen".
- **Laptop (Chrome/Edge):** click the install icon (⊕) in the address bar.

Once installed, the laptop's server is no longer needed — the icon on the
home screen opens SpellQuest standalone, fully offline, anytime. Repeat
steps 1–2 once for each device (each phone, the laptop, etc.) — after that,
each device is independent.

For Parent Admin, install `admin.html` the same way, or just reach it from
the "Parent" tab inside the main app.

## How progress is stored (important)

Each installed device keeps its OWN progress automatically (saved
continuously, no action needed) — this is what makes it work fully offline.
That also means progress does **not** automatically appear on a different
device. To move progress between devices (e.g. son played on his phone,
now wants to continue on the laptop), use **Parent Admin → "Move progress
to another device"**:

1. On the device with the progress you want to keep: tap **Export
   progress** — this downloads a `spellquest.sqlite` file.
2. Save/move that file into this `SpellQuest/data/` folder in OneDrive
   (overwriting the old one), and let OneDrive finish syncing.
3. On the OTHER device: open Parent Admin → **Import progress** → pick that
   same file from the OneDrive folder. Confirm the overwrite prompt.
4. That device now has the same progress and continues right where it left off.

This is a manual, explicit step by design — it only lives in Parent Admin,
not the child-facing screens, so nothing gets overwritten by accident.

(Desktop Chrome/Edge only: "Grant folder access" under Advanced makes that
device auto-write straight into `data/spellquest.sqlite` on every save,
skipping the manual Export step on that device specifically — Import on
other devices still works the same way.)

## Folder layout

- `index.html` — child-facing game
- `admin.html` — parent content/admin panel
- `manifest.json` / `sw.js` — PWA install + offline caching
- `assets/icons/` — home-screen app icons
- `js/` — game logic (`engine.js` word selection, `db.js` persistence, `audio.js`
  pronunciation, `rewards.js` + `vehicles.js` vehicle rewards, `illustrations.js`
  word images, `app.js` screens/routing)
- `css/styles.css` — design system
- `lib/` — vendored sql.js runtime (offline, no CDN dependency)
- `data/spellquest.sqlite` — reference copy of the database; each device's
  live progress actually lives in that device's own local browser storage
- `assets/words/` — drop `<word>.png` / `<word>.mp3` here to override the
  built-in illustration / system voice for any word
- `reports/` — saved end-of-unit reports land here

## Audio & images

Word pronunciation currently uses the best-sounding voice available in the
browser (falls back gracefully across devices). Word images use hand-drawn
flat SVG illustrations for the seeded word list, with a labeled placeholder
for any new word added via Admin. Both are designed to be swapped for real
premium-TTS MP3s / custom art later — just drop matching files into
`assets/words/<word>.mp3` and `<word>.png` and the app will prefer them
automatically, with zero code changes.

## Updating the app itself (code changes, not progress)

Because the service worker caches everything for offline use, a device that
already installed SpellQuest won't see code changes until it's back online
at least briefly — reopen the app while connected to Wi-Fi/internet-reachable
to the laptop server and it'll pick up the update in the background (may
need one extra reopen to fully switch over).
