#!/bin/bash

# Define the file extensions and directory names to target
FILE_EXTENSIONS=("zip" "mtar")
DIR_NAMES=("node_modules" "gen" "dist")

# Delete files with specific extensions
for ext in "${FILE_EXTENSIONS[@]}"; do
    find . -type f -name "*.$ext" -exec rm -f {} +
    echo "Deleted all *.$ext files"
done

# Delete specific directories
for dir in "${DIR_NAMES[@]}"; do
    find . -type d -name "$dir" -exec rm -rf {} +
    echo "Deleted all $dir directories"
done
