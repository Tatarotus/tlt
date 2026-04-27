#!/bin/bash

# Comprehensive Quality Check Script for AI-Written Code
# This script runs all quality checks:
# 1. Cyclomatic Complexity (CCN)
# 2. Test Coverage (70-80%)
# 3. Mutation Testing (most important)
# 4. File Size (God Files)
# 5. Structure & Dependencies

set -e

echo "=========================================="
echo "AI-Code Quality Check Suite"
echo "=========================================="
echo ""

# 1. Cyclomatic Complexity Check
echo "1. Checking Cyclomatic Complexity (threshold: 15)..."
echo "-------------------------------------------"
npx eslint ./app ./lib ./db --rule 'complexity: [warn, 15]' --format=compact 2>/dev/null || true
echo ""

# 2. Test Coverage Check
echo "2. Checking Test Coverage (target: 70-80%)..."
echo "-------------------------------------------"
npx jest --coverage --silent 2>&1 | grep -E "(Test Suites|Tests|lines|Statements)" || true
echo ""

# 3. Mutation Testing
echo "3. Running Mutation Testing (most important)..."
echo "-------------------------------------------"
npx stryker run 2>&1 | grep -E "(Mutation score|killed|survived|timeout)" || true
echo ""

# 4. File Size Check (God Files)
echo "4. Checking for God Files (>300 lines)..."
echo "-------------------------------------------"
echo "Large files:"
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -path "./node_modules/*" \
  ! -path "./.next/*" \
  ! -path "./.stryker-tmp/*" \
  ! -path "./coverage/*" \
  -exec wc -l {} \; | sort -rn | awk '$1 > 300 {print "  " $1 " lines: " $2}'
echo ""

# 5. Circular Dependencies Check
echo "5. Checking for Circular Dependencies..."
echo "-------------------------------------------"
npx madge ./app ./lib ./db --circular --extensions ts,tsx 2>&1 | grep -E "(circular|Found)" || echo "  No circular dependencies found"
echo ""

echo "=========================================="
echo "Quality Check Complete"
echo "=========================================="
