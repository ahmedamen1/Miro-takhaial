/* ===================================================================
   SHARED NOTES — fill in the two values below, once, and every
   teammate sees everyone's notes with no setup of their own.
   No account, no token, no GitHub needed on their side.

   HOW TO GET THEM (about 3 minutes, free):

   1. Go to supabase.com and sign in with GitHub. Click "New project".
      Name it anything (e.g. takhail-board). Pick any region close to
      you. Save the database password somewhere — you will not need it
      for this, but Supabase asks for one.

   2. Wait for the project to finish setting up, then open the
      "SQL Editor" in the left sidebar, paste ALL of the SQL below,
      and press Run.

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

   3. Open "Project Settings" (the gear) → "API Keys".
      Copy the Project URL and the PUBLISHABLE key (named either
      "anon / public" or "sb_publishable_...") into the two lines
      below, between the quotes.

   4. Save this file, commit and push. Done — the whole team shares
      notes from that moment on.

   The publishable key is meant to be public: it is designed to sit in
   a web page, and the row-level security policies above are what
   decide what it can do. This board's notes are open to anyone who
   has the link, which is the point — the team reads and writes the
   same board.

   NEVER put the SECRET key here (named "service_role" or
   "sb_secret_..."). It bypasses every security policy. If one is ever
   exposed, rotate it immediately in Project Settings → API Keys.
   =================================================================== */

window.TK_SUPABASE_URL = "https://gomkmxiaamhlxevjxhhi.supabase.co";
window.TK_SUPABASE_KEY = "sb_publishable_rus8F-jJkK_Gtvv5Ra3Sdw_wIpqUGEh";


/* ---- Optional: the older GitHub-issue backend --------------------
   Only used when the two Supabase values above are empty. It needs
   every teammate to create their own GitHub token, so Supabase is the
   better choice for a team. Leave these as they are if you use it.   */
window.TK_REPO  = "ahmedamen1/Miro-takhaial";   // owner/repo
window.TK_ISSUE = "";                           // issue number used for notes
