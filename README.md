# SmartSnip

Game edukasi memangkas tanaman dengan aman.

## Cara deploy di GitHub Pages (penting!)

1. Buat repository baru (contoh: `smartsnip`)
2. Upload **semua isi folder ini** ke **root** repository (bukan di dalam subfolder lagi)
   - `index.html` harus ada di root repo
   - folder `css/`, `js/`, `data/`, `assets/` sejajar dengan `index.html`
3. Buka **Settings → Pages**
4. Source: **Deploy from a branch**
5. Branch: **main** (atau master), folder: **/ (root)**
6. Save, tunggu 1–2 menit
7. Buka URL Pages, contoh:
   - `https://USERNAME.github.io/smartsnip/`

**Jangan** buka halaman repository biasa (`github.com/USER/smartsnip`) — itu cuma README, bukan gamenya.

## Struktur yang benar di GitHub

```
smartsnip/          ← root repository
├── index.html
├── README.md
├── assets/
│   └── bgm.mp3
├── css/
│   └── styles.css
├── data/
│   ├── levels.json
│   ├── i18n.json
│   └── achievements.json
└── js/
    └── game.js
```

## Fitur

- 5 level, tantangan berbeda (kaca, kayu, duri, lumpur)
- Pangkas daun membentuk siluet (bulat, segitiga, hati, oval)
- Hint total 3x, badge, tutorial, ID/EN, musik background
