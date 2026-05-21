#!/usr/bin/env bash
set -euo pipefail

out_dir="${1:-dist}"
rm -rf "$out_dir"
mkdir -p "$out_dir"

cp index.html app.css "$out_dir/"
cp -R assets src vendor "$out_dir/"

find "$out_dir" -name '.DS_Store' -delete

echo "Packaged Mandarin Mode static files into $out_dir"
