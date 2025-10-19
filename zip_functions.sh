#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUNCTIONS_DIR="${SCRIPT_DIR}/functions"

cd "$FUNCTIONS_DIR"

shopt -s nullglob
for py in *.py; do
  base="${py%.py}"
  zipfile="${base}.zip"
  rm -f "$zipfile"
  zip -j -9 "$zipfile" "$py" > /dev/null
  echo "Created $zipfile"
done

echo "All function zips are up to date in: $FUNCTIONS_DIR"