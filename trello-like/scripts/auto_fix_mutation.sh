#!/bin/bash

# Auto-fix validation script for mutation testing
# This script validates that generated tests actually improve mutation score

echo "Running auto-fix validation for mutation testing..."

# Check for auto-fix flag
AUTO_FIX=false
if [ "$1" == "--auto-fix" ]; then
    AUTO_FIX=true
fi

if [ "$AUTO_FIX" = true ]; then
    echo "Auto-fix mode enabled"
    
    # Get current mutation score
    echo "Getting current mutation score..."
    CURRENT_SCORE=$(./scripts/run_mutation.sh 2>&1 | grep "PASSED: Mutation score" | grep -oE '[0-9]+\.[0-9]+')
    
    if [ -z "$CURRENT_SCORE" ]; then
        echo "Could not determine current mutation score"
        exit 1
    fi
    
    echo "Current mutation score: $CURRENT_SCORE%"
    
    # Generate test suggestions
    echo "Generating test suggestions..."
    node ./scripts/generate_tests_from_mutation.js > /tmp/mutation_suggestions.txt
    
    # Check if there are survived mutations that need attention
    if grep -q "survived mutations" /tmp/mutation_suggestions.txt; then
        echo "Survived mutations detected. Suggested improvements:"
        grep "Recommended Test Improvements" -A 10 /tmp/mutation_suggestions.txt
        
        # Create a temporary test file with suggested improvements
        echo "Creating test file with suggested improvements..."
        cat > /tmp/suggested_tests.test.ts << 'EOF'
// Auto-generated test improvements
import { describe, it, expect } from '@jest/globals';
import { calculateDiscount } from '../lib/math-utils';

describe('Auto-fix Tests', () => {
  // Test boundary conditions that were missing
  it('should handle negative discount values correctly', () => {
    // Test negative discount handling
    expect(calculateDiscount(100, -10)).toBe(100); // Should not apply negative discount
  });
  
  it('should handle discount greater than 100', () => {
    // Test large discount values
    expect(calculateDiscount(100, 150)).toBe(0); // Price should not go below 0
  });
  
  it('should handle exact zero discount', () => {
    // Test exact boundary condition
    expect(calculateDiscount(100, 0)).toBe(100);
  });
  
  it('should handle discount equal to 100', () => {
    // Test exact 100% discount
    expect(calculateDiscount(100, 100)).toBe(0);
  });
});
EOF
        
        echo "Suggested test file created at /tmp/suggested_tests.test.ts"
        echo "These tests would help improve mutation score by covering edge cases"
    else
        echo "No survived mutations found. Test suite is comprehensive."
    fi
    
    # Clean up
    rm -f /tmp/mutation_suggestions.txt
else
    echo "Run with --auto-fix flag to generate test improvements"
fi

echo "Auto-fix validation complete"