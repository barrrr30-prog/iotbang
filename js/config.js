// ===== SATU-SATUNYA FILE YANG PERLU DIEDIT UNTUK KONEKSI =====
export const CONFIG = {
  deviceId: "esp32-01",

  // 4 channel relay. key = nama field di Firebase, name = label di layar.
  relays: [
    { key: "relay1", name: "Relay 1" },
    { key: "relay2", name: "Relay 2" },
    { key: "relay3", name: "Relay 3" },
    { key: "relay4", name: "Relay 4" }
  ],

  // Firebase Console > Project settings > Your apps > Web app
  firebase: {
    apiKey: "ISI_API_KEY",
    authDomain: "PROJECT_ID.firebaseapp.com",
    databaseURL: "https://PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "PROJECT_ID",
    appId: "ISI_APP_ID"
  },

  // Apps Script > Deploy > Web app > URL berakhiran /exec
  appsScriptUrl: "https://script.google.com/macros/s/ISI_DEPLOYMENT_ID/exec",

  // Pilih provider. Nama harus ada di js/services/index.js
  modules: { realtime: "firebase", storage: "sheets" },

  logToggles: true,        // catat tiap ON/OFF ke Google Sheets
  offlineAfterMs: 30000,   // alat dianggap offline jika heartbeat lebih lama dari ini
  historyLimit: 20
};
