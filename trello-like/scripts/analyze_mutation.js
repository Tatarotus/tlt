#!/usr/bin/env node

// Script to analyze mutation testing results and provide actionable feedback
import fs from 'fs';
import path from 'path';

// Function to analyze mutation results and generate a human-readable report
function analyzeMutationResults() {
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
    
    // Extract key metrics from the new format
    const mutants = mutationResult.files['lib/math-utils.ts'].mutants;
    const totalMutants = mutants.length;
    
    // Filter out ignored mutants for calculation
    const nonIgnoredMutants = mutants.filter(m => m.status !== 'Ignored');
    const killedMutants = nonIgnoredMutants.filter(m => m.status === 'Killed').length;
    const survivedMutants = nonIgnoredMutants.filter(m => m.status === 'Survived').length;
    
    const mutationScore = totalMutants > 0 ? ((killedMutants / (killedMutants + survivedMutants)) * 100).toFixed(2) : 100.00;
    
    console.log(`\n=== Mutation Analysis Report ===`);
    console.log(`Mutation Score: ${mutationScore}%`);
    console.log(`Total Mutants: ${totalMutants}`);
    console.log(`Killed Mutants: ${killedMutants}`);
    console.log(`Survived Mutants: ${survivedMutants}`);
    
    // Analyze survived mutations
    if (survivedMutants > 0) {
      console.log(`\n❌ ${survivedMutants} mutations survived and need attention:`);
      
      // Find survived mutations
      const survivedMutations = mutants.filter(mutant => mutant.status === 'Survived');
      
      // Group survived mutations by file and location
      survivedMutations.forEach(mutant => {
        const fileName = 'lib/math-utils.ts';
        const location = mutant.location;
        console.log(`\nFile: ${fileName}:${location.start.line}:${location.start.column}`);
        console.log(`  Mutation type: ${mutant.mutatorName}`);
        console.log(`  Status: ${mutant.status}`);
        if (mutant.replacement) {
          console.log(`  Change: ${mutant.replacement}`);
        }
      });
      
      console.log('\n=== Specific Issues Found ===');
      survivedMutations.forEach(mutant => {
        const location = mutant.location;
        console.log(`\nlib/math-utils.ts:${location.start.line}:${location.start.column}`);
        console.log(`  Mutation type: ${mutant.mutatorName}`);
        console.log(`  Issue: Mutation survived - missing test coverage for this code path`);
      });
    } else {
      console.log('\n✅ All mutations were killed! Test suite is strong.');
    }
    
    // Provide general suggestions based on mutation patterns
    console.log('\n=== Suggestions ===');
    if (mutationScore < 80) {
      console.log('❌ Mutation score is low. Consider adding more comprehensive tests.');
      console.log('  - Test edge cases and boundary conditions');
      console.log('  - Add negative scenario tests');
      console.log('  - Validate all boolean branches explicitly');
      console.log('  - Test error handling paths');
    } else if (mutationScore < 100) {
      console.log('⚠️  Mutation score could be improved. Consider:');
      console.log('  - Adding tests for uncovered code paths');
      console.log('  - Testing boundary and edge cases more thoroughly');
      console.log('  - Validating error conditions');
    } else {
      console1.log('✅ Mutation score is good. Keep up the strong testing practices!');
    }
  } catch (error) {
    console.error('Error analyzing mutation results:', error);
  }
}

// Run the analysis
analyzeMutationResults();