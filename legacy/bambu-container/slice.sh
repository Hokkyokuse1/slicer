#!/bin/bash

STL_FILE=$1
OUTPUT_DIR=$2
BAMBU_CLI="/app/BambuStudio.AppImage"

if [ -z "$STL_FILE" ]; then
  echo "No STL file provided."
  exit 1
fi

if [ ! -f "$STL_FILE" ]; then
  echo "File not found: $STL_FILE"
  exit 1
fi

echo "Slicing $STL_FILE..."

# Run BambuStudio CLI with proper arguments
"$BAMBU_CLI" --cli --slice "$STL_FILE" --output "$OUTPUT_DIR"

if [ $? -eq 0 ]; then
  echo "Slicing completed successfully. Output stored in $OUTPUT_DIR"
else
  echo "Slicing failed."
  exit 1
fi
