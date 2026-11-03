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

   3. Open "Project Settings" (the gear) → "API keys" (or "API").
      Copy the Project URL and the anon / public key into the two
      lines below, between the quotes.

   4. Save this file, commit and push. Done — the whole team shares
      notes from that moment on.

   The anon key is meant to be public: it is designed to sit in a web
   page, and the row-level security policies above are what decide
   what it can do. This board's notes are open to anyone who has the
   link, which is the point — the team reads and writes the same board.
   Do NOT paste the "service_role" key here; that one is a real secret.
   =================================================================== */

window.TK_SUPABASE_URL = "";   // e.g. "https://abcdefghijkl.supabase.co"
window.TK_SUPABASE_KEY = "";   // the anon / public key (a long eyJ... string)


/* ---- Optional: the older GitHub-issue backend --------------------
   Only used when the two Supabase values above are empty. It needs
   every teammate to create their own GitHub token, so Supabase is the
   better choice for a team. Leave these as they are if you use it.   */
window.TK_REPO  = "ahmedamen1/Miro-takhaial";   // owner/repo
window.TK_ISSUE = "";                           // issue number used for notes
