// Tempel di Google Sheets > Extensions > Apps Script, lalu Deploy > Web app
// (Execute as: Me, Who has access: Anyone).
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

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.action !== "log") return json_({ ok: false, error: "Aksi tidak dikenal" });
    sheet_().appendRow([new Date(), d.deviceId, d.relay, d.state === true]);
    return json_({ ok: true });
  } catch (err) { return json_({ ok: false, error: String(err) }); }
}

function doGet(e) {
  try {
    if (e.parameter.action !== "history") return json_({ ok: false, error: "Aksi tidak dikenal" });
    const limit = Math.min(Number(e.parameter.limit) || 20, 200);
    const rows = sheet_().getDataRange().getValues().slice(1)
      .filter(r => !e.parameter.deviceId || r[1] === e.parameter.deviceId)
      .slice(-limit).reverse()
      .map(r => ({ timestamp: r[0], deviceId: r[1], relay: r[2], state: r[3] === true }));
    return json_({ ok: true, rows });
  } catch (err) { return json_({ ok: false, error: String(err) }); }
}
