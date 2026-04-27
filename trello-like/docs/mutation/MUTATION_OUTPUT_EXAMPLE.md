# Example Mutation Analysis Output

When running the mutation analysis, you might see output like this:

```
=== Mutation Analysis Report ===
Mutation Score: 75.50%
Total Mutants: 42
Killed Mutants: 32
Survived Mutants: 10

❌ 10 mutations survived and need attention:

File: src/auth.js
  Survived mutations: 4
  Suggested improvements:
    - Add test cases to catch BinaryExpression mutations
    - Test edge cases in authentication logic

File: src/pricing.js
  Survived mutations: 6
  Suggested improvements:
    - Add test cases to catch ConditionalExpression mutations
    - Validate negative scenarios for pricing calculations

=== Suggestions ===
⚠️  Mutation score could be improved. Consider:
  - Adding tests for uncovered code paths
  - Testing boundary and edge cases more thoroughly
  - Validating error conditions
```

## Generated Test Suggestions

The system might suggest test cases like:

```javascript
// Generated test cases to improve mutation score
import { describe, it, expect } from '@jest/globals';

describe('Mutation Coverage Tests', () => {
  // Add tests for edge cases and boundary conditions
  it('should handle edge cases in auth logic', () => {
    // Test edge case for authentication
    // TODO: Implement test for uncovered code paths
    expect(true).toBe(true);
  });
  
  // Add tests for error conditions
  it('should handle error conditions', () => {
    // Test error handling paths
    // TODO: Implement error condition tests
    expect(true).toBe(true);
  });
});
```