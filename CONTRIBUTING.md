# Contributing to Home Loan Optimizer

First off, thank you for considering contributing to Home Loan Optimizer! It's people like you that make this tool better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if relevant**
- **Note your environment** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/home-loan-optimizer.git

# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define proper interfaces for all data structures
- Avoid `any` types
- Use meaningful variable and function names

### React

- Use functional components with hooks
- Keep components small and focused (< 200 lines)
- Extract reusable logic into custom hooks
- Use proper prop types

### Styling

- Use CSS variables for theming
- Follow existing naming conventions
- Ensure dark/light theme compatibility
- Make components responsive

### File Organization

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts
├── utils/          # Pure utility functions
├── types.ts        # Shared TypeScript types
└── App.tsx         # Main application
```

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add export to PDF functionality
fix: correct interest calculation for leap years
docs: update README with new features
style: format code with prettier
refactor: simplify amortization logic
test: add tests for prepayment calculations
chore: update dependencies
```

## Testing

- Test all calculations with edge cases
- Verify UI works on different screen sizes
- Check both dark and light themes
- Test keyboard navigation
- Ensure accessibility standards

## Documentation

- Update README.md for new features
- Add JSDoc comments for complex functions
- Update TypeScript interfaces
- Include examples in documentation

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

## Recognition

Contributors will be recognized in the README and release notes.

Thank you for contributing! 🎉
