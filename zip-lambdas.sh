#!/bin/bash

FUNCTIONS_DIR="functions"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUNCTIONS_PATH="$SCRIPT_DIR/$FUNCTIONS_DIR"

if [ ! -d "$FUNCTIONS_PATH" ]; then
    echo "Error: Directory $FUNCTIONS_PATH not found"
    exit 1
fi

for py_file in "$FUNCTIONS_PATH"/*.py; do
    if [ ! -f "$py_file" ]; then
        continue
    fi

    filename=$(basename "$py_file")
    name_without_ext="${filename%.py}"
    zip_filename="${name_without_ext}.zip"
    zip_path="$FUNCTIONS_PATH/$zip_filename"

    echo "Processing: $py_file"

    temp_dir=$(mktemp -d)
    cp "$py_file" "$temp_dir/$filename"

    cd "$temp_dir"
    if zip -q "$zip_path" "$filename"; then
        cd "$SCRIPT_DIR"
        rm -rf "$temp_dir"
    else
        echo "Error: Failed to create ZIP for $filename"
        cd "$SCRIPT_DIR"
        rm -rf "$temp_dir"
    fi
done
