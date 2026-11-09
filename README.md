# Kontrol Relay 4 Channel (HTML + CSS + JavaScript)

Web statis modular untuk mengontrol relay quad channel lewat **Firebase Realtime Database**, dengan riwayat ON/OFF di **Google Sheets** (Apps Script). Siap deploy ke **Vercel**.

## Struktur
```
index.html
css/style.css
js/config.js              <- edit koneksi & nama relay di sini
js/main.js
js/services/index.js      <- registry provider (modular)
js/services/firebase.service.js
js/services/sheets.service.js
js/ui/dashboard.js
apps-script/Code.gs
vercel.json
```

## Struktur data Firebase
```
devices/esp32-01/relays/relay1 : true|false
devices/esp32-01/relays/relay2 : true|false
devices/esp32-01/relays/relay3 : true|false
devices/esp32-01/relays/relay4 : true|false
devices/esp32-01/status/lastSeen : 1731139200000   (opsional, heartbeat dari alat)
```
Alat membaca `relays/*` dan menggerakkan pin relay. Perhatikan: banyak modul relay bersifat **active LOW** (LOW = relay menyala). Alat sebaiknya menulis `status/lastSeen` (ms epoch, perlu NTP) tiap ~10 detik agar status "Alat: online" tampil.

## 1. Firebase
1. Buat project di console.firebase.google.com, lalu **Build > Realtime Database > Create**.
2. Project settings > Your apps > tambah **Web app**, salin config ke `js/config.js`.
3. Rules untuk uji coba (perketat dengan Authentication sebelum produksi, karena siapa pun yang tahu URL bisa menyalakan relay):
```json
{ "rules": { "devices": { ".read": true, ".write": true } } }
```

## 2. Google Apps Script
1. Buat Google Sheet baru > **Extensions > Apps Script**, tempel `apps-script/Code.gs`.
2. **Deploy > New deployment > Web app**: Execute as *Me*, access *Anyone*.
3. Salin URL `/exec` ke `appsScriptUrl`. Setelah mengubah kode, buat **New version** pada deployment.

## 3. Deploy ke Vercel
- CLI: `npm i -g vercel`, lalu `vercel` di folder ini (Framework: Other, tanpa build command).
- Atau push ke GitHub, lalu **Add New Project** di vercel.com.

## Mengubah jumlah / nama relay
Edit array `relays` di `js/config.js`. Tampilan dibuat otomatis dari array itu.

## Menambah koneksi baru
Buat `js/services/mqtt.service.js` dengan fungsi sesuai kontrak di `js/services/index.js`, daftarkan di registry, lalu ubah `modules.realtime` di `config.js`.

## Uji lokal
`npx serve .` atau `python3 -m http.server` (modul ES tidak jalan lewat file://).
