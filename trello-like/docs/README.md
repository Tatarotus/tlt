# Documentation Index

## 📊 Quality Assurance

### Core Quality Reports
- **[AI Code Quality Report](./quality/AI_CODE_QUALITY_REPORT.md)** - Comprehensive analysis (80.23% mutation score)
- **[Quality Summary](./quality/QUALITY_SUMMARY.md)** - Quick reference for quality metrics
- **[Quality README](./quality/README.md)** - Quality testing guide

### Quality Failure Analysis
- **[Quality Failures](./quality/QUALITY_FAILURES.md)** - Documented quality issues and fixes

---

## 🧬 Mutation Testing

### Mutation System Documentation
- **[Intelligent Mutation System](./mutation/INTELLIGENT_MUTATION_SYSTEM.md)** - Mutation testing framework
- **[Mutation System Summary](./mutation/MUTATION_SYSTEM_SUMMARY.md)** - System overview
- **[Mutation System Status](./mutation/MUTATION_SYSTEM_STATUS.md)** - Current status
- **[Mutation Intelligence](./mutation/MUTATION_INTELLIGENT.md)** - Intelligence features
- **[Mutation Output Example](./mutation/MUTATION_OUTPUT_EXAMPLE.md)** - Example outputs

---

## 🎨 Design & Implementation

- **[Color Palette](./COLOR_PALETTE.md)** - UI color scheme
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Implementation details
- **[Project Plan](./plan.md)** - Original project plan
- **[Gemini Notes](./GEMINI.md)** - AI assistant notes

---

## 📁 Project Documentation

- **[Todo List](./todo.md)** - Remaining tasks
- **[Architecture](../architecture/)** - System design
- **[Migration Guide](../MIGRATION_SUMMARY.md)** - Migration details
- **[Multi-User Setup](../MULTI_USER_SETUP.md)** - Auth configuration

---

## Quick Links

| Category | Documents |
|----------|-----------|
| **Quality** | [Report](./quality/AI_CODE_QUALITY_REPORT.md) • [Summary](./quality/QUALITY_SUMMARY.md) • [Failures](./quality/QUALITY_FAILURES.md) |
| **Mutation** | [System](./mutation/INTELLIGENT_MUTATION_SYSTEM.md) • [Status](./mutation/MUTATION_SYSTEM_STATUS.md) |
| **Design** | [Colors](./COLOR_PALETTE.md) • [Plan](./plan.md) • [Implementation](./IMPLEMENTATION_SUMMARY.md) |
| **Project** | [Todo](./todo.md) • [Architecture](../architecture/) • [Migration](../MIGRATION_SUMMARY.md) |

---

## Running Quality Checks

```bash
# Run all quality checks
npm run quality:all

# Individual checks
npm run quality:complexity    # Cyclomatic complexity
npm run quality:coverage      # Test coverage  
npm run quality:mutation      # Mutation testing
npm run quality:filesize      # God file detection

# View reports
npm run quality:report        # Show quality report
```

---

*Last updated: $(date)*
