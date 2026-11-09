import { CONFIG } from "./config.js";
import { realtimeProviders, storageProviders } from "./services/index.js";
import * as ui from "./ui/dashboard.js";

const rt = realtimeProviders[CONFIG.modules.realtime];
const store = storageProviders[CONFIG.modules.storage];
let lastSeen = null;

async function toggle(key, value) {
  try {
    await rt.setRelay(CONFIG.deviceId, key, value);
  } catch (e) { return ui.toast("Gagal mengirim: " + e.message); }
  if (CONFIG.logToggles) store.saveEvent({ deviceId: CONFIG.deviceId, relay: key, state: value }).catch(() => {});
}

function checkDevice() {
  if (!lastSeen) return ui.setDevice(null, "belum ada sinyal");
  const age = Date.now() - lastSeen;
  ui.setDevice(age < CONFIG.offlineAfterMs, age < CONFIG.offlineAfterMs ? "online" : "offline");
}

async function loadHistory() {
  ui.busy("#btnLoad", true);
  try { ui.renderHistory(await store.getHistory(CONFIG.deviceId, CONFIG.historyLimit)); }
  catch (e) { ui.toast(e.message); }
  ui.busy("#btnLoad", false);
}

ui.init(CONFIG.deviceId, CONFIG.relays, toggle);

if (!rt || !store) {
  ui.setCloud(false, "provider tidak ditemukan");
} else if (CONFIG.firebase.apiKey.startsWith("ISI")) {
  ui.setCloud(false, "isi js/config.js dulu");
} else {
  try {
    rt.init(CONFIG);
    store.init(CONFIG);
    rt.subscribe(CONFIG.deviceId,
      (d) => { ui.renderRelays(d.relays); lastSeen = d.status?.lastSeen || null; checkDevice(); },
      (ok, msg) => ui.setCloud(ok, ok ? undefined : msg));
    setInterval(checkDevice, 5000);
    ui.onAll(() => CONFIG.relays.forEach((r) => toggle(r.key, true)),
             () => CONFIG.relays.forEach((r) => toggle(r.key, false)));
    ui.onLoad(loadHistory);
  } catch (e) {
    ui.setCloud(false, e.message);
  }
}
