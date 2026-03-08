# Sonic Karaoke — Setup Guide

## Files
| File | Purpose |
|------|---------|
| `index.html` | Singer-facing request page (QR code points here) |
| `dj.html` | DJ console — queue management |
| `songs.json` | Full song list (28,000+ songs, auto-cached offline) |
| `sw.js` | Service worker — enables offline mode |

---

## Hosting (GitHub Pages — free)

1. Create a free GitHub account at github.com
2. Create a new repository called `karaoke` (make it **Public**)
3. Upload all 4 files to the repository
4. Go to **Settings → Pages → Source → main branch / root**
5. Your singer URL will be: `https://YOUR-USERNAME.github.io/karaoke/`
6. Your DJ URL will be: `https://YOUR-USERNAME.github.io/karaoke/dj.html`

---

## Firebase Setup (real-time queue)

1. Go to https://console.firebase.google.com
2. Create a new project (free Spark plan is fine)
3. Click **Realtime Database → Create database → Start in test mode**
4. Copy the database URL (looks like `https://your-project-default-rtdb.firebaseio.com`)
5. In **both** `index.html` and `dj.html`, replace this line:
   ```
   const FIREBASE_URL = 'https://YOUR-PROJECT-default-rtdb.firebaseio.com';
   ```
   with your actual URL.

---

## QR Code

Generate a QR code for free at https://qr.io or https://qrcode-monkey.com  
Point it to your GitHub Pages singer URL.

Print and place on tables.

---

## How the anti-dominance logic works

The DJ console automatically spaces out repeat requests based on how many people are in the queue:

| Queue size | Rule |
|------------|------|
| Under 3 | No restriction — sing away |
| 3–5 songs | No back-to-back from same singer |
| 6–9 songs | Same singer max 1 in every 3 positions |
| 10+ songs | Same singer max 1 in every 5 positions |

Rules only kick in when there are enough other people waiting — nobody gets penalised unfairly when the queue is quiet.

The DJ can:
- **Drag and drop** to manually reorder at any time
- Click **⚖️ Rebalance** to re-apply the rules after manual changes
- Toggle **Auto-balance ON/OFF** to disable the logic entirely

---

## Singer name persistence

When a guest first scans the QR code they enter their name. This is saved to their phone's local storage and remembered next time they scan — they just tap "Yes, let's sing!" to confirm. Their partner can change the name in the request modal before submitting.
