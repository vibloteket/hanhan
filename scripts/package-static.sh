#!/usr/bin/env bash
set -euo pipefail

out_dir="${1:-dist}"
rm -rf "$out_dir"
mkdir -p "$out_dir"

cp index.html app.css LICENSE.txt "$out_dir/"
cp -R assets src vendor "$out_dir/"

asset_version="$(grep -oE 'app\.css\?v=[0-9]+' index.html | sed 's/.*=//' | head -1)"
build_commit="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
build_date="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

cat > "$out_dir/src/buildInfo.js" <<EOF
export const APP_VERSION = '0.1.0';
export const APP_LICENSE = 'AGPL-3.0-or-later';
export const CONTACT_EMAIL = 'vb@viblo.se';
export const ASSET_VERSION = '${asset_version:-unknown}';
export const BUILD_COMMIT = '$build_commit';
export const BUILD_DATE = '$build_date';
EOF

find "$out_dir" -name '.DS_Store' -delete

echo "Packaged Mandarin Mode static files into $out_dir"
