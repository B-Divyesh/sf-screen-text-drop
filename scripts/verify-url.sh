#!/usr/bin/env bash
set -euo pipefail
url="${1:?usage: scripts/verify-url.sh URL}"
html="$(curl --fail --silent --show-error "$url")"
[[ "$html" == *'<html lang="'* ]] || { echo 'missing html lang'; exit 1; }
[[ "$html" == *'<title>'*'</title>'* ]] || { echo 'missing title'; exit 1; }
[[ "$html" == *'<main'* ]] || { echo 'missing main landmark'; exit 1; }
[[ "$(grep -o '<h1\b' <<<"$html" | wc -l | tr -d ' ')" == "1" ]] || { echo 'expected exactly one h1'; exit 1; }
if grep -Eo '<img[^>]*>' <<<"$html" | grep -Evq 'alt="[^"]*"'; then echo 'image missing alt text'; exit 1; fi
echo "verified $url: title, lang, main, one h1, image alt attributes"
