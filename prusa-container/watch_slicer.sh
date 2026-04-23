#!/bin/bash

INPUT_DIR="/input"
OUTPUT_DIR="/output"
CONFIG_FILE="/slicer/config.ini"
SLIC3R_BIN="/Slic3r/slic3r-dist/slic3r"

echo "Watching for STL files in $INPUT_DIR..."

inotifywait -m -e create "$INPUT_DIR" --format "%f" | while read FILE
do
    if [[ "$FILE" == *.stl ]]; then
        echo "New STL detected: $FILE"
        
        # Remove any timestamp prefix (numbers followed by hyphen)
        CLEAN_NAME=$(echo "$FILE" | sed -E 's/^[0-9]+-//')
        BASE_NAME="${CLEAN_NAME%.stl}"
        
        # Ensure output directory exists
        mkdir -p "$OUTPUT_DIR"
        
        # Run slicer with absolute paths
        "$SLIC3R_BIN" --load "$CONFIG_FILE" \
              -o "$OUTPUT_DIR/$BASE_NAME.gcode" \
              "$INPUT_DIR/$FILE"

        echo "Slicing completed: $OUTPUT_DIR/$BASE_NAME.gcode"
    fi
done