# Domain Migration Runbook
## edwardsfinancialandassociates.com -> edwardsfinancialassociates.com
Compiled 2026-07-15. Dashboard paths verified against Cloudflare, Supabase, Resend, and Google docs on that date. If a UI has moved, trust the label names over the click path.

**Code status: DONE.** All 47 old-domain references in this repo were replaced (18 files: canonicals, og:url, og:image, mailto links, and the Resend defaults in functions/api/partner-inquiry.js). sitemap.xml and robots.txt were created for the new domain. Do NOT deploy until Steps 1-6 are complete or the contact form will bounce and send-fail.

---

### Step 1 — New domain live on Pages (manual, ~5 min)
Dashboard -> Workers & Pages -> select the Pages project -> **Custom domains** -> **Set up a domain**.
- Add `edwardsfinancialassociates.com`, then repeat for `www.edwardsfinancialassociates.com`.
- Apex domains require the domain to be a zone on this same Cloudflare account. If it was bought through Cloudflare Registrar it already is; if bought elsewhere, first do Dashboard -> Add a site -> enter the domain -> point its nameservers at Cloudflare from the registrar.
- Cloudflare creates the CNAME records automatically. Do not add them by hand (doing so before binding causes a 522).
- Result: site is live on BOTH domains. Nothing has changed for visitors on the old one.

### Step 2 — Google Workspace on the new domain (manual purchase)
workspace.google.com -> Get started -> use the new domain -> create joshua@edwardsfinancialassociates.com. Verify domain ownership (Google gives a TXT record; add it in the new zone's DNS, or hand it to Claude Code).

### Step 3 — Run migrate/add-dns-records.sh (code)
Creates on the new zone: MX `smtp.google.com` priority 1 (current single-record config for new Workspace accounts), SPF, DMARC (p=none to start), and Google DKIM once you paste the generated value. Also adds the proxied `www` A record on the old zone that Step 8's redirect needs.
- Token: My Profile -> API Tokens -> Create Token -> "Edit zone DNS" template + manually add Zone:Read, scoped to both zones only. Never the Global API Key.
- In Workspace Admin: Apps -> Google Workspace -> Gmail -> Authenticate email -> Generate new record -> paste value into the script's GOOGLE_DKIM_VALUE -> rerun -> back in Admin click Start authentication.
- Then in the Workspace setup tool, click Activate Gmail. MX recognition can take up to 72h; usually under an hour.
- TEST: send an email to joshua@edwardsfinancialassociates.com from another account and confirm it arrives.

### Step 4 — Resend: DONE via chat on 2026-07-15 (records baked into the script)
The old domain was removed from Resend and `edwardsfinancialassociates.com` was created (domain ID b65945f0-83de-48f4-ae7a-23b44d35675e, status not_started). Its three DNS records are already coded into add-dns-records.sh, so Step 3 adds them automatically. After the script runs, tell chat-Claude and it will trigger verification from the connected Resend account; status must reach **verified**.
- Until verified, the contact form cannot send from the new address. Bridge: Pages -> Settings -> Variables and Secrets -> add variable `MAIL_FROM` = `onboarding@resend.dev` (the function's env override beats the code default). Delete the variable once verified.

### Step 5 — Supabase Auth URLs (manual, ~2 min)
supabase.com/dashboard -> project -> **Authentication** (left sidebar) -> **URL Configuration** tab.
- **Site URL** -> `https://edwardsfinancialassociates.com` (this is what password-reset and confirmation emails use).
- **Redirect URLs** -> add `https://edwardsfinancialassociates.com/**` and `https://www.edwardsfinancialassociates.com/**`; keep the old domain entries during transition. Save.
- API keys do not change; they are project-scoped.

### Step 6 — Deploy the repo (code, your normal flow)
Claude Code in the local clone -> review diff -> commit to main -> Cloudflare auto-builds. Hard-refresh.

### Step 7 — Test on the new domain before flipping anything
- Homepage, /resources, calculators load over https on apex and www.
- Partner portal: log in, log out, and trigger one password reset (the reset email must link to the NEW domain — that's the Step 5 setting).
- Contact form on /professional-partners: submit a test; confirm it arrives at the new inbox.

### Step 8 — 301 the old domain (manual, ~3 min)
Old zone -> **Rules** -> Overview -> Create rule -> **Redirect Rule**:
- When incoming requests match: Field **Hostname**, Operator **equals**, Value `edwardsfinancialandassociates.com` — or Expression Editor: `(http.host eq "edwardsfinancialandassociates.com") or (http.host eq "www.edwardsfinancialandassociates.com")`
- Then: Type **Dynamic**, Expression `concat("https://edwardsfinancialassociates.com", http.request.uri.path)`, Status **301**, **Preserve query string** enabled. Deploy.
- This keeps every old link working and passes SEO equity. Keep the old domain registered indefinitely; it is now a redirect shell.
- Optional cleanup after confirming the redirect works: remove the old domain from the Pages project's Custom domains list.

### Step 9 — Search Console
- Add `edwardsfinancialassociates.com` as a Domain property (DNS TXT verification).
- Submit `https://edwardsfinancialassociates.com/sitemap.xml`.
- On the OLD property: Settings -> **Change of address** -> select the new property. Requires the 301s from Step 8 to be live first.

### Step 10 — Kill the old Workspace + trailing edges
- Only after Steps 3 and 7 are confirmed: Workspace Admin (old account) -> Billing -> cancel subscription. Nothing else logs in with that address (logins are jedwards.finance@gmail.com).
- Update the printed URL/email everywhere it lives: Calendly profile, Apollo sequences and signatures, Instantly signatures, LinkedIn, iPostal1 records, the 13 cousin domains' redirect targets (they still work via the 301 chain; direct is one hop cleaner).
- Cloudflare env check: Pages -> Settings -> Variables — if MAIL_TO or MAIL_FROM overrides exist from earlier, update or delete them so the new code defaults apply.
