#!/bin/bash

# Check if an STL file was provided
if [ -z "$1" ]; then
    echo "No STL file provided. Usage: entrypoint.sh <path_to_model.stl>"
    exit 1
fi

# Define output path
OUTPUT_GCODE="/slicer/output.gcode"

# Run PrusaSlicer in headless mode
echo "Slicing $1..."
/usr/bin/prusa-slicer --load /slicer/config.ini --output $OUTPUT_GCODE "$1"

# Check if slicing was successful
if [ $? -eq 0 ]; then
    echo "Slicing completed. Output: $OUTPUT_GCODE"
    exit 0
else
    echo "Slicing failed."
    exit 1
fi
