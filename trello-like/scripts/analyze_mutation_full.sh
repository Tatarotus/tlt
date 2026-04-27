#!/bin/bash

# Enhanced Mutation Testing Script
# This script runs the full mutation testing workflow with analysis

echo "Running enhanced mutation testing workflow..."

# Run the mutation testing
./scripts/run_mutation.sh

# Check if mutation testing succeeded
if [ $? -ne 0 ]; then
    echo "❌ Mutation testing failed"
    exit 1
fi

# Check if mutation report exists
MUTATION_REPORT="reports/mutation/mutation.json"
if [ ! -f "$MUTATION_REPORT" ]; then
    echo "❌ No mutation report found"
    exit 1
fi

# Run analysis script
echo "Analyzing mutation results..."
node ./scripts/analyze_mutation.js

# Generate test suggestions
echo "Generating test suggestions..."
node ./scripts/generate_tests_from_mutation.js

echo "✅ Mutation analysis complete"