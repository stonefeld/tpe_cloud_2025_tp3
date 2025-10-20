#!/bin/bash

LAYERS_DIR="layers"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAYERS_PATH="$SCRIPT_DIR/$LAYERS_DIR"

# Crear directorio layers si no existe
if [ ! -d "$LAYERS_PATH" ]; then
    echo "Creating layers directory: $LAYERS_PATH"
    mkdir -p "$LAYERS_PATH"
fi

# Crear directorio python para psycopg2
PYTHON_DIR="$LAYERS_PATH/python"
if [ -d "$PYTHON_DIR" ]; then
    echo "Cleaning existing python directory"
    rm -rf "$PYTHON_DIR"
fi

echo "Installing psycopg2-binary for Python 3.11..."
mkdir -p "$PYTHON_DIR"
uv run --python 3.11 pip install psycopg2-binary -t "$PYTHON_DIR"

# Crear el ZIP del layer
ZIP_FILE="$LAYERS_PATH/psycopg2-layer.zip"
echo "Creating layer ZIP: $ZIP_FILE"

cd "$LAYERS_PATH"
if zip -r "psycopg2-layer.zip" python/ > /dev/null 2>&1; then
    echo "✅ Layer created successfully: $ZIP_FILE"
    echo "📦 Size: $(du -h psycopg2-layer.zip | cut -f1)"
else
    echo "❌ Error: Failed to create layer ZIP"
    exit 1
fi

cd "$SCRIPT_DIR"
