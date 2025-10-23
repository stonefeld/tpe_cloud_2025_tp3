#!/bin/bash

print_error() {
    echo "Error: $1"
    exit 1
}

command -v npm &>/dev/null 2>&1 || print_error "npm command not found. Please install Node.js and npm to proceed."

RESOURCES_DIR="$PWD/resources"
[ -d "$RESOURCES_DIR" ] || print_error "Resources directory not found."

pushd "$RESOURCES_DIR" &>/dev/null

echo "Installing Tailwind CSS and dependencies..."
npm install

echo "Compiling Tailwind CSS..."
npm run build:css || print_error "Tailwind CSS compilation failed."

echo "Tailwind CSS compiled successfully."
popd &>/dev/null
