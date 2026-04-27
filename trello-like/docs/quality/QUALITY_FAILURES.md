# Quality Gate System - Example of Failing Output

When a quality check fails, you'll see output similar to this:

## Cyclomatic Complexity Failure
```
❌ FAILED: Found 2 functions with cyclomatic complexity > 20
Function: complexNestedFunction - Complexity: 25
Function: anotherComplexFunction - Complexity: 32
```

## Test Coverage Failure
```
❌ FAILED: Test coverage is 45%, which is below the required 80%
```

## File Size Failure
```
❌ FAILED: ./app/components/LargeComponent.tsx has 625 lines (maximum allowed: 500)
```

## Mutation Testing Failure
```
❌ FAILED: Mutation score is 35%, which is below the required 60%
```

## How to Fix Failures

1. **For complexity issues**: Refactor functions to reduce nesting and simplify logic
2. **For coverage issues**: Write more comprehensive tests to cover more code paths
3. **For file size issues**: Break large files into smaller, more focused modules
4. **For mutation testing issues**: Improve test quality to catch more defects

## Adjusting Thresholds

To adjust quality gate thresholds, modify the corresponding scripts in the `scripts/` directory:

- `check_complexity.sh` - Change the `--maxcc` parameter
- `check_coverage.sh` - Change the `--lines` parameter in the nyc command
- `check_file_size.sh` - Modify the line count checks
- `run_mutation.sh` - Change the minimum mutation score requirement

The quality gates are designed to be strict but reasonable to ensure code quality.