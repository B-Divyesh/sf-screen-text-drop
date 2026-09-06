#!/usr/bin/env sh
set -eu

test_root="$(mktemp -d)"
trap 'rm -rf "$test_root"' EXIT INT TERM
release_dir="$test_root/release"
consumer_home="$test_root/consumer-home"
install_dir="$test_root/consumer-bin"
mkdir -p "$release_dir" "$consumer_home"

asset_name="screen-text-drop-test.AppImage"
printf '#!/bin/sh\nprintf "Screen Text Drop test artifact\\n"\n' > "$release_dir/$asset_name"
checksum="$(sha256sum "$release_dir/$asset_name" | awk '{print $1}')"
printf '{\n  "version": "test",\n  "platforms": {\n    "linux-x64": {\n      "name": "%s",\n      "url": "file://%s/%s",\n      "sha256": "%s"\n    }\n  }\n}\n' "$asset_name" "$release_dir" "$asset_name" "$checksum" > "$release_dir/latest.json"

HOME="$consumer_home" \
SCREEN_TEXT_DROP_RELEASE_BASE="file://$release_dir" \
SCREEN_TEXT_DROP_INSTALL_DIR="$install_dir" \
sh site/public/install.sh

installed="$install_dir/screen-text-drop"
[ -x "$installed" ]
cmp "$release_dir/$asset_name" "$installed"
[ ! -e "$consumer_home/Downloads" ]
"$installed" | grep -q 'Screen Text Drop test artifact'
printf 'Linux installer created an executable, checksum-matched command in a clean home.\n'
