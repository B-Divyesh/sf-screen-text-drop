#!/bin/sh
set -eu
repo="https://github.com/B-Divyesh/sf-screen-text-drop/releases/latest/download"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT INT TERM
manifest="$tmp_dir/latest.json"
curl -fsSL "$repo/latest.json" -o "$manifest"
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) key="macos-arm64" ;;
  Darwin-*) key="macos-x64" ;;
  Linux-*) key="linux-x64" ;;
  *) echo "Unsupported platform. Use the release page instead." >&2; exit 1 ;;
esac
read_values="$(python3 - "$manifest" "$key" <<'PY'
import json,sys
x=json.load(open(sys.argv[1]))['platforms'][sys.argv[2]]
print(x['url']); print(x['sha256']); print(x['name'])
PY
)"
url="$(printf '%s\n' "$read_values" | sed -n '1p')"
expected="$(printf '%s\n' "$read_values" | sed -n '2p')"
name="$(printf '%s\n' "$read_values" | sed -n '3p')"
curl -fL "$url" -o "$tmp_dir/$name"
actual="$(shasum -a 256 "$tmp_dir/$name" | awk '{print $1}')"
[ "$actual" = "$expected" ] || { echo "Checksum mismatch; nothing installed." >&2; exit 1; }
destination="$HOME/Downloads/$name"
mv "$tmp_dir/$name" "$destination"
echo "Verified SHA256 and saved Screen Text Drop to $destination"
echo "Open the package to install. Builds are unsigned; on macOS, right-click and choose Open."
