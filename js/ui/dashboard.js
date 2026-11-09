const $ = (s) => document.querySelector(s);
let names = {};

export function init(deviceId, relays, onToggle) {
  $("#deviceId").textContent = deviceId;
  relays.forEach((r) => (names[r.key] = r.name));
  $("#tiles").innerHTML = relays.map((r) =>
    `<button class="tile" role="switch" aria-checked="false" data-key="${r.key}">
       <span class="name">${r.name}</span><span class="track"></span><span class="state">Mati</span>
     </button>`).join("");
  document.querySelectorAll(".tile").forEach((t) =>
    t.addEventListener("click", () => onToggle(t.dataset.key, t.getAttribute("aria-checked") !== "true")));
}

function paint(sel, ok, text, label) {
  const el = $(sel);
  el.className = "status " + (ok === null ? "" : ok ? "online" : "offline");
  $(label).textContent = text;
}
export function setCloud(ok, text) { paint("#cloudStatus", ok, text ?? (ok ? "terhubung" : "terputus"), "#cloudText"); }
export function setDevice(ok, text) { paint("#deviceStatus", ok, text, "#deviceText"); }

export function renderRelays(relays = {}) {
  document.querySelectorAll(".tile").forEach((t) => {
    const on = !!relays[t.dataset.key];
    t.setAttribute("aria-checked", String(on));
    t.querySelector(".state").textContent = on ? "Nyala" : "Mati";
  });
}

export function renderHistory(rows) {
  $("#historyBody").innerHTML = rows.length
    ? rows.map((r) => `<tr><td>${new Date(r.timestamp).toLocaleString("id-ID")}</td><td>${names[r.relay] || r.relay}</td><td>${r.state ? "Nyala" : "Mati"}</td></tr>`).join("")
    : `<tr><td colspan="3" class="empty">Belum ada riwayat tersimpan.</td></tr>`;
}

export function onAll(onFn, offFn) {
  $("#btnAllOn").addEventListener("click", onFn);
  $("#btnAllOff").addEventListener("click", offFn);
}
export function onLoad(fn) { $("#btnLoad").addEventListener("click", fn); }
export function busy(id, state) { $(id).disabled = state; }

let t;
export function toast(msg) {
  const el = $("#toast");
  el.textContent = msg; el.classList.add("show");
  clearTimeout(t); t = setTimeout(() => el.classList.remove("show"), 2800);
}
