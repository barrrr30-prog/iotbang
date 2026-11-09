// Google Sheets > Extensions > Apps Script (script harus terikat ke Sheet).
// File di proyek Apps Script: "Code.gs" (file ini) dan "Index" (isi Index.html).
// Deploy > Web app (Execute as: Me, Who has access: Anyone).
const SHEET_NAME = "relay_log";
const HEADERS = ["timestamp", "deviceId", "relay", "state"];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(HEADERS); }
  return sh;
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// ----- Dipanggil dari halaman lewat google.script.run -----
function logEvent(d) {
  try {
    sheet_().appendRow([new Date(), d.deviceId, d.relay, d.state === true]);
    return { ok: true };
  } catch (err) { return { ok: false, error: String(err) }; }
}
function getHistory(deviceId, limit) {
  try {
    const n = Math.min(Number(limit) || 20, 200);
    const rows = sheet_().getDataRange().getValues().slice(1)
      .filter(r => !deviceId || r[1] === deviceId)
      .slice(-n).reverse()
      // Date tidak bisa dikirim lewat google.script.run, jadi diubah ke milidetik
      .map(r => ({ timestamp: new Date(r[0]).getTime(), deviceId: r[1], relay: r[2], state: r[3] === true }));
    return { ok: true, rows: rows };
  } catch (err) { return { ok: false, error: String(err) }; }
}

// ----- Web app -----
function doGet(e) {
  const p = (e && e.parameter) || {};
  // Mode API (opsional, mis. dipanggil dari host lain): ?action=history
  if (p.action) {
    return p.action === "history"
      ? json_(getHistory(p.deviceId, p.limit))
      : json_({ ok: false, error: "Aksi tidak dikenal" });
  }
  // Mode halaman: tampilkan dashboard
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("Kontrol Relay 4 Channel")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.action !== "log") return json_({ ok: false, error: "Aksi tidak dikenal" });
    return json_(logEvent(d));
  } catch (err) { return json_({ ok: false, error: String(err) }); }
}
