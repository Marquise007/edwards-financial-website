#!/usr/bin/env bash
# ============================================================================
# Edwards Financial — domain migration DNS helper
# Adds email DNS records to the NEW zone (edwardsfinancialassociates.com)
# and the www redirect record to the OLD zone, via the Cloudflare API.
#
# RUN THIS THROUGH CLAUDE CODE. It will prompt you for the values marked
# FILL_ME below (DKIM keys only exist after you create the Workspace and
# Resend accounts — see migrate/MIGRATION.md steps 4 and 6).
#
# TOKEN: create at dash.cloudflare.com -> My Profile -> API Tokens ->
# Create Token -> "Edit zone DNS" template, then ALSO add Zone -> Zone -> Read
# (the template omits it), scoped to BOTH zones:
#   edwardsfinancialassociates.com  and  edwardsfinancialandassociates.com
# Do NOT use the Global API Key.
#
# API endpoint: POST /zones/{zone_id}/dns_records  (Bearer token auth)
# Verified against Cloudflare docs 2026-07-15.
# ============================================================================
set -euo pipefail

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN first (export CLOUDFLARE_API_TOKEN=...)}"

NEW_DOMAIN="edwardsfinancialassociates.com"
OLD_DOMAIN="edwardsfinancialandassociates.com"
API="https://api.cloudflare.com/client/v4"
AUTH=(-H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json")

# ---- FILL_ME values (paste from the respective dashboards) -----------------
GOOGLE_DKIM_VALUE="FILL_ME"        # Workspace Admin -> Apps -> Google Workspace -> Gmail -> Authenticate email -> Generate new record (TXT value, starts v=DKIM1;)
GOOGLE_DKIM_HOST="google._domainkey"
DMARC_RUA="joshua@${NEW_DOMAIN}"   # where aggregate reports go
# Resend gives you its exact records (names + values) at resend.com/domains
# after you add the domain there. Paste each below or let Claude Code add them.
# -----------------------------------------------------------------------------

zone_id() { # no python3/jq on this machine — parse the first result[0].id (a 32-hex zone id) with grep
  curl -s "${API}/zones?name=$1" "${AUTH[@]}" \
    | grep -oE '"id":"[0-9a-f]{32}"' | head -1 | grep -oE '[0-9a-f]{32}' || true
}

add_record() { # $1 zone_id, $2 json payload, $3 label
  echo "-> $3"
  RESP=$(curl -s -X POST "${API}/zones/$1/dns_records" "${AUTH[@]}" --data "$2")
  if printf '%s' "$RESP" | grep -q '"success":true'; then
    echo "   OK"
  else
    echo "   ERROR: $RESP"
  fi
}

NEW_ZONE=$(zone_id "$NEW_DOMAIN"); OLD_ZONE=$(zone_id "$OLD_DOMAIN")
[ -n "$NEW_ZONE" ] || { echo "New zone not found in this Cloudflare account. Add $NEW_DOMAIN as a site first (MIGRATION.md step 1)."; exit 1; }
[ -n "$OLD_ZONE" ] || { echo "Old zone not found — check token scope includes $OLD_DOMAIN."; exit 1; }
echo "New zone: $NEW_ZONE"; echo "Old zone: $OLD_ZONE"

# ---- NEW zone: Google Workspace mail records --------------------------------
# MX + SPF were added by Google's own Cloudflare authorization on 2026-07-15
# (the ASPMX 5-record set + SPF TXT). Do NOT add smtp.google.com on top.
if [ "$GOOGLE_DKIM_VALUE" != "FILL_ME" ]; then
  add_record "$NEW_ZONE" "{\"type\":\"TXT\",\"name\":\"$GOOGLE_DKIM_HOST\",\"content\":\"$GOOGLE_DKIM_VALUE\",\"ttl\":1}" "Google DKIM"
else
  echo "-> SKIPPED Google DKIM (fill GOOGLE_DKIM_VALUE after generating it in Workspace Admin)"
fi
add_record "$NEW_ZONE" "{\"type\":\"TXT\",\"name\":\"_dmarc\",\"content\":\"v=DMARC1; p=none; rua=mailto:$DMARC_RUA\",\"ttl\":1}" "DMARC (p=none to start; tighten to quarantine after 2-4 clean weeks)"

# ---- OLD zone: www record so the redirect rule catches www -------------------
# 192.0.2.1 is Cloudflare's documented placeholder for redirect-only hostnames.
add_record "$OLD_ZONE" "{\"type\":\"A\",\"name\":\"www\",\"content\":\"192.0.2.1\",\"proxied\":true,\"ttl\":1}" "OLD zone: proxied A www -> 192.0.2.1 (redirect catcher)"

# ---- NEW zone: Resend records (issued 2026-07-15 for domain ID b65945f0-...) --
# These live on the "send" subdomain + resend._domainkey, so they do NOT
# collide with the Google Workspace records on the apex above.
add_record "$NEW_ZONE" "{\"type\":\"TXT\",\"name\":\"resend._domainkey\",\"content\":\"p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDnyXQ3K8UBhBWLQ09GKlLq7r9TaYbd9MCUyM2sg1UutuIScr2JVN16o6ru43VJNXuAz7Smd+8nPpBFIqMs5g8N7Yq6d1oBUn/R3UIh0jk7wdZ2aWoPTXTFXE6uCLLSYmTFzrcegdTIm3ETpaFuCE/iPxPuF4EXRPa9vPl6gGuRQQIDAQAB\",\"ttl\":1}" "Resend DKIM (resend._domainkey)"
add_record "$NEW_ZONE" "{\"type\":\"MX\",\"name\":\"send\",\"content\":\"feedback-smtp.us-east-1.amazonses.com\",\"priority\":10,\"ttl\":1}" "Resend return-path MX (send)"
add_record "$NEW_ZONE" "{\"type\":\"TXT\",\"name\":\"send\",\"content\":\"v=spf1 include:amazonses.com ~all\",\"ttl\":1}" "Resend SPF (send)"

echo ""
echo "DONE. Records added. Tell chat-Claude the script ran, and it will trigger"
echo "Resend verification for you. Still manual (dashboard only):"
echo "  1. Pages custom domains (MIGRATION.md step 1)"
echo "  2. Redirect rule on the old zone (MIGRATION.md step 8 — exact settings included)"
