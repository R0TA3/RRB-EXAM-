# RRB NTPC CBT Practice Portal

Static, bilingual (English / Malayalam) CBT-1 and CBT-2 practice site for GitHub Pages. No server, database, secrets or paid APIs. Progress is stored in the browser (localStorage).

## Honest scope
- The bank is **finite**. It does not contain every question ever asked and cannot contain future questions. "Millions of questions" is not something a static repo can honestly promise; this project gives you the **structure** to grow to tens of thousands.
- Every question carries a `source`: `original` (written for practice, **not** an exam question), `pyq-verified` or `official`. The last two **require a `reference`** (paper, date, shift, URL) — the validator rejects them otherwise. The starter dataset contains **only `original`** questions. Add real PYQs only from material you are entitled to use (e.g. official RRB releases).

## Exam mode rules
CBT-1: 100 Q (40 GA, 30 Maths, 30 Reasoning), 90 min. CBT-2: 120 Q (50 GA, 35 Maths, 35 Reasoning), 90 min.
Timer is sticky at the top, survives refresh (end timestamp stored). Palette: answered / not answered / not visited / marked. No answer, mark or explanation is shown until **Finish Exam → confirm**. Scoring: +1 correct, −1/3 wrong, 0 unanswered. If the bank has fewer questions than the pattern needs, the test uses what exists and shows a shortfall warning.
Practice / Question Bank pages are *not* exam mode and reveal the answer after you choose an option.

## Deploy on GitHub Pages
1. Create a repo, upload the contents of this folder to the root.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
3. Open `https://<user>.github.io/<repo>/`.
Local test: `python3 -m http.server` then open http://localhost:8000 (fetch() needs http, not file://).

## Adding questions
1. Create `data/<subject>/pack-002.json` (`{"questions":[...]}` or a bare array), following `data/question.schema.json`.
2. Add `"<subject>/pack-002.json"` to `data/manifest.json`.
3. Run `node tools/validate.mjs`. Commit and push.

**No-code option:** Settings → Import questions (paste/upload JSON). Stored in that browser only.

**Bulk original generation:** `node tools/generate-percent.mjs 500 002` writes 500 original bilingual percentage questions and registers the pack. Use it as a template for other arithmetic topics.

## Scaling
The loader fetches every pack in the manifest. That is fine up to roughly 10–20k questions. Beyond that, split manifest entries by subject/topic and load lazily by the selected subject (change `Bank.load` in `js/app.js`). Keep packs ≤ ~1–2 MB each.

## Structure
`index.html`, `css/style.css`, `js/{app,exam,timer,results,language}.js`, `languages/{en,ml}.json`, `data/syllabus.json`, `data/manifest.json`, `data/<subject>/*.json`, `tools/validate.mjs`, `tools/generate-percent.mjs`.

## Known limits
Malayalam translations of the starter content should be reviewed by a native speaker. Current-affairs content is deliberately omitted (it goes stale); add dated packs yourself.
