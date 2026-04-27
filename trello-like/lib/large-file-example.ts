// Example of a large file that would fail file size check (over 500 lines)

// This is a placeholder for a large file that would trigger our file size quality gate
// In a real implementation, this would be an actual large component

// Lines 1-500 would be actual code
for (let i = 1; i <= 500; i++) {
  // This is just a comment to simulate a large file
  // In a real scenario, this would be actual implementation code
  // that exceeds our file size limits
}

// This file is intentionally large to demonstrate our file size quality gate
// The file size check script would flag this file as being too large
// and prevent it from being committed if quality gates are enabled

// This demonstrates why we need file size limits:
// 1. Large files are harder to understand
// 2. Large files are harder to maintain
// 3. Large files often indicate poor code organization
// 4. Large files make code reviews more difficult

// Our quality gate system will prevent files over 500 lines from being committed
// This encourages better code organization and modularity

// Best practices for keeping files small:
// 1. Break large components into smaller, focused components
// 2. Extract utility functions into separate modules
// 3. Use proper abstraction and encapsulation
// 4. Follow single responsibility principle

// This file would fail our quality checks because it's too large
// In a real implementation, we would need to refactor this into smaller files