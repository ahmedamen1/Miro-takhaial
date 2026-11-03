/* Takhail Board — shared team config, identity, storage and notes layer.
   Used by index.html, board.html, projects.html, scoring.html, notes.html */

/* ---------- Team ---------- */
const TEAM = [
  { id: "helmy",  name: "Helmy",  color: "#F2C94C", ink: "#4a3b00", board: "yellow" },
  { id: "yousef", name: "Yousef", color: "#6FCF97", ink: "#0d3b22", board: "green"  },
  { id: "amin",   name: "Amin",   color: "#56CCF2", ink: "#06384a", board: "cyan"   },
  { id: "peter",  name: "Peter",  color: "#F2994A", ink: "#4a2a00", board: "orange" },
  { id: "wael",   name: "Wael",   color: "#EB5757", ink: "#4a0b0b", board: "red"    },
  { id: "bassam", name: "Bassam", color: "#4F4F4F", ink: "#ffffff", board: "black"  }
];
const TEAM_BY_ID = Object.fromEntries(TEAM.map(p => [p.id, p]));

/* Anyone who already picked "Beso", or wrote notes as Beso, is Bassam —
   the same person. Map the old id so nothing written earlier is orphaned. */
const TEAM_ALIASES = { beso: "bassam" };
function resolvePerson(id) { return TEAM_BY_ID[TEAM_ALIASES[id] || id] || null; }
/* True when `me` wrote a note, allowing for an aliased old author id. */
function ownsNote(me, note) {
  if (!me || !note) return false;
  const a = resolvePerson(note.author);
  return !!a && a.id === me.id;
}

/* ---------- Identity ---------- */
const WHO_KEY = "takhail.who";
function getMe()      { try { return resolvePerson(localStorage.getItem(WHO_KEY)); } catch (e) { return null; } }
function setMe(id)    { try { localStorage.setItem(WHO_KEY, id); } catch (e) {} dispatchEvent(new CustomEvent("tk:me")); }
function clearMe()    { try { localStorage.removeItem(WHO_KEY); } catch (e) {} dispatchEvent(new CustomEvent("tk:me")); }
function requireMe()  { const m = getMe(); if (!m) openWhoModal(); return m; }

/* ---------- Supabase backend (the shared one) ----------
   Set TK_SUPABASE_URL and TK_SUPABASE_KEY once in assets/config.js and every
   teammate sees the same notes with no setup of their own: no account, no
   token, no GitHub. The anon key is designed to be public — row-level
   security on the table is what controls access.                            */
function sbUrl() { return (window.TK_SUPABASE_URL || "").replace(/\/+$/, ""); }
function sbKey() { return window.TK_SUPABASE_KEY || ""; }
function sbConfigured() { return !!(sbUrl() && sbKey()); }

async function sbFetch(path, opts = {}) {
  const res = await fetch(sbUrl() + "/rest/v1" + path, {
    ...opts,
    headers: {
      "apikey": sbKey(),
      "Authorization": "Bearer " + sbKey(),
      "Content-Type": "application/json",
      ...(opts.headers || {})
    }
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error("Supabase " + res.status + ": " + txt.slice(0, 180));
  }
  if (res.status === 204) return null;
  const body = await res.text();
  return body ? JSON.parse(body) : null;
}

/* Rows come back exactly as the page stores them. */
function fromRow(r) {
  return { id: r.id, author: r.author, anchor: r.anchor, kind: r.kind,
           text: r.text, ts: Number(r.ts),
           authorName: (resolvePerson(r.author) || {}).name || r.author };
}

/* ---------- GitHub Issues backend (optional alternative) ----------
   Each person pastes their own fine-grained token once. It is stored only in
   their own browser (localStorage) and never committed to the repo.
   Repo config lives in window.TK_REPO (set in each page or in config.js).     */
const GH_TOKEN_KEY = "takhail.ghtoken";
const GH_REPO_KEY  = "takhail.ghrepo";
const GH_ISSUE_KEY = "takhail.ghissue";

function ghToken()      { try { return localStorage.getItem(GH_TOKEN_KEY) || ""; } catch (e) { return ""; } }
function ghRepo()       { try { return localStorage.getItem(GH_REPO_KEY) || (window.TK_REPO || ""); } catch (e) { return window.TK_REPO || ""; } }
function ghIssue()      { try { return localStorage.getItem(GH_ISSUE_KEY) || (window.TK_ISSUE || ""); } catch (e) { return window.TK_ISSUE || ""; } }
function ghConfigured() { return !!(ghToken() && ghRepo() && ghIssue()); }
function setGh(token, repo, issue) {
  try {
    if (token !== undefined) localStorage.setItem(GH_TOKEN_KEY, token.trim());
    if (repo  !== undefined) localStorage.setItem(GH_REPO_KEY,  repo.trim());
    if (issue !== undefined) localStorage.setItem(GH_ISSUE_KEY, String(issue).trim());
  } catch (e) {}
}
function clearGh() {
  try { [GH_TOKEN_KEY, GH_REPO_KEY, GH_ISSUE_KEY].forEach(k => localStorage.removeItem(k)); } catch (e) {}
}

async function ghFetch(path, opts = {}) {
  const res = await fetch("https://api.github.com" + path, {
    ...opts,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": "Bearer " + ghToken(),
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...(opts.headers || {})
    }
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error("GitHub " + res.status + ": " + txt.slice(0, 200));
  }
  return res.status === 204 ? null : res.json();
}

/* A note is encoded into an issue comment body as fenced JSON so it survives
   round-tripping and stays human-readable on GitHub itself. */
function encodeNote(n) {
  return `**${n.authorName}** on \`${n.anchor}\`${n.kind === "question" ? " — ❓ question" : ""}\n\n${n.text}\n\n\`\`\`takhail\n${JSON.stringify({ id: n.id, author: n.author, anchor: n.anchor, kind: n.kind, text: n.text, ts: n.ts })}\n\`\`\``;
}
function decodeNote(comment) {
  const m = /```takhail\s*\n([\s\S]*?)\n```/.exec(comment.body || "");
  if (!m) return null;
  try {
    const d = JSON.parse(m[1]);
    return { ...d, ghId: comment.id, authorName: (resolvePerson(d.author) || {}).name || d.author };
  } catch (e) { return null; }
}

/* ---------- Local store (always written; GitHub is layered on top) ---------- */
const LOCAL_KEY = "takhail.notes";
function localNotes() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; } catch (e) { return []; }
}
function saveLocalNotes(arr) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(arr)); } catch (e) {}
}

/* ---------- Unified notes API ---------- */
const NotesStore = {
  cache: [],
  mode: "local",          // "supabase" | "github" | "local"
  error: null,

  async load() {
    this.cache = localNotes();

    /* Supabase first: it is the one everyone shares with no setup. */
    if (sbConfigured()) {
      try {
        const rows = await sbFetch("/notes?select=*&order=ts.asc&limit=5000");
        const out = (rows || []).map(fromRow);
        const remoteIds = new Set(out.map(n => n.id));
        // anything written while offline is kept and retried
        const pending = this.cache.filter(n => !remoteIds.has(n.id) && n.pending);
        this.cache = [...out, ...pending];
        saveLocalNotes(this.cache);
        this.mode = "supabase"; this.error = null;
        if (pending.length) this.flush();     // try to push what never made it
        return this.cache;
      } catch (e) {
        this.mode = "local"; this.error = e.message;
        return this.cache;
      }
    }

    if (!ghConfigured()) { this.mode = "local"; return this.cache; }
    try {
      const out = [];
      for (let page = 1; page <= 10; page++) {
        const cs = await ghFetch(`/repos/${ghRepo()}/issues/${ghIssue()}/comments?per_page=100&page=${page}`);
        cs.map(decodeNote).filter(Boolean).forEach(n => out.push(n));
        if (cs.length < 100) break;
      }
      // merge: remote wins, keep local-only (unsynced) notes
      const remoteIds = new Set(out.map(n => n.id));
      const pending = this.cache.filter(n => !remoteIds.has(n.id) && n.pending);
      this.cache = [...out, ...pending];
      saveLocalNotes(this.cache);
      this.mode = "github"; this.error = null;
    } catch (e) {
      this.mode = "local"; this.error = e.message;
    }
    return this.cache;
  },

  /* Push any note that was written while the connection was down. */
  async flush() {
    if (!sbConfigured()) return;
    const pending = this.cache.filter(n => n.pending);
    for (const n of pending) {
      try {
        await sbFetch("/notes", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" },
          body: JSON.stringify({ id: n.id, author: n.author, anchor: n.anchor,
                                 kind: n.kind, text: n.text, ts: n.ts }) });
        delete n.pending;
      } catch (e) { this.error = e.message; break; }
    }
    saveLocalNotes(this.cache);
    dispatchEvent(new CustomEvent("tk:notes"));
  },

  for(anchor) {
    return this.cache.filter(n => n.anchor === anchor)
                     .sort((a, b) => (a.ts || 0) - (b.ts || 0));
  },

  countFor(anchor) { return this.cache.filter(n => n.anchor === anchor).length; },

  async add({ anchor, text, kind }) {
    const me = getMe(); if (!me) throw new Error("Pick your name first");
    const note = {
      id: "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      author: me.id, authorName: me.name, anchor, kind: kind || "note",
      text: text.trim(), ts: Date.now(), pending: true
    };
    this.cache.push(note); saveLocalNotes(this.cache);
    dispatchEvent(new CustomEvent("tk:notes"));   // show it immediately

    if (sbConfigured()) {
      try {
        await sbFetch("/notes", { method: "POST",
          body: JSON.stringify({ id: note.id, author: note.author, anchor: note.anchor,
                                 kind: note.kind, text: note.text, ts: note.ts }) });
        delete note.pending; this.error = null;
      } catch (e) { this.error = e.message; }
      saveLocalNotes(this.cache);
      dispatchEvent(new CustomEvent("tk:notes"));
      return note;
    }

    if (ghConfigured()) {
      try {
        const c = await ghFetch(`/repos/${ghRepo()}/issues/${ghIssue()}/comments`,
          { method: "POST", body: JSON.stringify({ body: encodeNote(note) }) });
        note.ghId = c.id; delete note.pending; saveLocalNotes(this.cache);
      } catch (e) { this.error = e.message; }
    }
    dispatchEvent(new CustomEvent("tk:notes"));
    return note;
  },

  async remove(id) {
    const n = this.cache.find(x => x.id === id); if (!n) return;
    const me = getMe();
    if (!ownsNote(me, n)) throw new Error("You can only delete your own notes");
    if (sbConfigured()) {
      try { await sbFetch("/notes?id=eq." + encodeURIComponent(id), { method: "DELETE" }); }
      catch (e) { this.error = e.message; }
    }
    if (n.ghId && ghConfigured()) {
      try { await ghFetch(`/repos/${ghRepo()}/issues/comments/${n.ghId}`, { method: "DELETE" }); }
      catch (e) { this.error = e.message; }
    }
    this.cache = this.cache.filter(x => x.id !== id); saveLocalNotes(this.cache);
    dispatchEvent(new CustomEvent("tk:notes"));
  },

  exportJSON() {
    return JSON.stringify({ exported: new Date().toISOString(), notes: this.cache }, null, 2);
  },
  importJSON(txt) {
    const d = JSON.parse(txt);
    const incoming = Array.isArray(d) ? d : (d.notes || []);
    const have = new Set(this.cache.map(n => n.id));
    let added = 0;
    incoming.forEach(n => { if (n && n.id && !have.has(n.id)) { this.cache.push(n); added++; } });
    saveLocalNotes(this.cache);
    dispatchEvent(new CustomEvent("tk:notes"));
    return added;
  }
};

/* ---------- Shared UI: header, who-picker, settings ---------- */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g,
    m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return new Date(ts).toLocaleDateString();
}

function mountHeader(active) {
  const links = [
    ["index.html",    "Home"],
    ["board.html",    "The Board"],
    ["projects.html", "Projects"],
    ["scoring.html",  "Score &amp; Choose"],
    ["notes.html",    "All Notes"]
  ];
  const el = document.createElement("header");
  el.className = "site-head";
  el.innerHTML = `
    <div class="head-in">
      <a class="brand" href="index.html"><span class="brand-dot"></span>Takhail Board</a>
      <nav class="head-nav">${links.map(([h, t]) =>
        `<a href="${h}" class="${h === active ? "on" : ""}">${t}</a>`).join("")}</nav>
      <div class="head-right">
        <button class="who-chip" id="whoChip" type="button"></button>
        <button class="icon-btn" id="setBtn" type="button" title="Sync settings" aria-label="Sync settings">⚙</button>
      </div>
    </div>`;
  document.body.prepend(el);
  document.getElementById("whoChip").onclick = openWhoModal;
  document.getElementById("setBtn").onclick  = openSettings;
  paintWhoChip();
  addEventListener("tk:me", paintWhoChip);
}

function paintWhoChip() {
  const c = document.getElementById("whoChip"); if (!c) return;
  const me = getMe();
  if (me) {
    c.innerHTML = `<span class="avatar" style="background:${me.color};color:${me.ink}">${me.name[0]}</span>${esc(me.name)}`;
    c.classList.add("has");
  } else {
    c.innerHTML = `<span class="avatar ghost">?</span>Pick your name`;
    c.classList.remove("has");
  }
}

function modal(html, onMount) {
  // only one dialog at a time — reopening replaces whatever is showing
  document.querySelectorAll(".modal-back").forEach(m => m.remove());
  const back = document.createElement("div");
  back.className = "modal-back";
  back.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(back);
  const close = () => back.remove();
  back.addEventListener("click", e => { if (e.target === back) close(); });
  addEventListener("keydown", function k(e) {
    if (e.key === "Escape") { close(); removeEventListener("keydown", k); }
  });
  back.querySelectorAll("[data-close]").forEach(b => b.onclick = close);
  if (onMount) onMount(back, close);
  return close;
}

function openWhoModal() {
  const me = getMe();
  modal(`
    <h3>Who are you?</h3>
    <p class="modal-sub">Your notes are tagged with your name and colour, so the team knows who wrote what.</p>
    <div class="who-grid">
      ${TEAM.map(p => `
        <button class="who-card ${me && me.id === p.id ? "sel" : ""}" data-id="${p.id}" type="button">
          <span class="avatar lg" style="background:${p.color};color:${p.ink}">${p.name[0]}</span>
          <span>${p.name}</span>
        </button>`).join("")}
    </div>
    <div class="modal-foot">
      ${me ? `<button class="btn ghost" id="whoClear" type="button">Sign out</button>` : ""}
      <button class="btn ghost" data-close type="button">Close</button>
    </div>`, (back, close) => {
    back.querySelectorAll(".who-card").forEach(b => b.onclick = () => { setMe(b.dataset.id); close(); });
    const cl = back.querySelector("#whoClear");
    if (cl) cl.onclick = () => { clearMe(); close(); };
  });
}

function openSettings() {
  const m = NotesStore.mode;
  const status = m === "supabase"
    ? `<div class="sync-ok"><b>✓ Shared with the team.</b> Everyone who opens this board sees the same notes, and new ones appear within about 20 seconds. ${NotesStore.cache.length} notes loaded.</div>`
    : m === "github"
    ? `<div class="sync-ok"><b>✓ Connected to GitHub.</b> ${NotesStore.cache.length} notes loaded from issue #${esc(ghIssue())}.</div>`
    : `<div class="sync-warn"><b>Not shared yet.</b> Your notes are saved in this browser only, so the rest of the team cannot see them.
       ${sbConfigured() || ghConfigured()
         ? `Could not reach the server${NotesStore.error ? `: ${esc(NotesStore.error)}` : ""}. Your notes are safe here and will be sent once the connection is back.`
         : `Whoever set this board up needs to fill in the two Supabase lines in <code>assets/config.js</code> — that switches sharing on for everybody at once, with nothing to set up on your side.`}</div>`;

  modal(`
    <h3>Shared notes</h3>
    ${status}
    <div class="modal-foot" style="margin-top:16px">
      <button class="btn" id="sRefresh" type="button">↻ Refresh now</button>
      <button class="btn ghost" id="sExport" type="button">Export notes</button>
      <button class="btn ghost" id="sImport" type="button">Import notes</button>
      <button class="btn ghost" data-close type="button">Close</button>
    </div>

    <details style="margin-top:18px">
      <summary style="cursor:pointer;font-size:.86rem;color:var(--mute)">Use a GitHub issue instead (needs your own token)</summary>
      <div style="margin-top:12px">
        <label class="fld"><span>Repository <em>owner/repo</em></span>
          <input type="text" id="sRepo" placeholder="owner/repo" value="${esc(ghRepo())}"></label>
        <label class="fld"><span>Issue number</span>
          <input type="text" id="sIssue" placeholder="1" value="${esc(ghIssue())}"></label>
        <label class="fld"><span>Your GitHub token <em>fine-grained, Issues: read &amp; write, this repo only</em></span>
          <input type="password" id="sTok" placeholder="github_pat_..." value="${esc(ghToken())}"></label>
        <p class="warn">Your token is stored only in this browser. Never commit it to the repository, and never paste someone else's token here.</p>
        <div class="modal-foot">
          <button class="btn" id="sSave" type="button">Save &amp; sync</button>
          <button class="btn ghost" id="sClear" type="button">Disconnect</button>
        </div>
      </div>
    </details>
    <p id="sMsg" class="modal-sub" style="margin-top:10px"></p>`, (back, close) => {
    const msg = back.querySelector("#sMsg");
    back.querySelector("#sRefresh").onclick = async (e) => {
      e.target.disabled = true; msg.textContent = "Refreshing…";
      await NotesStore.load();
      msg.textContent = NotesStore.mode === "local"
        ? "Still not shared. " + (NotesStore.error || "")
        : `Up to date — ${NotesStore.cache.length} notes.`;
      e.target.disabled = false;
      dispatchEvent(new CustomEvent("tk:notes"));
    };
    back.querySelector("#sSave").onclick = async () => {
      setGh(back.querySelector("#sTok").value, back.querySelector("#sRepo").value, back.querySelector("#sIssue").value);
      msg.textContent = "Connecting…";
      await NotesStore.load();
      msg.textContent = NotesStore.mode === "github"
        ? `Connected. ${NotesStore.cache.length} notes loaded from GitHub.`
        : "Could not connect: " + (NotesStore.error || "unknown error") + ". Notes stay in this browser for now.";
      dispatchEvent(new CustomEvent("tk:notes"));
    };
    back.querySelector("#sExport").onclick = () => {
      const b = new Blob([NotesStore.exportJSON()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = "takhail-notes.json"; a.click();
      URL.revokeObjectURL(a.href);
    };
    back.querySelector("#sImport").onclick = () => {
      const i = document.createElement("input");
      i.type = "file"; i.accept = ".json,application/json";
      i.onchange = () => {
        const f = i.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = () => {
          try { msg.textContent = NotesStore.importJSON(r.result) + " new notes imported."; }
          catch (e) { msg.textContent = "Could not read that file."; }
        };
        r.readAsText(f);
      };
      i.click();
    };
    back.querySelector("#sClear").onclick = () => { clearGh(); msg.textContent = "Disconnected. Notes stay in this browser."; };
  });
}

/* ---------- Note threads attached to any element ---------- */
/* Usage: <div data-notes="anchor-id"> ... </div>  then  mountNotes(root) */
function mountNotes(root = document) {
  root.querySelectorAll("[data-notes]").forEach(el => {
    if (el.querySelector(":scope > .note-thread")) return;
    const anchor = el.dataset.notes;
    const box = document.createElement("div");
    box.className = "note-thread";
    el.appendChild(box);
    renderThread(box, anchor);
  });
}

function renderThread(box, anchor) {
  const notes = NotesStore.for(anchor);
  const me = getMe();
  box.innerHTML = `
    <button class="thread-toggle" type="button">
      💬 <span>${notes.length ? notes.length + (notes.length === 1 ? " note" : " notes") : "Add a note"}</span>
      ${notes.length ? `<span class="who-dots">${
        [...new Set(notes.map(n => n.author))].map(a => {
          const p = resolvePerson(a) || { color: "#999" };
          return `<i style="background:${p.color}"></i>`;
        }).join("")}</span>` : ""}
    </button>
    <div class="thread-body" hidden>
      <div class="thread-list">${notes.length ? notes.map(n => {
        const p = resolvePerson(n.author) || { color: "#999", ink: "#fff", name: n.author };
        return `<div class="tnote ${n.kind === "question" ? "q" : ""}" style="--pc:${p.color}">
          <div class="tnote-head">
            <span class="avatar sm" style="background:${p.color};color:${p.ink}">${esc(p.name[0])}</span>
            <strong>${esc(p.name)}</strong>
            ${n.kind === "question" ? `<span class="qtag">question</span>` : ""}
            <span class="tnote-time">${timeAgo(n.ts)}${n.pending ? " · not synced" : ""}</span>
            ${ownsNote(me, n) ? `<button class="tnote-del" data-del="${esc(n.id)}" type="button" title="Delete">×</button>` : ""}
          </div>
          <p>${esc(n.text).replace(/\n/g, "<br>")}</p>
        </div>`;
      }).join("") : `<p class="thread-empty">No notes here yet. Add the first one.</p>`}</div>
      <div class="thread-add">
        <textarea rows="2" placeholder="${me ? "Write a note or a question…" : "Pick your name first to write"}" ${me ? "" : "disabled"}></textarea>
        <div class="thread-actions">
          <button class="btn sm" data-kind="note" type="button" ${me ? "" : "disabled"}>Add note</button>
          <button class="btn sm ghost" data-kind="question" type="button" ${me ? "" : "disabled"}>Add question</button>
          ${me ? `<span class="as-who">as <b style="color:${me.color === "#F2C94C" ? "#8a6d00" : me.color}">${esc(me.name)}</b></span>`
                : `<button class="btn sm ghost" id="pickHere" type="button">Pick your name</button>`}
        </div>
      </div>
    </div>`;

  const toggle = box.querySelector(".thread-toggle");
  const body = box.querySelector(".thread-body");
  toggle.onclick = () => { body.hidden = !body.hidden; toggle.classList.toggle("open", !body.hidden); };
  if (box.dataset.open === "1") { body.hidden = false; toggle.classList.add("open"); }

  const ta = box.querySelector("textarea");
  box.querySelectorAll("[data-kind]").forEach(b => b.onclick = async () => {
    const t = ta.value.trim(); if (!t) { ta.focus(); return; }
    b.disabled = true;
    try { await NotesStore.add({ anchor, text: t, kind: b.dataset.kind }); } catch (e) { alert(e.message); }
    b.disabled = false;
  });
  box.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    if (!confirm("Delete this note?")) return;
    try { await NotesStore.remove(b.dataset.del); } catch (e) { alert(e.message); }
  });
  const ph = box.querySelector("#pickHere"); if (ph) ph.onclick = openWhoModal;

  box.dataset.open = body.hidden ? "0" : "1";
}

function refreshAllThreads() {
  document.querySelectorAll(".note-thread").forEach(box => {
    const anchor = box.parentElement.dataset.notes;
    const wasOpen = !box.querySelector(".thread-body").hidden;
    box.dataset.open = wasOpen ? "1" : "0";
    renderThread(box, anchor);
  });
}
addEventListener("tk:notes", refreshAllThreads);
addEventListener("tk:me", refreshAllThreads);

/* ---------- Boot ---------- */
async function bootPage(active) {
  mountHeader(active);
  await NotesStore.load();
  mountNotes(document);
  refreshAllThreads();
  // nudge a first-time visitor to pick a name, unless they already opened something
  if (!getMe()) setTimeout(() => {
    if (!getMe() && !document.querySelector(".modal-back")) openWhoModal();
  }, 400);
  startAutoSync();
  paintSyncBanner();
  addEventListener("tk:notes", paintSyncBanner);
}

/* A quiet strip under the header when notes are NOT being shared, so nobody
   writes a note believing the team can see it. */
function paintSyncBanner() {
  const shared = NotesStore.mode === "supabase" || NotesStore.mode === "github";
  let el = document.getElementById("syncBanner");
  if (shared) { if (el) el.remove(); return; }
  if (!el) {
    el = document.createElement("div");
    el.id = "syncBanner";
    el.className = "sync-banner";
    const head = document.querySelector(".site-head");
    if (head && head.parentNode) head.parentNode.insertBefore(el, head.nextSibling);
    else document.body.prepend(el);
  }
  const reachable = sbConfigured() || ghConfigured();
  el.innerHTML = `<span>⚠</span><div><b>These notes are only on this device.</b>
    ${reachable
      ? `The board could not reach the notes server, so the team cannot see them yet. They are saved here and will send once it is back.`
      : `Sharing is not switched on yet, so nobody else can see what you write here.`}</div>
    <button type="button" id="bannerMore">Details</button>`;
  el.querySelector("#bannerMore").onclick = openSettings;
}

/* Poll for other people's notes so the board stays current without a reload.
   Pauses while the tab is hidden, and refreshes as soon as it is back. */
let autoSyncTimer = null;
function startAutoSync(ms = 20000) {
  if (!sbConfigured() || autoSyncTimer) return;
  const tick = async () => {
    if (document.hidden) return;
    const before = NotesStore.cache.length;
    const mode = NotesStore.mode;
    await NotesStore.load();
    if (NotesStore.cache.length !== before || NotesStore.mode !== mode) {
      dispatchEvent(new CustomEvent("tk:notes"));
    }
  };
  autoSyncTimer = setInterval(tick, ms);
  addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
}
