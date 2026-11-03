# Takhail Workshop Board

The Miro workshop board, rebuilt as a small static website the whole team can write on.

**Pages**

| File | What it holds |
|---|---|
| `index.html` | Landing page — the team, the vision product line, how to use the site, sync setup |
| `board.html` | Why are you here · Takhail targets · company problems · social-media questions · margin questions · the vision product line · new fields · the Notes frame |
| `projects.html` | Every project by theme, searchable, each linking to its own page · the 7 questions · the readiness checklist |
| `project.html` | **One project on its own page** — what it does, who it is for, its own scoring, its place on the matrix, its own note thread |
| `scoring.html` | Score every project 0–10 on 8 weighted criteria, grouped, with a downloadable importance matrix |
| `notes.html` | Every note and question the team has left, filterable by person |
| `assets/style.css` | Light Miro-style theme |
| `assets/team.js` | Team config, identity, notes storage, shared UI |
| `assets/projects.js` | **The project catalogue — the single source of truth** |
| `assets/scoring.js` | Criteria, weights, the shared score store, the matrix and the downloads |
| `assets/config.js` | Optional team defaults for the repo and issue number |

## Opening one project

Every project has its own page at `project.html?p=<id>`, reachable by clicking any card on **Projects**, any name in the scoring table or ranking, or any vision tile on the home page. Each page carries that project's features, sectors, its own 0–10 scoring panel, the matrix with that project highlighted in purple, a jump menu to any other project, prev/next links, and its own note thread.

Scores are shared: setting a number on a project's page changes the same number in the full scoring table, and the other way round.

## Adding or editing a project

Everything comes from the `PROJECTS` array in `assets/projects.js`. Add an entry and it appears on the Projects page, gets its own page, gets a row in the scoring table and a dot on the matrix — no other file needs touching.

```js
{ id:"my-project",                 // used in the URL — keep it short and unique
  name:"My Project",
  group:"Vision & CCTV",           // one of the existing groups, or a new one
  tagline:"One line under the title",
  desc:"A sentence or two about what it does.",
  features:["Thing one","Thing two"],
  sectors:["Malls","Schools"],
  value:"Why it is worth doing.",  // optional
  note:"Anything to flag."         // optional
}
```

## Downloading the matrix

On **Score & Choose** (and on any project page) the matrix downloads as **PNG** or **SVG**. The downloaded picture is not the same as the one on screen — it adds a title, the date, and a **numbered key listing every project title** with its two axis scores, in the same colours as the dots. It stands on its own in a slide or a message. **Download scores (CSV)** gives the full table — every project, its group, all eight scores and the weighted total, ranked.

## Hosting it on GitHub Pages

1. Create a repository and push these files to it.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The board is live at `https://<owner>.github.io/<repo>/` within a minute or two.

No build step, no dependencies, no server.

## Shared notes

Notes save to each person's browser straight away, so the board works with zero setup. To make notes **shared**, the board stores them as comments on a single GitHub issue.

**Set up once, for the team**

1. Open an issue in the repo — call it `Board notes`. Note its number (e.g. `1`).
2. Optionally edit `assets/config.js` and fill in:
   ```js
   window.TK_REPO  = "owner/repo";
   window.TK_ISSUE = "1";
   ```
   This saves everyone from typing it. **Never put a token in this file.**

**Set up once, per person**

1. GitHub → Settings → Developer settings → **Fine-grained personal access tokens** → Generate new token.
2. Repository access: **Only select repositories** → this repo.
3. Permissions → Repository permissions → **Issues: Read and write**.
4. On the board, click **⚙** in the top-right, paste the repo, the issue number and your token, then **Save & sync**.

Your token is stored in your own browser's `localStorage` only. It is never written into these files and never sent anywhere except `api.github.com`. If a token leaks, revoke it in GitHub settings — it takes one click.

**If you'd rather not use a token:** everything still works locally. Use **Export notes** in the ⚙ panel to hand your notes to the team as a JSON file, and **Import notes** to merge someone else's in.

## The team

| Person | Colour |
|---|---|
| Helmy | yellow |
| Yousef | green |
| Amin | cyan |
| Peter | orange |
| Wael | red |
| Beso | black |
| Bassam | purple |

Colours are taken from the sticky colours each person used on the board. To add or rename someone, edit the `TEAM` array at the top of `assets/team.js`.

## Scoring

Every criterion is scored **0–10 where 10 is always good** — so for *Low cost / low risk* and *Fast to deliver*, 10 means cheap and quick. Final score is the weighted average, `Σ(score × weight) ÷ Σ(weight)`, which keeps it on the same 0–10 scale. Scores and weights save to your browser; **Export scores** gives you a CSV.

The matrix defaults to the board's own hand-drawn axes — *Risk (high cost)* across, *Easy to sell (in demand)* up — and you can switch either axis to any other criterion.

## What was read off the board

Beyond the sticky notes, these handwritten parts were transcribed from the screenshots:

- The **importance matrix axes**: Time ↑, Easy to sell (in demand) ↓, Risk (high cost) ←, Novelty or hard to achieve →
- The **project readiness checklist** — "Every project should have…" (8 items) and its two questions
- The **social media question cluster** and the red "we already have this power because of Nagaty and Dr. Sherin" note
- The **margin questions** in yellow down the right edge of the Company Problems frame
- The **Notes frame**: the system sketch, Don't fall in love with ideas, Time–Cost–Quality, the Green Flag note, Nursery and schools vision project, #Claude Code video, Local Model / Tickets
- "don't stick" circled against *Business competitors comparisons*

**One open item:** two green notes in the *Takhail Target* frame are written too small to read in the screenshots. Worth re-checking on Miro and adding to `board.html`.

## The vision product line

The board's single **"Vision projects"** sticky has been replaced by six named products, each with its own page:

| Product | What it is |
|---|---|
| **VisionOps** | Smart Mall & School Monitoring — people counting, occupancy, overcrowding, restricted-area access, queues |
| **SafeSite AI** | Workplace Safety Monitoring — helmet/vest (PPE) detection, dangerous-zone entry, falls, manager alerts |
| **RetailVision** | Smart Store Intelligence — missing products, empty shelves, misplaced items, traffic, checkout queues |
| **ParkSense** | Intelligent Parking Management — free/occupied spaces, entry & exit, illegal parking, licence plates |
| **ClassVision** | Smart Classroom Analytics — occupancy, student counting, empty seats, utilisation, room usage |
| **SafeZone AI** | Intelligent Restricted-Area Monitoring — zone intrusion, crowd density, movement tracking, auto alerts |

Three earlier vision notes stay in the same group: *Handicapped protection camera*, *Sign language interpretation*, and *Nursery & schools vision*. The last one overlaps VisionOps and ClassVision — worth deciding as a team whether it is its own product or a sector for those two.
