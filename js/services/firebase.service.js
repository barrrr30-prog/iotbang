import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

let db;

export function init(cfg) {
  db = getDatabase(initializeApp(cfg.firebase));
}

// Struktur data:
//   devices/{id}/relays/relay1..relay4  -> true | false   (ditulis web, dibaca alat)
//   devices/{id}/status/lastSeen        -> ms epoch       (heartbeat dari alat)
export function subscribe(deviceId, onData, onStatus) {
  const offData = onValue(ref(db, `devices/${deviceId}`), (s) => onData(s.val() || {}),
    (err) => onStatus?.(false, err.message));
  const offConn = onValue(ref(db, ".info/connected"), (s) => onStatus?.(!!s.val()));
  return () => { offData(); offConn(); };
}

export function setRelay(deviceId, key, value) {
  return set(ref(db, `devices/${deviceId}/relays/${key}`), !!value);
}
