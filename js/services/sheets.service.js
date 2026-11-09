let url;

export function init(cfg) {
  url = cfg.appsScriptUrl;
}

// Content-Type text/plain menghindari preflight CORS pada Apps Script.
export async function saveEvent(payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "log", ...payload })
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Gagal menyimpan");
  return json;
}

export async function getHistory(deviceId, limit = 20) {
  const res = await fetch(`${url}?action=history&deviceId=${encodeURIComponent(deviceId)}&limit=${limit}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Gagal memuat");
  return json.rows;
}
