# Contributing to Oracle Data Pump Converter

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS information
- Example command line input (if applicable)

### Suggesting Enhancements

We welcome suggestions for new features! Please open an issue with:
- Clear description of the enhancement
- Use case and benefits
- Example of how it would work

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Test your changes thoroughly
   - Update documentation if needed

4. **Commit your changes**
   ```bash
   git commit -m "Add feature: description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Include test cases if applicable

## Development Guidelines

### Code Style

- Use consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small

### JavaScript Guidelines

- Use ES6+ features where appropriate
- Avoid global variables
- Handle errors gracefully
- Validate user input

### CSS Guidelines

- Use class names that describe purpose
- Keep selectors simple
- Maintain responsive design
- Test on multiple browsers

### Testing

Before submitting a PR:
- Test all functionality manually
- Test on multiple browsers
- Verify examples work correctly
- Check for console errors

## Adding New Parameters

To add support for a new Data Pump parameter:

1. **Update parameterMappings** in script.js
2. **Add parsing logic** in parseCommand function
3. **Add generation logic** in generatePLSQL function
4. **Update documentation** in README.md
5. **Add test case** in test-cases.md
6. **Add example** in examples.html (if applicable)

## Project Structure

```
orace-datapump/
├── index.html          # Main application page
├── examples.html       # Examples and use cases
├── styles.css          # Styling
├── script.js           # Core logic
├── README.md           # Project documentation
├── SETUP_GITHUB_PAGES.md  # GitHub Pages setup guide
├── CONTRIBUTING.md     # This file
├── test-cases.md       # Test cases
└── LICENSE             # License file
```

## Questions?

Feel free to open an issue for any questions or clarifications.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).
