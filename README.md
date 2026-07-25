# SpellQuest

A gamified, offline spelling app. See `uploads/SpellQuest_Design_and_Build_Specification.md`
(one level up, in the parent Word Game folder) for the full design spec.

**Live app:** https://swapnilgugale123.github.io/spellquest/index.html
**Parent Admin:** https://swapnilgugale123.github.io/spellquest/admin.html

## Installing it (do this once per device)

SpellQuest is a PWA (installable web app). Visit the link above once on a
device, install it, and from then on it runs fully offline from a home-screen
icon — no Wi-Fi, no laptop, nothing running in the background.

1. Open the live app link above in the device's browser.
2. Install it:
   - **Android (Chrome):** tap the ⋮ menu → "Add to Home screen" / "Install app".
   - **iPhone (Safari):** tap the Share icon → "Add to Home Screen".
   - **Laptop (Chrome/Edge):** click the install icon (⊕) in the address bar.
3. Open it from the new home-screen/desktop icon from now on — internet is
   only needed again if you want to pick up a future update to the app itself.

Repeat once per device (each phone, the laptop, etc.) — after install, each
device runs completely independently and offline.

## How progress is stored (important)

Each installed device keeps its OWN progress automatically (saved
continuously, no action needed). That also means progress does **not**
automatically appear on a different device. To move progress between devices
(e.g. son played on his phone, now wants to continue on the laptop), use
**Parent Admin → "Move progress to another device"**:

1. On the device with the progress you want to keep: tap **Export
   progress** — this downloads a `spellquest.sqlite` file.
2. Save/move that file into this `SpellQuest/data/` folder in OneDrive
   (overwriting the old one), and let OneDrive finish syncing.
3. On the OTHER device: open Parent Admin → **Import progress** → pick that
   same file from the OneDrive folder. Confirm the overwrite prompt.
4. That device now has the same progress and continues right where it left off.

This is a manual, explicit step by design — it only lives in Parent Admin,
not the child-facing screens, so nothing gets overwritten by accident.

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
already installed SpellQuest won't see code/content changes (new words,
bug fixes, etc.) until it's back online at least briefly — reopen the
installed app while the device has internet and it'll pick up the update in
the background (may need one extra reopen to fully switch over). Player
progress is untouched by this — it lives separately in local storage.

## Publishing updates (for whoever maintains the code)

This folder is a git repo pushed to
https://github.com/SwapnilGugale123/spellquest, served live via GitHub
Pages. To publish a change: commit it, then `git push`. GitHub Pages
rebuilds automatically within a minute or two.
