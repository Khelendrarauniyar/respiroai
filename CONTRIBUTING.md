# Contributing to Unified Respiratory Disease Detection System

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Quick Start for Contributors

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/Khelendrarauniyar/respiroai.git`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes**
5. **Test your changes**
6. **Commit**: `git commit -m "Add your feature"`
7. **Push**: `git push origin feature/your-feature-name`
8. **Create a Pull Request**

## 🐛 Reporting Bugs

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/Khelendrarauniyar/respiroai/issues).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 10, Ubuntu 20.04]
 - Browser: [e.g. Chrome, Firefox]
 - Python version: [e.g. 3.9.7]
 - Node.js version: [e.g. 16.14.0]

**Additional context**
Add any other context about the problem here.
```

## 🔧 Development Process

We use GitHub Flow, so all code changes happen through pull requests:

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## 💻 Development Setup

### Backend Development

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install development dependencies
pip install pytest black flake8 mypy

# Run tests
pytest

# Format code
black .

# Lint code
flake8 .
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Install development dependencies
npm install --save-dev eslint prettier

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint
```

## 🧪 Testing Guidelines

### Backend Testing

- Write unit tests for all new functions
- Use pytest for testing
- Test coverage should be > 80%
- Include integration tests for API endpoints

```bash
# Run tests with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_models.py

# Run tests with verbose output
pytest -v
```

### Frontend Testing

- Write unit tests for components
- Use Jest and React Testing Library
- Include snapshot tests for UI components
- Test user interactions and API calls

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Update snapshots
npm test -- --updateSnapshot
```

## 📝 Coding Standards

### Python (Backend)

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- Use [Black](https://black.readthedocs.io/) for code formatting
- Use [flake8](https://flake8.pycqa.org/) for linting
- Add type hints where possible
- Write docstrings for all functions and classes

```python
def predict_disease(image_path: str, model_type: str) -> Dict[str, Any]:
    """
    Predict disease from X-ray image.
    
    Args:
        image_path: Path to the X-ray image
        model_type: Type of model ('pneumonia', 'tuberculosis', 'lung_cancer')
    
    Returns:
        Dictionary containing prediction results
    
    Raises:
        ValueError: If model_type is not supported
        FileNotFoundError: If image_path doesn't exist
    """
    pass
```

### JavaScript/React (Frontend)

- Use [Prettier](https://prettier.io/) for code formatting
- Use [ESLint](https://eslint.org/) for linting
- Follow React best practices
- Use functional components with hooks
- Write JSDoc comments for complex functions

```javascript
/**
 * Upload and analyze X-ray image
 * @param {File} imageFile - The X-ray image file
 * @param {string} diseaseType - Type of disease to detect
 * @returns {Promise<Object>} Analysis results
 */
const analyzeImage = async (imageFile, diseaseType) => {
  // Implementation
};
```

## 🎯 Types of Contributions

### 🐛 Bug Fixes
- Fix existing bugs
- Improve error handling
- Performance optimizations

### ✨ New Features
- New disease detection models
- UI/UX improvements
- API enhancements
- Integration features

### 📖 Documentation
- API documentation
- Code comments
- User guides
- Deployment guides

### 🧪 Testing
- Unit tests
- Integration tests
- End-to-end tests
- Performance tests

### 🎨 Design
- UI/UX improvements
- Accessibility enhancements
- Mobile responsiveness
- Visual design updates

## 🔄 Pull Request Process

1. **Ensure any install or build dependencies are removed** before the end of the layer when doing a build

2. **Update the README.md** with details of changes to the interface, including new environment variables, exposed ports, useful file locations, and container parameters

3. **Increase the version numbers** in any examples files and the README.md to the new version that this Pull Request would represent

4. **Your PR will be merged** once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you

### PR Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally with my changes
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## 🏷️ Issue Labels

We use these labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `duplicate` - This issue or pull request already exists
- `invalid` - This doesn't seem right
- `wontfix` - This will not be worked on

## 🎖️ Recognition

Contributors are recognized in:

- README.md contributors section
- GitHub contributors graph
- Release notes for significant contributions
- Special mentions in project announcements

## 📚 Resources

### Learning Resources
- [Python Documentation](https://docs.python.org/)
- [React Documentation](https://reactjs.org/docs/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [TensorFlow Documentation](https://www.tensorflow.org/guide)

### Tools
- [VS Code](https://code.visualstudio.com/) - Recommended editor
- [GitHub Desktop](https://desktop.github.com/) - GUI for Git
- [Postman](https://www.postman.com/) - API testing
- [Docker](https://www.docker.com/) - Containerization

## ❓ Questions?

Don't hesitate to ask questions! You can:

- [Open an issue](https://github.com/Khelendrarauniyar/respiroai/issues)
- [Start a discussion](https://github.com/Khelendrarauniyar/respiroai/discussions)
- Email the maintainers: khelendra.guptarauniyar@gmail.com

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

**Thank you for contributing to the future of medical AI! 🏥💻**
