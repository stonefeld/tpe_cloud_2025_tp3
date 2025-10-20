#!/bin/bash

print_error() {
    echo "Error: $1"
    exit 1
}

command -v uv &>/dev/null 2>&1 || print_error "uv command not found. Please install uv to proceed."

LAYERS_PATH="$PWD/layers"
[ -d "$LAYERS_PATH" ] || mkdir -p "$LAYERS_PATH"

pushd "$LAYERS_PATH" &>/dev/null

PYTHON_DIR="python"
[ -d "$PYTHON_DIR" ] && rm -rf "$PYTHON_DIR"

echo "Installing psycopg2-binary for Python 3.11..."
mkdir -p "$PYTHON_DIR"
uv run --python 3.11 pip install psycopg2-binary -t "$PYTHON_DIR"

ZIP_FILE="layer_psycopg2.zip"
echo "Creating layer ZIP: $ZIP_FILE"

if zip -r "$ZIP_FILE" "$PYTHON_DIR" &>/dev/null 2>&1; then
    echo "Layer created successfully: $ZIP_FILE"
    echo "Size: $(du -h "$ZIP_FILE" | cut -f1)"
else
    print_error "Failed to create layer ZIP."
fi

popd &>/dev/null
