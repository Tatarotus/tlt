#!/usr/bin/env node

// Script to generate test cases based on survived mutations
const fs = require('fs');
const path = require('path');

// Function to generate test cases for survived mutations
function generateTestCasesFromMutations() {
  try {
    // Check if mutation report exists
    const reportPath = path.join('reports', 'mutation', 'mutation.json');
    if (!fs.existsSync(reportPath)) {
      console.log('No mutation report found. Run mutation testing first.');
      return;
    }

    // Read the mutation report
    const reportData = fs.readFileSync(reportPath, 'utf8');
    const mutationResult = JSON.parse(reportData);
    
    // Find survived mutations
    const mutants = mutationResult.files['lib/math-utils.ts'].mutants;
    const survivedMutants = mutants.filter(mutant => mutant.status === 'Survived');
    
    if (survivedMutants.length === 0) {
      console.log('✅ No survived mutations found. Test suite is comprehensive.');
      return;
    }
    
    console.log(`Found ${survivedMutants.length} survived mutations. Generating test suggestions...\n`);
    
    // Generate test suggestions for each survived mutation
    console.log('=== Survived Mutations Analysis ===');
    survivedMutants.forEach(mutant => {
      const location = mutant.location;
      const fileName = 'lib/math-utils.ts';
      console.log(`\nFile: ${fileName}:${location.start.line}:${location.start.column}`);
      console.log(`  Mutation type: ${mutant.mutatorName}`);
      console.log(`  Status: ${mutant.status}`);
      if (mutant.replacement) {
        console.log(`  Change: ${mutant.replacement}`);
      }
      
      // Provide specific test suggestions based on mutation type
      switch(mutant.mutatorName) {
        case 'ConditionalExpression':
          console.log('  Suggested test: Add test case for the condition when this expression evaluates to true/false');
          break;
        case 'EqualityOperator':
          console.log('  Suggested test: Add test case for boundary conditions (e.g., exactly 0, negative values)');
          break;
        case 'IfStatement':
          console.log('  Suggested test: Add test cases for both if and else branches');
          break;
        case 'BinaryExpression':
          console.log('  Suggested test: Add test cases for both sides of the operation');
          break;
        default:
          console.log('  Suggested test: Add test to verify this specific code path');
      }
    });
    
    // Generate specific test improvements
    console.log('\n=== Recommended Test Improvements ===');
    console.log('Based on the survived mutations, add these test cases:');
    
    // Check for specific patterns
    const conditionalMutations = survivedMutants.filter(m => m.mutatorName.includes('Conditional') || m.mutatorName.includes('IfStatement'));
    if (conditionalMutations.length > 0) {
      console.log('\n1. Add boundary condition tests:');
      console.log('   - Test calculateDiscount with discount = 0');
      console.log('   - Test calculateDiscount with negative discount values');
      console.log('   - Test calculateDiscount with discount > 100');
    }
    
    const equalityMutations = survivedMutants.filter(m => m.mutatorName.includes('Equality') || m.mutatorName.includes('Operator'));
    if (equalityMutations.length > 0) {
      console.log('\n2. Add edge case tests:');
      console.log('   - Test with exact boundary values');
      console.log('   - Test with negative values where applicable');
      console.log('   - Test with maximum/minimum values');
    }
    
    // Generate a comprehensive test file
    const testFilePath = path.join('tests', 'mutation_improvements.test.ts');
    const testContent = `// Generated test cases to improve mutation score for math-utils.ts
import { describe, it, expect } from '@jest/globals';
import { calculateDiscount } from '../lib/math-utils';

describe('Mutation Coverage Tests', () => {
  // Test boundary conditions for calculateDiscount
  it('should handle zero discount correctly', () => {
    expect(calculateDiscount(100, 0)).toBe(100);
  });
  
  it('should handle negative discount values', () => {
    // TODO: Implement test for negative discount
    expect(true).toBe(true);
  });
  
  it('should handle discount greater than 100', () => {
    // TODO: Implement test for discount > 100
    expect(true).toBe(true);
  });
  
  // Test exact boundary conditions
  it('should handle exact boundary values', () => {
    // TODO: Implement test for boundary conditions
    expect(true).toBe(true);
  });
});
`;
    
    // Output the suggested test file
    console.log('\n=== Suggested Test File ===');
    console.log(testFilePath);
    console.log(testContent);
    
  } catch (error) {
    console.error('Error generating test cases:', error);
  }
}

// Run the test case generation
generateTestCasesFromMutations();