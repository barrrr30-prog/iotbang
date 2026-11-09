// Registry koneksi. Untuk menambah provider baru (MQTT, Supabase, dll),
// buat file *.service.js dengan fungsi yang sama lalu daftarkan di sini.
//
// Kontrak realtime : init(cfg), subscribe(deviceId, onData, onStatus) -> unsubscribe,
//                    setRelay(deviceId, key, boolean)
// Kontrak storage  : init(cfg), saveEvent({deviceId, relay, state}), getHistory(deviceId, limit)
import * as firebase from "./firebase.service.js";
import * as sheets from "./sheets.service.js";

export const realtimeProviders = { firebase };
export const storageProviders = { sheets };
