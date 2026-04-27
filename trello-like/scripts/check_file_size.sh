#!/bin/bash

# File Size Check Script
# This script checks if any modified files exceed 500 lines
# and warns if they exceed 300 lines

echo "Running file size check..."

# Get the list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null)
if [ -z "$STAGED_FILES" ]; then
    # If not in a git repo or no staged files, check all files
    STAGED_FILES=$(find ./app ./lib ./db ./tests -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null)
fi

VIOLATIONS_FOUND=0

echo "Checking file sizes..."
for file in $STAGED_FILES; do
    if [ -f "$file" ]; then
        # Count lines in the file
        LINE_COUNT=$(wc -l < "$file" | tr -d ' ')
        
        # Check if file exceeds limits
        if [ "$LINE_COUNT" -gt 500 ]; then
            echo "❌ FAILED: $file has $LINE_COUNT lines (maximum allowed: 500)"
            VIOLATIONS_FOUND=1
        elif [ "$LINE_COUNT" -gt 300 ]; then
            echo "⚠️  WARNING: $file has $LINE_COUNT lines (warning threshold: 300)"
        fi
    fi
done

if [ $VIOLATIONS_FOUND -eq 1 ]; then
    echo "❌ FAILED: Some files exceed the maximum file size limit of 500 lines"
    exit 1
else
    echo "✅ PASSED: All files are within the size limits"
fi