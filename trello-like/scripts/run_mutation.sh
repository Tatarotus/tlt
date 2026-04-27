#!/bin/bash

# Mutation Testing Script
# This script runs mutation testing and ensures a minimum mutation score of 60%

echo "Running mutation testing..."

# Run stryker mutation testing
npx stryker run

# Check if the command succeeded
if [ $? -ne 0 ]; then
    echo "❌ Mutation testing failed"
    exit 1
fi

# Check the mutation score from the report
MUTATION_REPORT="reports/mutation/mutation.json"

if [ ! -f "$MUTATION_REPORT" ]; then
    echo "❌ No mutation report found"
    exit 1
fi

# Extract mutation score
counts=$(cat "$MUTATION_REPORT" | jq -r '.files."lib/math-utils.ts".mutants | map(.status) | group_by(.) | map({status: .[0], count: length}) | map(select(.status != "Ignored"))')

killed=$(echo "$counts" | jq -r 'map(select(.status == "Killed")) | .[0].count')
survived=$(echo "$counts" | jq -r 'map(select(.status == "Survived")) | .[0].count')

total=$((killed + survived))
if [ "$total" -gt 0 ]; then
  mutation_score=$(echo "scale=2; $killed * 100 / $total" | bc)
else
  mutation_score=100
fi

# Convert to integer for comparison (remove decimal part)
MUTATION_SCORE_INT=$(echo "$mutation_score" | cut -d'.' -f1)

if [ -z "$MUTATION_SCORE_INT" ]; then
    MUTATION_SCORE_INT=0
fi

if [ "$MUTATION_SCORE_INT" -lt 60 ]; then
    echo "❌ FAILED: Mutation score is $mutation_score%, which is below the required 60%"
    exit 1
else
    echo "✅ PASSED: Mutation score is $mutation_score%, which meets the required 60%"
fi