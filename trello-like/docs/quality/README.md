# Quality Gate System

This project implements a complete automated quality gate system that enforces code quality standards to eliminate the need for manual code review.

## Installation

1. Clone the repository
2. Run `npm install` to install dependencies
3. The pre-commit hooks and quality checks will be automatically available

## Running Quality Checks

### Run all quality checks:
```bash
npm run quality:all
```

### Run individual checks:
```bash
# Check cyclomatic complexity
npm run quality:complexity

# Check test coverage
npm run quality:coverage

# Check file size limits
npm run quality:filesize

# Run mutation testing
npm run quality:mutation
```

## Quality Gate Rules

1. **Cyclomatic Complexity** - Maximum 20 per function
2. **Test Coverage** - Minimum 80% coverage
3. **Mutation Score** - Minimum 60% mutation score
4. **File Size** - Maximum 500 lines per file (warning at 300 lines)

## CI/CD Pipeline

The system includes a GitHub Actions workflow that runs all quality checks automatically on every push/PR.

## Pre-commit Hooks

The system includes pre-commit hooks that run:
- Cyclomatic complexity check
- File size check
- Test coverage check

If any of these checks fail, the commit will be blocked.

## Configuration

All quality gate thresholds can be adjusted in the respective script files in the `scripts/` directory.