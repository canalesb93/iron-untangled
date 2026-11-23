# Contributing to Iron Untangled

Thank you for wanting to help. This is a fan project, and it gets better every time a reader says "that's not quite right". Corrections to facts are the most valuable thing you can send: a station number, a line, who was where, a recap beat that is off, a reveal that comes a chapter too early.

The repository lives at [github.com/canalesb93/iron-untangled](https://github.com/canalesb93/iron-untangled). You don't need to write code. An [issue](https://github.com/canalesb93/iron-untangled/issues/new/choose) saying "in chapter 12 the app says X, but the book says Y" is a great contribution.

## Spoilers in issues and pull requests

Issues and PRs talk about the book, so they will contain spoilers. To keep the list safe to browse:

- **Start every title with the chapter**, like `[Ch 12] Wrong station number for a stop` or `[Ch 30] Recap beat out of order`.
- **Keep plot details out of titles.** Put them in the body, where people only see them if they open it.
- If something spans several chapters, use the earliest one the fix touches in the title.

## Ground rules for content

- **Paraphrase only.** Write everything in your own words. Never paste text from the book, not even a sentence. Short, factual names (a station number, a character's name) are fine.
- **Cite a chapter.** Every PR that changes content says which chapter supports it ("Ch 17: they get off at station N"). If you also checked the fan wiki or a summary, say so, but the book is the authority.
- **No copyrighted art.** No cover art, fan art, screenshots of the book or images found online. Original drawings in the style of `src/portraits.ts` are welcome.

## How reveal chapters work

Everything in `content/` carries the chapter at which the book reveals it. Chapter numbers mean "the reader has finished chapter N" (0 is "not started yet").

- An entity's `revealAt` is the first chapter whose reader may know it exists. Before that chapter, its name does not appear anywhere.
- `stages: [{ at, text }]` are notes that accumulate: a reader at chapter N sees every stage with `at <= N`. Add a new stage rather than rewriting an old one when the book reveals more later.
- There must be a stage at the reveal chapter itself, and none before it.

**When unsure, use the later chapter.** Showing something one chapter late is a small inaccuracy; showing it one chapter early is a spoiler. Spoilers are the one mistake this project can't afford.

Also write each stage as of that chapter, without hindsight. A note at chapter 5 must not hint at what happens in chapter 20.

## Where things live

All content is TypeScript under `content/`; the schema with comments is `content/types.ts`.

| To add or fix… | Edit | Notes |
|---|---|---|
| A chapter recap, goal or location | `content/chapters.ts` | `beats` are the recap bullets, `where` is a few words, `goal` is what the party wants as of the end of that chapter. |
| A station | `content/map.ts` (`stations`), or `content/directory.ts` for stations listed only in the directory | Give it `num` if it has a number, a `revealAt`, `kinds` (which can change by chapter) and `stages`. Leave out `pos` if it should only appear in the directory. |
| A line | `content/map.ts` (`lines`) | Coloured lines use `arm` and `spans`; named routes use `legs` through station ids. |
| A trip (the party's route) | `content/map.ts` (`hops`) | One hop per leg: `at` (chapter), `from`, `to`, `via` (line id or `'foot'`), and `who` if not everyone went. |
| A person | `content/people.ts` | Add their `whereabouts` by chapter too (`party`, `away`, `off`, `dead`, `unknown`). |
| A rule of the floor, creature or term | `content/lore.ts`, `content/glossary.ts` | |
| An open question and its answer | `content/questions.ts` | `closedAt` is the chapter that answers it. |

## Secret terms and the spoiler lint

The lint stops any word from appearing before the reader should know it. By default an entity's `name` is its secret: it must not appear in any bundle (in any entry's text, not just its own) before `revealAt`.

- If an entity is also known by other words (a nickname, a short form, a later name), list them in `secret: [...]` so they are guarded too.
- If a fact isn't tied to an entity (a twist, a turn of phrase that gives something away), add an embargo in `content/lore.ts`: `{ until, terms, why }`.
- If the lint complains, it tells you the chapter, the kind of problem and the term. Usually the fix is a later `at`, or rewording an earlier note so it doesn't name the thing.

Never silence the lint by weakening a `secret` or an embargo unless the original was genuinely wrong; say why in the PR.

## Check your change

Requires Node 24 (`.node-version`).

```bash
npm install
npm run dev            # see it in the browser while you work
npm run build          # spoiler lint, bundles, type-check, production build
```

Then the rendered-page test, which opens every chapter in a real browser:

```bash
npx playwright install chromium   # first time only
npm run preview                   # serves dist/ on port 4317; leave it running
npm run test:spoilers             # in a second terminal; takes a few minutes
```

CI runs the same checks on every pull request, so it's fine to open a PR and let it tell you.

## Opening the pull request

- Title: `[Ch N] short, spoiler-free summary`.
- In the description: what you changed, the chapter that supports it, and the PR checklist.
- Keep each PR to one topic when you can; small PRs are easier to verify against the book.

## Code and ideas

Bug fixes, accessibility and performance work, and new ideas are welcome too. For anything large, open a "Feature or idea" issue first so we can talk it through. Whatever you change in the UI must keep the spoiler design described in the README: the app code ships no story content, and the browser only fetches bundles for chapters the reader has unsealed.

By contributing you agree that your code is released under the MIT License and your written content under CC BY 4.0, as described in [LICENSE](LICENSE) and [NOTICE](NOTICE).
