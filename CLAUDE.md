# Working agreement — Edwards Financial website

## Autonomy
I do the front-end review in chat, so once a task is built, take it all the way to live without pausing for approval: commit, push, and get it onto `main`. Default to full autonomy on git, gh, and file operations — don't stop to ask permission for routine steps.

## Deploy workflow
- Host: Cloudflare Pages — it auto-deploys from the `main` branch. Getting changes onto `main` is what publishes them live.
- Push straight to `main`. Do NOT open pull requests unless I explicitly ask. (PRs sit on a branch and don't deploy, and the gh PR path causes auth friction — avoid it.)
- Repo: github.com/Marquise007/edwards-financial-website

## The one rule that stays
You don't need my approval, but ALWAYS print the diff before committing, so I can see exactly what shipped. Hands-off, but never silent.

## Avoid without flagging first
Before anything destructive — force-push, history rewrite, deleting files, or bulk find-and-replace across many files — show me the diff and say so explicitly, then proceed. Recoverable via git, but I want to see it.

## Site facts
- Clean URLs: Cloudflare strips `.html`, so `resources/foo.html` serves at `/resources/foo`. Use clean paths in canonical tags, internal links, and nav.
- Domain: edwardsfinancialassociates.com
- Brand: navy #0d1e3a, gold #b8972e. Headings Cormorant Garamond, body Montserrat. "Protect · Grow · Legacy." Refer to me as "consultant," not "advisor."
- New tools/pages go under /resources and should be linked from the /resources hub (resources/index.html) and carry their own <title>/meta description/canonical/OG tags matching existing pages.
- Reuse the shared site nav/header and footer on new pages so they feel native.

## SEO defaults for any new page
Set a unique <title>, meta description, canonical (clean URL, full https://edwardsfinancialassociates.com/...), and Open Graph tags (og:title, og:description, og:type, og:url, og:site_name). Skip og:image unless I provide one. Add the page to the /resources hub and link it from a relevant article where it fits.
