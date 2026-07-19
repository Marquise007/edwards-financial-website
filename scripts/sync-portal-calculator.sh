#!/usr/bin/env bash
#
# sync-portal-calculator.sh
# ---------------------------------------------------------------------------
# Run this after you re-upload resources/california-pension-calculator.html
# from Downloads. It:
#
#   1) Ensures the PUBLIC calculator hides the on-screen "Print / Save as PDF"
#      helper bar inside the GENERATED PDF (the .no-print div; html2canvas
#      ignores @media print, so it has to be hidden explicitly at capture time).
#
#   2) Rebuilds the PARTNER-PORTAL copy (tool-california-pension-calculator.html)
#      from the public file, applying the three portal tweaks:
#         - remove the <script src="/resources/gate.js"> line
#           (the portal has its own Supabase login — no double gate)
#         - repoint the top back-link to the Partner portal
#         - add a noindex,nofollow robots meta (partner-only duplicate page)
#
# Idempotent and self-verifying: safe to run repeatedly. It does NOT commit —
# review `git diff` and commit yourself.
# ---------------------------------------------------------------------------
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

SRC="resources/california-pension-calculator.html"
DST="tool-california-pension-calculator.html"

# Detect ANY existing .no-print hide in the inject (the calculator may already ship one,
# under any wording) so we never insert a duplicate.
HELPER_DETECT="no-print').forEach"
HELPER_LINE="      document.querySelectorAll('.no-print').forEach(function(el){el.style.display='none';}); /* keep the on-screen print helper out of the generated PDF */"

[ -f "$SRC" ] || { echo "ERROR: $SRC not found — run from anywhere inside the repo." >&2; exit 1; }

# --- 1) Public copy: ensure the PDF inject hides .no-print (idempotent) ------
if grep -qF "$HELPER_DETECT" "$SRC"; then
  echo "- public copy: helper-bar hide already present"
else
  grep -q 'html2pdf().set({' "$SRC" || { echo "ERROR: could not find the html2pdf inject in $SRC (format changed?)." >&2; exit 1; }
  tmp="$(mktemp)"
  awk -v ins="$HELPER_LINE" '
    $0 ~ /html2pdf\(\)\.set\(\{/ && !done { print ins; done=1 }
    { print }
  ' "$SRC" > "$tmp" && mv "$tmp" "$SRC"
  echo "- public copy: inserted helper-bar hide before html2pdf().set({"
fi

# --- 2) Build the portal copy from the (patched) public copy ----------------
# 2a) drop the gate.js line
grep -vF '<script src="/resources/gate.js"></script>' "$SRC" > "$DST"

# 2b) repoint the top back-link (only on the "Back to Resources" line)
sed -i '/Back to Resources/{ s|href="/resources"|href="/portal-partner-dashboard"|; s|Back to Resources|Back to Partner Portal|; }' "$DST"

# 2c) add the noindex robots meta right after the viewport meta, if missing
if ! grep -qi 'name="robots"' "$DST"; then
  sed -i '0,/<meta name="viewport"/ s|\(<meta name="viewport"[^>]*>\)|\1\n<meta name="robots" content="noindex, nofollow"/>|' "$DST"
fi

# --- verify -----------------------------------------------------------------
gate=$(grep -cF 'resources/gate.js' "$DST" || true)
noidx=$(grep -c 'noindex, nofollow' "$DST" || true)
back=$(grep -c 'Back to Partner Portal' "$DST" || true)
helper=$(grep -cF "$HELPER_DETECT" "$DST" || true)

echo "- verification:"
echo "    gate.js lines      (want 0):  $gate"
echo "    noindex meta       (want 1):  $noidx"
echo "    portal back-link   (want >=1):$back"
echo "    helper-bar hide    (want >=1):$helper"

if [ "$gate" = "0" ] && [ "$noidx" -ge 1 ] && [ "$back" -ge 1 ] && [ "$helper" -ge 1 ]; then
  echo "OK  portal copy synced -> $DST"
  echo "    Next: review 'git diff' then commit ($SRC may also have changed)."
else
  echo "FAIL verification did not pass — inspect $DST (source format may have changed)." >&2
  exit 1
fi
