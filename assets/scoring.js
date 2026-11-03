/* Takhail Board — shared scoring model.
   Loaded by scoring.html (full table) and project.html (one project),
   so a score set on either page is the same stored number. */

const CRITERIA = [
  { k:"demand",  n:"Easy to sell / in demand", s:"Matrix axis: “easy to sell (in demand)”",          w:9  },
  { k:"clients", n:"Brings live clients",      s:"Problem: lack of clients and actual live work",    w:10 },
  { k:"cost",    n:"Low cost / low risk",      s:"Matrix axis: “risk (high cost)” — 10 = cheap",     w:7  },
  { k:"novelty", n:"Novelty",                  s:"Matrix axis: “novelty or hard to achieve”",        w:5  },
  { k:"time",    n:"Fast to deliver",          s:"Matrix axis: “time” — 10 = quick",                 w:7  },
  { k:"stack",   n:"We have the dev stack",    s:"Q3: do we have the stack for this?",               w:8  },
  { k:"pricing", n:"Clear pricing",            s:"Q4 & Q5: fixed vs T&M, pricing unproven research", w:6  },
  { k:"vision",  n:"Fits company vision",      s:"Targets: automation, own model, unicorn",          w:7  }
];
const CRITERION_BY_K = Object.fromEntries(CRITERIA.map(c => [c.k, c]));

const SKEY = "takhail.scores.v3";

function defaultScores() { return Object.fromEntries(CRITERIA.map(c => [c.k, 5])); }

function loadScoreState() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(SKEY)); } catch (e) { s = null; }
  if (!s || typeof s !== "object") s = {};
  if (!s.weights) s.weights = {};
  if (!s.projects) s.projects = {};
  if (!s.extra) s.extra = [];                       // user-added project names
  CRITERIA.forEach(c => { if (s.weights[c.k] == null) s.weights[c.k] = c.w; });
  // every catalogue project gets a row
  PROJECTS.forEach(p => { if (!s.projects[p.id]) s.projects[p.id] = defaultScores(); });
  // and every project the user added by hand
  s.extra.forEach(name => { if (!s.projects[name]) s.projects[name] = defaultScores(); });
  // drop scores saved against a project that has since been retired from the
  // catalogue, so an old browser does not show a stray row in the ranking
  Object.keys(s.projects).forEach(k => {
    if (!PROJECT_BY_ID[k] && !s.extra.includes(k)) delete s.projects[k];
  });
  s.x = s.x || "cost"; s.y = s.y || "demand";
  return s;
}

let SCORES = (typeof PROJECTS !== "undefined") ? loadScoreState() : null;
function saveScores() { try { localStorage.setItem(SKEY, JSON.stringify(SCORES)); } catch (e) {} }

function clamp10(v) { v = Math.round(+v); return isNaN(v) ? 0 : Math.max(0, Math.min(10, v)); }

/* A row key is a catalogue id, or the raw name for a user-added project. */
function rowName(key) { return PROJECT_BY_ID[key] ? PROJECT_BY_ID[key].name : key; }
function rowIsCatalogue(key) { return !!PROJECT_BY_ID[key]; }
function allRowKeys() { return Object.keys(SCORES.projects); }

function scoreOf(key) {
  const row = SCORES.projects[key]; if (!row) return 0;
  let tot = 0, wsum = 0;
  CRITERIA.forEach(c => { const w = SCORES.weights[c.k]; tot += (row[c.k] || 0) * w; wsum += w; });
  return wsum ? tot / wsum : 0;
}
function rankedRows() {
  return allRowKeys().map(k => [k, scoreOf(k)]).sort((a, b) => b[1] - a[1]);
}
function rankOf(key) {
  const r = rankedRows(); const i = r.findIndex(([k]) => k === key);
  return { rank: i + 1, total: r.length };
}

/* Numeric 0–10 stepper, shared by both pages. */
function makeStepper(value, onChange) {
  const el = document.createElement("span");
  el.className = "stepper";
  el.innerHTML = `<button type="button" tabindex="-1" aria-label="minus">−</button>` +
                 `<input type="number" min="0" max="10" step="1" value="${value}">` +
                 `<button type="button" tabindex="-1" aria-label="plus">+</button>`;
  const minus = el.children[0], inp = el.children[1], plus = el.children[2];
  const set = v => { const c = clamp10(v); inp.value = c; onChange(c); };
  minus.onclick = () => set(+inp.value - 1);
  plus.onclick  = () => set(+inp.value + 1);
  inp.onchange  = () => set(inp.value);
  inp.oninput   = () => { if (inp.value !== "" && !isNaN(+inp.value)) onChange(clamp10(inp.value)); };
  return el;
}

/* ---------- The matrix, drawn once and reused ----------
   Returns SVG markup. `opts.forExport` draws it on a white card with a
   title block, so the downloaded picture stands on its own.            */
function matrixSVG(opts = {}) {
  const xk = opts.x || SCORES.x, yk = opts.y || SCORES.y;
  const cx = CRITERION_BY_K[xk], cy = CRITERION_BY_K[yk];
  const exp = !!opts.forExport;
  const keys = opts.keys || allRowKeys();

  const L = 108, T = exp ? 96 : 34, W = 600, H = 430;
  const legendRows = exp ? Math.ceil(keys.length / 2) : 0;
  const legendH = exp ? 40 + legendRows * 19 : 0;
  const VW = 780, VH = T + H + 74 + legendH;

  let o = `<rect x="0" y="0" width="${VW}" height="${VH}" fill="#ffffff"/>`;

  if (exp) {
    o += `<text x="${VW / 2}" y="40" font-size="23" font-weight="700" fill="#16202e" text-anchor="middle" font-family="${FONT}">Takhail — Project Importance Matrix</text>
    <text x="${VW / 2}" y="63" font-size="13" fill="#64748b" text-anchor="middle" font-family="${FONT}">${esc(cx.n)} (across) vs ${esc(cy.n)} (up) · scored 0–10, 10 is always good</text>
    <text x="${VW / 2}" y="81" font-size="11" fill="#94a3b8" text-anchor="middle" font-family="${FONT}">${new Date().toLocaleDateString()}</text>`;
  }

  o += `
  <rect x="${L}" y="${T}" width="${W / 2}" height="${H / 2}" fill="#d7e3fd" opacity=".5"/>
  <rect x="${L + W / 2}" y="${T}" width="${W / 2}" height="${H / 2}" fill="#bdf0cf" opacity=".6"/>
  <rect x="${L}" y="${T + H / 2}" width="${W / 2}" height="${H / 2}" fill="#ffc9c9" opacity=".45"/>
  <rect x="${L + W / 2}" y="${T + H / 2}" width="${W / 2}" height="${H / 2}" fill="#fff4b8" opacity=".6"/>`;

  for (let i = 1; i < 12; i++)
    o += `<line x1="${L + i * W / 12}" y1="${T}" x2="${L + i * W / 12}" y2="${T + H}" stroke="#fff" stroke-width="1"/>`;
  for (let i = 1; i < 10; i++)
    o += `<line x1="${L}" y1="${T + i * H / 10}" x2="${L + W}" y2="${T + i * H / 10}" stroke="#fff" stroke-width="1"/>`;

  o += `<rect x="${L}" y="${T}" width="${W}" height="${H}" fill="none" stroke="#c9d3e2" stroke-width="1.5"/>
  <line x1="${L}" y1="${T + H / 2}" x2="${L + W}" y2="${T + H / 2}" stroke="#d94b4b" stroke-width="2"/>
  <line x1="${L + W / 2}" y1="${T}" x2="${L + W / 2}" y2="${T + H}" stroke="#d94b4b" stroke-width="2"/>

  <text x="${L + 10}" y="${T + 20}" font-size="12" fill="#5c6a7d" font-family="${FONT}">strong on ${esc(cy.n.toLowerCase())} only</text>
  <text x="${L + W - 10}" y="${T + 20}" font-size="12" fill="#17704f" text-anchor="end" font-weight="700" font-family="${FONT}">strong on both: do first →</text>
  <text x="${L + 10}" y="${T + H - 10}" font-size="12" fill="#a34b4b" font-family="${FONT}">weak on both: skip</text>
  <text x="${L + W - 10}" y="${T + H - 10}" font-size="12" fill="#8a6d00" text-anchor="end" font-family="${FONT}">strong on ${esc(cx.n.toLowerCase())} only</text>

  <text x="${L + W / 2}" y="${T + H + 34}" font-size="14" fill="#16202e" text-anchor="middle" font-weight="700" font-family="${FONT}">${esc(cx.n)} →</text>
  <text x="${L + W / 2}" y="${T + H + 52}" font-size="11" fill="#64748b" text-anchor="middle" font-family="${FONT}">0 on the left · 10 on the right</text>
  <text transform="translate(34,${T + H / 2}) rotate(-90)" font-size="13" fill="#16202e" text-anchor="middle" font-weight="700" font-family="${FONT}" textLength="${Math.min(H - 30, cy.n.length * 8.2)}" lengthAdjust="spacingAndGlyphs">${esc(cy.n)} →</text>
  <text transform="translate(52,${T + H / 2}) rotate(-90)" font-size="10" fill="#64748b" text-anchor="middle" font-family="${FONT}">0 bottom · 10 top</text>`;

  /* Spread dots that share a cell into a centred block, so a pile of
     equal scores stays readable and inside the grid. */
  const groups = {};
  keys.forEach(key => {
    const row = SCORES.projects[key]; if (!row) return;
    const sig = row[xk] + "," + row[yk];
    (groups[sig] = groups[sig] || []).push(key);
  });
  const place = {};
  Object.values(groups).forEach(members => {
    const n = members.length;
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const S = 25;
    members.forEach((key, j) => {
      const c = j % cols, r = Math.floor(j / cols);
      place[key] = { dx: (c - (cols - 1) / 2) * S, dy: (r - (rows - 1) / 2) * S };
    });
  });

  let top = "";
  keys.forEach((key, i) => {
    const row = SCORES.projects[key]; if (!row) return;
    const vx = row[xk], vy = row[yk];
    const off = place[key] || { dx:0, dy:0 };
    // keep the whole block inside the plot
    const clampX = v => Math.max(L + 13, Math.min(L + W - 13, v));
    const clampY = v => Math.max(T + 13, Math.min(T + H - 13, v));
    const x = clampX(L + (vx / 10) * W + off.dx);
    const y = clampY(T + H - (vy / 10) * H + off.dy);
    const good = vx >= 5 && vy >= 5;
    const hi = opts.highlight === key;
    const dot = `<g><circle cx="${x}" cy="${y}" r="${hi ? 14 : 11}" fill="${hi ? "#BB6BD9" : good ? "#17a673" : "#3b63d8"}" opacity=".93" stroke="#fff" stroke-width="${hi ? 3 : 2}">`
       + `<title>${esc(rowName(key))} — ${esc(cx.n)} ${vx}, ${esc(cy.n)} ${vy}</title></circle>`
       + `<text x="${x}" y="${y + 4}" font-size="${(i + 1) > 99 ? 9 : 10}" fill="#fff" text-anchor="middle" font-weight="700" font-family="${FONT}" pointer-events="none">${i + 1}</text></g>`;
    if (hi) top = dot; else o += dot;      // highlighted dot drawn last, on top
  });
  o += top;

  /* The numbered key, so a downloaded matrix carries its project titles. */
  if (exp) {
    const keyTop = T + H + 74;
    o += `<text x="${L}" y="${keyTop}" font-size="13" font-weight="700" fill="#16202e" font-family="${FONT}">Projects</text>`;
    const colW = (VW - L - 30) / 2;
    keys.forEach((key, i) => {
      const col = i < legendRows ? 0 : 1, rowI = i < legendRows ? i : i - legendRows;
      const lx = L + col * colW, ly = keyTop + 22 + rowI * 19;
      const row = SCORES.projects[key];
      const good = row[xk] >= 5 && row[yk] >= 5;
      let nm = rowName(key);
      const max = 40;
      if (nm.length > max) nm = nm.slice(0, max - 1) + "…";
      o += `<circle cx="${lx + 8}" cy="${ly - 4}" r="8" fill="${opts.highlight === key ? "#BB6BD9" : good ? "#17a673" : "#3b63d8"}"/>`
         + `<text x="${lx + 8}" y="${ly - 1}" font-size="9" fill="#fff" text-anchor="middle" font-weight="700" font-family="${FONT}">${i + 1}</text>`
         + `<text x="${lx + 22}" y="${ly}" font-size="12" fill="#16202e" font-family="${FONT}">${esc(nm)}</text>`
         + `<text x="${lx + colW - 34}" y="${ly}" font-size="11" fill="#64748b" text-anchor="end" font-family="${FONT}">${row[xk]}/${row[yk]}</text>`;
    });
  }

  return { svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}">${o}</svg>`,
           inner:o, vw:VW, vh:VH };
}
const FONT = "ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif";

/* ---------- Downloads ---------- */
function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function downloadMatrixSVG(opts) {
  const { svg } = matrixSVG({ ...opts, forExport:true });
  downloadBlob(new Blob([svg], { type:"image/svg+xml" }), "takhail-importance-matrix.svg");
}

function downloadMatrixPNG(opts, scale = 2) {
  const { svg, vw, vh } = matrixSVG({ ...opts, forExport:true });
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type:"image/svg+xml;charset=utf-8" }));
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = vw * scale; c.height = vh * scale;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    c.toBlob(b => { if (b) downloadBlob(b, "takhail-importance-matrix.png"); }, "image/png");
  };
  img.onerror = () => { URL.revokeObjectURL(url); alert("Could not render the PNG. The SVG download will still work."); };
  img.src = url;
}

function scoresCSV() {
  const rows = [["#", "Project", "Group", ...CRITERIA.map(c => c.n), "Weighted score"]];
  rankedRows().forEach(([key, s], i) => {
    const p = PROJECT_BY_ID[key];
    rows.push([i + 1, rowName(key), p ? p.group : "Added by the team",
               ...CRITERIA.map(c => SCORES.projects[key][c.k]), s.toFixed(2)]);
  });
  rows.push([]);
  rows.push(["", "Weights", "", ...CRITERIA.map(c => SCORES.weights[c.k]), ""]);
  return rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}
function downloadScoresCSV() {
  downloadBlob(new Blob(["﻿" + scoresCSV()], { type:"text/csv;charset=utf-8" }),
               "takhail-project-scores.csv");
}
