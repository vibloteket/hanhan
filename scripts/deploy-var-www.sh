#!/usr/bin/env bash
set -euo pipefail

site_name="${1:-hanhan}"
target="/var/www/${site_name}"

if [[ ! "$site_name" =~ ^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])$ ]]; then
  echo "Invalid site name: $site_name" >&2
  exit 2
fi

case "$site_name" in
  pc|picoclaw|m|www|nanobot|nb|cgi-bin|learn-chinese|mandarin-mode)
    echo "Blocked site name: $site_name" >&2
    exit 2
    ;;
esac

if [[ ! -d /var/www || ! -w /var/www ]]; then
  echo "/var/www does not exist or is not writable by $(whoami)." >&2
  echo "Ask the host to create /var/www and make it writable, then rerun this script." >&2
  exit 1
fi

stage="$(mktemp -d)"
cleanup() { rm -rf "$stage"; }
trap cleanup EXIT

./scripts/package-static.sh "$stage/public"
rm -rf "$target"
mkdir -p "$target"
cp -R "$stage/public/." "$target/"

echo "Deployed HànHàn to $target"
echo "Expected URL: https://${site_name}.viblo.se/"
