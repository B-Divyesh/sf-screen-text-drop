#!/bin/sh
set -eu
repo="${SCREEN_TEXT_DROP_RELEASE_BASE:-https://github.com/B-Divyesh/sf-screen-text-drop/releases/latest/download}"
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
if command -v sha256sum >/dev/null 2>&1; then
  actual="$(sha256sum "$tmp_dir/$name" | awk '{print $1}')"
else
  actual="$(shasum -a 256 "$tmp_dir/$name" | awk '{print $1}')"
fi
[ "$actual" = "$expected" ] || { echo "Checksum mismatch; nothing installed." >&2; exit 1; }
if [ "$key" = "linux-x64" ]; then
  install_dir="${SCREEN_TEXT_DROP_INSTALL_DIR:-$HOME/.local/bin}"
  mkdir -p "$install_dir"
  destination="$install_dir/screen-text-drop"
  mv "$tmp_dir/$name" "$destination"
  chmod 755 "$destination"
  echo "Verified SHA256 and installed Screen Text Drop at $destination"
  case ":$PATH:" in
    *":$install_dir:"*) echo "Run screen-text-drop to open it." ;;
    *) echo "Run $destination to open it. Add $install_dir to PATH if you want the screen-text-drop command everywhere." ;;
  esac
else
  download_dir="$HOME/Downloads"
  mkdir -p "$download_dir"
  destination="$download_dir/$name"
  mv "$tmp_dir/$name" "$destination"
  echo "Verified SHA256 and saved Screen Text Drop to $destination"
  echo "Open the package to install. This build is unsigned; right-click it and choose Open."
fi
