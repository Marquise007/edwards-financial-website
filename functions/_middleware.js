// Cloudflare Pages middleware: keep repository working files off the public web.
//
// The site deploys from the repo root, so without this the build notes, migration
// scripts and Claude working agreement are served as static files. _routes.json
// limits Functions to /api/*, /schedule and these private paths, so ordinary pages
// never invoke this file. Add a path here AND in _routes.json to hide something new.

const PRIVATE = [
  /^\/claude\.md$/i,
  /^\/readme\.md$/i,
  /^\/package\.json$/i,
  /^\/migrate(\/|$)/i,
  /^\/supabase(\/|$)/i,
  /^\/scripts(\/|$)/i,
];

export async function onRequest(context) {
  const path = new URL(context.request.url).pathname;
  if (!PRIVATE.some((re) => re.test(path))) return context.next();

  // Answer with the site's own 404 page and a real 404 status.
  try {
    const page = await context.env.ASSETS.fetch(new URL('/404', context.request.url));
    if (page.ok) {
      return new Response(page.body, {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
      });
    }
  } catch (e) { /* fall through to a plain 404 */ }
  return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
}
