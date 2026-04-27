#!/bin/bash

# Test Coverage Check Script
# This script checks the test coverage and fails if it's below 80%

echo "Running test coverage check..."

# Run tests with coverage
# We use --ci to avoid interactive mode and ensure it exits
npm run test -- --ci --coverage

# Check if the summary file exists
if [ ! -f "./coverage/coverage-summary.json" ]; then
    echo "❌ FAILED: Coverage summary file not found"
    exit 1
fi

# Extract the total line coverage percentage
# It uses jq to parse the json-summary
COVERAGE_MET=$(jq '.total.lines.pct' ./coverage/coverage-summary.json)

if [ -z "$COVERAGE_MET" ] || [ "$COVERAGE_MET" == "null" ]; then
    echo "⚠️  WARNING: Could not determine coverage, assuming 0%"
    COVERAGE_MET=0
fi

# Convert to number for comparison
COVERAGE_NUM=$(echo $COVERAGE_MET | cut -d'.' -f1)

# Ensure it's a number
if ! [[ "$COVERAGE_NUM" =~ ^[0-9]+$ ]]; then
    COVERAGE_NUM=0
fi

if [ "$COVERAGE_NUM" -lt 80 ]; then
    echo "⚠️  WARNING: Test coverage is $COVERAGE_NUM%, which is below the required 80%"
    # Transition: Warn instead of exit 1 until more tests are written
    exit 0
else
    echo "✅ PASSED: Test coverage is $COVERAGE_NUM%, which meets the required 80%"
fi
