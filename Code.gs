// Kontrol Relay 4 Channel - Apps Script saja (tanpa Firebase).
// Tempel di Google Sheets > Extensions > Apps Script. File lain: "Index" (HTML).
// Deploy > Web app (Execute as: Me, Who has access: Anyone).

const TOKEN = "GANTI_TOKEN_RAHASIA";   // harus sama dengan TOKEN di sketch ESP8266
const DEVICE_ID = "esp8266-01";
const RELAYS = ["relay1", "relay2", "relay3", "relay4"];
const SHEET_NAME = "relay_log";
const HEADERS = ["timestamp", "deviceId", "relay", "state", "source"];

const PROPS = PropertiesService.getScriptProperties();
const CACHE = CacheService.getScriptCache();

// ---------- penyimpanan ----------
function readState_() {
  const raw = PROPS.getProperty("state");
  const s = raw ? JSON.parse(raw) : {};
  RELAYS.forEach(k => { s[k] = s[k] === true; });
  return s;
}
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(HEADERS); }
  return sh;
}
function snapshot_() {
  const ls = Number(CACHE.get("lastSeen")) || 0;
  return { ok: true, deviceId: DEVICE_ID, relays: readState_(), ageMs: ls ? Date.now() - ls : null };
}
function apply_(changes, source) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const s = readState_(), now = new Date(), rows = [];
    Object.keys(changes).forEach(k => {
      if (RELAYS.indexOf(k) < 0) return;
      const v = changes[k] === true;
      if (s[k] !== v) { s[k] = v; rows.push([now, DEVICE_ID, k, v, source]); }
    });
    if (rows.length) {
      PROPS.setProperty("state", JSON.stringify(s));
      const sh = sheet_();
      sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    }
  } finally { lock.releaseLock(); }
  return snapshot_();
}

// ---------- dipanggil dashboard (google.script.run) ----------
function getState() {
  try { return snapshot_(); } catch (e) { return { ok: false, error: String(e) }; }
}
function setRelay(key, value) {
  try { const c = {}; c[key] = value === true; return apply_(c, "web"); }
  catch (e) { return { ok: false, error: String(e) }; }
}
function setAll(value) {
  try { const c = {}; RELAYS.forEach(k => { c[k] = value === true; }); return apply_(c, "web"); }
  catch (e) { return { ok: false, error: String(e) }; }
}
function getHistory(limit) {
  try {
    const n = Math.min(Number(limit) || 20, 200);
    const rows = sheet_().getDataRange().getValues().slice(1)
      .slice(-n).reverse()
      .map(r => ({ timestamp: new Date(r[0]).getTime(), relay: r[2], state: r[3] === true, source: r[4] || "" }));
    return { ok: true, rows: rows };
  } catch (e) { return { ok: false, error: String(e) }; }
}

// ---------- web app ----------
function doGet(e) {
  const p = (e && e.parameter) || {};

  // ESP8266: GET ?action=esp&token=...  ->  {"ok":true,"r":"0101"}
  // Setiap panggilan sekaligus dihitung sebagai heartbeat "alat online".
  if (p.action === "esp") {
    if (p.token !== TOKEN) return json_({ ok: false, error: "token salah" });
    CACHE.put("lastSeen", String(Date.now()), 21600);
    const s = readState_();
    return json_({ ok: true, r: RELAYS.map(k => (s[k] ? "1" : "0")).join("") });
  }

  // Halaman dashboard
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("Kontrol Relay 4 Channel")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
