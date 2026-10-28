// The partner gate.
//
// The planner is linked from Partner Access and holds client plans, so it answers to the
// same check the rest of the portal does: a Supabase session, and an account the
// crm_is_operator function recognises as an approved partner. One session alone is not
// enough, which is the portal's own rule and not a new one invented here.
//
// The configuration is injected into the deployed copy by sync-to-site.sh and is absent
// from this source, so a local build runs ungated and the deployed one never can. That is
// deliberate: the escape is the absence of configuration, not a hostname test that could
// be spoofed by pointing a name at the site.
//
// This is client side, exactly like the rest of the portal. It stops a visitor who has
// the URL. It does not stop somebody reading the page source, and it is not a substitute
// for row level security on the data itself.

const LOGIN = '/portal-partner-login.html';

function reveal() {
  document.body.classList.remove('gating');
}

function bounce() {
  // Leave the page hidden on the way out, so nothing flashes before the redirect.
  location.replace(LOGIN);
  // Never resolve: whatever awaited this must not continue on a failed check.
  return new Promise(() => {});
}

export async function requirePartner() {
  const cfg = window.EFA_PARTNER_GATE;
  if (!cfg || !cfg.url || !cfg.key) { reveal(); return; }   // ungated local build

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    // The SDK is part of the gate. If it did not load, the check cannot be made, and an
    // unmade check is a failed one.
    return bounce();
  }

  try {
    const sb = window.supabase.createClient(cfg.url, cfg.key);
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return bounce();

    const { data: ok, error } = await sb.rpc('crm_is_operator');
    if (!error && ok === false) {
      await sb.auth.signOut();
      return bounce();
    }
    // An RPC error is a network or server fault rather than a refusal, so the session
    // stands. This matches what the portal does.
    window.EFA_PARTNER = { email: session.user?.email ?? null };
  } catch (e) {
    return bounce();
  }
  reveal();
}
