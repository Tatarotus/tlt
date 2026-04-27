# Quality Gate System

This project implements an automated quality gate system that enforces code quality standards to eliminate the need for manual code review.

## Quality Gates

1. **Cyclomatic Complexity** - Enforces a maximum cyclomatic complexity of 20 per function
2. **Test Coverage** - Enforces a minimum test coverage of 80%
3. **Mutation Testing** - Enforces a minimum mutation score of 60%
4. **File Size Limits** - Enforces a maximum file size of 500 lines (warning at 300 lines)
5. **Dependency Structure & Linting** - Enforces clean code practices and prevents circular dependencies

## Scripts

All quality check scripts are located in the `scripts/` directory:

- `check_complexity.sh` - Checks cyclomatic complexity
- `check_coverage.sh` - Checks test coverage
- `check_file_size.sh` - Checks file size limits
- `run_mutation.sh` - Runs mutation testing

## Usage

### Running Individual Checks

```bash
# Run complexity check
npm run quality:complexity

# Run coverage check
npm run quality:coverage

# Run file size check
npm run quality:filesize

# Run mutation testing
npm run quality:mutation

# Run all quality checks
npm run quality:all
```

### Pre-commit Hook

The pre-commit hook automatically runs:
- Complexity check
- File size check
- Coverage check

If any of these checks fail, the commit will be blocked.

### CI/CD Pipeline

The GitHub Actions pipeline in `.github/workflows/ci.yml` runs all quality checks on every push to main/develop branches and every pull request.

## Configuration

The quality gates are configured with the following thresholds:

| Check | Threshold | Location |
|-------|----------|----------|
| Cyclomatic Complexity | ≤ 20 per function | `scripts/check_complexity.sh` |
| Test Coverage | ≥ 80% | `scripts/check_coverage.sh` |
| Mutation Score | ≥ 60% | `scripts/run_mutation.sh` |
| File Size | ≤ 500 lines (warn at 300) | `scripts/check_file_size.sh` |

## Adjusting Thresholds

To adjust any of the quality gate thresholds, modify the corresponding values in:
- `scripts/check_complexity.sh` - Change the `--maxcc` value
- `scripts/check_coverage.sh` - Change the `--lines` value in the nyc command
- `scripts/check_file_size.sh` - Modify the line count checks
- `scripts/run_mutation.sh` - Change the minimum mutation score requirement

## Why These Rules?

1. **Cyclomatic Complexity ≤ 20**: Functions with high complexity are hard to understand and test
2. **Test Coverage ≥ 80%**: Ensures most of the code is tested to prevent regressions
3. **Mutation Score ≥ 60%**: Ensures tests are actually effective at catching bugs
4. **File Size ≤ 500 lines**: Large files are hard to understand and maintain
5. **No Circular Dependencies**: Prevents tight coupling between modules