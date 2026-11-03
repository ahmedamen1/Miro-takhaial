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
| `assets/config.js` | **Sharing setup — the two Supabase lines go here** |

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

**This has to be switched on once, or nobody sees anyone else's notes.** Until it is, every person's notes stay in their own browser and a warning strip shows at the top of every page.

### Switching it on (one person, about 3 minutes, free)

1. Sign in at [supabase.com](https://supabase.com) with GitHub and click **New project**. Any name and region will do.
2. When it has finished setting up, open **SQL Editor**, paste this and press **Run**:

   ```sql
   create table if not exists notes (
     id      text primary key,
     author  text not null,
     anchor  text not null,
     kind    text not null default 'note',
     text    text not null,
     ts      bigint not null
   );

   alter table notes enable row level security;

   create policy "team can read"   on notes for select using (true);
   create policy "team can write"  on notes for insert with check (true);
   create policy "team can delete" on notes for delete using (true);
   ```

3. Open **Project Settings → API**, copy the **Project URL** and the **anon / public** key into the top of `assets/config.js`:

   ```js
   window.TK_SUPABASE_URL = "https://xxxxxxxx.supabase.co";
   window.TK_SUPABASE_KEY = "eyJ...";
   ```

4. Commit and push. Sharing is on for the whole team from that moment.

### For everyone else

Nothing. Open the link, pick your name, write notes. No account, no token, no GitHub.

New notes from other people appear on their own within about 20 seconds, and immediately when you switch back to the tab.

### About the anon key

The anon key is designed to live in a public web page — it is not a password. What it can do is decided entirely by the row-level security policies above, which allow reading, adding and deleting notes on this one table and nothing else. **Do not** paste the `service_role` key into this file; that one is a real secret.

Anyone with the board link can read and write the notes. That is the intent for a team board. If the notes need to be private, make the repository private and host the page somewhere that requires a login.

### If the connection drops

Nothing is lost. Notes written while offline are kept in the browser, marked **not synced**, and sent automatically once the board can reach the server again.

### The older GitHub-issue option

If you would rather not use Supabase, the board can store notes as comments on a GitHub issue instead — set `TK_ISSUE` in `assets/config.js`, and each person adds their own fine-grained token (Issues: read & write) under **⚙ → Use a GitHub issue instead**. It only works for people who have a GitHub account and repo access, which is why Supabase is the default.

## The team

| Person | Colour |
|---|---|
| Helmy | yellow |
| Yousef | green |
| Amin | cyan |
| Peter | orange |
| Wael | red |
| Bassam | black |

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
