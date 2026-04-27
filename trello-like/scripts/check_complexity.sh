#!/bin/bash

# Cyclomatic Complexity Check Script using ESLint
# This script checks the cyclomatic complexity of JavaScript/TypeScript files
# and fails if any function has a complexity greater than 20

echo "Running cyclomatic complexity check..."

# Run eslint with a custom complexity rule
# We use --no-eslintrc to avoid conflicts, or just override the rule
# Actually, it's better to just run eslint on relevant directories
npx eslint ./app ./lib ./db ./tests --rule 'complexity: [error, 20]' --rule 'max-depth: [error, 4]' --rule 'max-statements: [error, 30]'

if [ $? -ne 0 ]; then
    echo "❌ FAILED: Found functions exceeding complexity limits"
    exit 1
else
    echo "✅ PASSED: All functions are within complexity limits"
fi
