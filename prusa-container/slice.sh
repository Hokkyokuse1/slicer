#!/bin/bash

STL_FILE=$1
OUTPUT_DIR=$2
GCODE_FILE="${OUTPUT_DIR}/$(basename "$STL_FILE" .stl).gcode"
JSON_FILE="${OUTPUT_DIR}/$(basename "$STL_FILE" .stl).json"

if [ -z "$STL_FILE" ]; then
  echo "No STL file provided."
  exit 1
fi

if [ ! -f "$STL_FILE" ]; then
  echo "File not found: $STL_FILE"
  exit 1
fi

echo "Slicing $STL_FILE..."
prusa-slicer --load /config/default.ini --slice --export-gcode --info --output "$GCODE_FILE" "$STL_FILE" > "$JSON_FILE"

if [ -f "$GCODE_FILE" ]; then
  echo "Slicing completed. Output stored in $OUTPUT_DIR"
  exit 0
else
  echo "Slicing failed."
  exit 1
fi
