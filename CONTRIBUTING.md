# Contributing to Restora

We love your input! We want to make contributing to Restora as easy and transparent as possible.

## How to Contribute

### Reporting Bugs

- Use the GitHub Issues page to report bugs
- Describe the bug clearly with steps to reproduce
- Include screenshots or error messages if applicable
- Specify your environment (browser, OS, Node version)

### Suggesting Enhancements

- Open an issue with the label "enhancement"
- Describe the feature and why it would be useful
- Provide examples of how you'd use it

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test your changes: `npm run check`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/restora.git

# Install dependencies
npm install

# Start development server
npm start

# Run syntax checks
npm run check
```

## Code Style

- Use 2 spaces for indentation
- Use meaningful variable names
- Comment complex logic
- Keep functions small and focused
- Follow existing code patterns

## Testing

Before submitting a PR:

1. Test all three pages (home, customer, restaurant)
2. Test admin login with correct and incorrect passwords
3. Test adding/removing menu items
4. Test placing orders and viewing receipts
5. Test API endpoints manually if changed

## Questions?

- Open an issue with the label "question"
- Join discussions on existing issues
- Reference the README for documentation

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

Thank you for contributing! 🎉
