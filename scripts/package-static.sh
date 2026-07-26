#!/usr/bin/env bash
set -euo pipefail

out_dir="${1:-dist}"
rm -rf "$out_dir"
mkdir -p "$out_dir"

cp index.html app.css LICENSE.txt manifest.webmanifest sw.js "$out_dir/"
cp -R assets src vendor "$out_dir/"

asset_version="$(grep -oE 'app\.css\?v=[0-9]+' index.html | sed 's/.*=//' | head -1)"
build_commit="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
build_date="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

cat > "$out_dir/src/buildInfo.js" <<EOF
export const APP_NAME = 'HànHàn';
export const APP_VERSION = '0.1.0';
export const APP_LICENSE = 'AGPL-3.0-or-later';
export const CONTACT_EMAIL = 'vb@viblo.se';
export const SOURCE_URL = 'https://github.com/vibloteket/hanhan';
export const ASSET_VERSION = '${asset_version:-unknown}';
export const BUILD_COMMIT = '$build_commit';
export const BUILD_DATE = '$build_date';
EOF

# Browser module graphs can otherwise keep old JS modules cached even when
# index.html changes. In the packaged copy, add the asset version to every
# relative JS import so each deploy has a fresh module URL graph.
find "$out_dir/src" -name '*.js' -print0 | while IFS= read -r -d '' file; do
  perl -0pi -e "s/from '((?:\.\.?\/)[^']+\.js)'/from '\$1?v=${asset_version:-unknown}'/g; s/import\('((?:\.\.?\/)[^']+\.js)'\)/import('\$1?v=${asset_version:-unknown}')/g" "$file"
done

find "$out_dir" -name '.DS_Store' -delete

# Build an exact, versioned offline shell from every deployed app file. The
# service worker itself is excluded because browsers update it separately.
mapfile -t offline_files < <(
  cd "$out_dir"
  find . -type f ! -name 'sw.js' ! -name 'CNAME' -print | LC_ALL=C sort
)
offline_json="$(printf '%s\n' "${offline_files[@]}" | node -e "let input=''; process.stdin.on('data', chunk => input += chunk); process.stdin.on('end', () => console.log(JSON.stringify(input.trim().split(/\\n/).filter(Boolean))));")"
perl -0pi -e "s/__CACHE_VERSION__/${asset_version:-unknown}/g; s~__APP_SHELL__~$offline_json~g" "$out_dir/sw.js"

echo "Packaged HànHàn static files into $out_dir"
