# Contributing to Memory Leak Guide

Thank you for your interest in contributing to the Memory Leak Guide! This documentation project aims to help developers understand, detect, and prevent memory leaks across multiple programming languages. Every contribution, no matter how small, helps make this resource better for the entire development community.

## 🎯 Ways to Contribute

### 📝 Documentation

- **Add new content** - Write guides for additional programming languages
- **Improve existing content** - Fix typos, improve clarity, add examples
- **Add translations** - Help translate content to more languages
- **Create diagrams** - Visual aids to explain complex concepts

### 💻 Code Examples

- **Add demo applications** - Real-world examples of memory leaks
- **Improve existing demos** - Enhance the NestJS demo or add new ones
- **Add test cases** - Memory leak detection and prevention tests
- **Tools and utilities** - Scripts for memory analysis

### 🐛 Issues and Feedback

- **Report bugs** - Documentation errors, broken links, code issues
- **Suggest improvements** - Ideas for better organization or content
- **Request content** - Specific topics you'd like to see covered
- **User experience feedback** - Navigation, readability, accessibility

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and **pnpm** for building documentation
- **Git** for version control
- Basic knowledge of **Markdown** for documentation
- Familiarity with **VitePress** (optional, for advanced contributions)

### Setup Development Environment

1. **Fork the repository**

   ```bash
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/memory-leak.git
   cd memory-leak
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start development server**

   ```bash
   pnpm docs:dev
   ```

4. **Open in browser**

   ```text
   http://localhost:5173
   ```

## 📂 Project Structure

```text
memory-leak/
├── docs/                    # Documentation source (English)
│   ├── .vitepress/         # VitePress configuration
│   ├── introduction/       # Introduction guides
│   ├── languages/          # Language-specific guides
│   ├── patterns/           # Common patterns and solutions
│   └── vi/                 # Vietnamese translations
├── nodejs/nestjs-demo/     # NestJS demonstration app
├── go/                     # Go examples (planned)
├── java/                   # Java examples (planned)
└── kotlin/                 # Kotlin examples (planned)
```

## ✍️ Content Guidelines

### Writing Style

- **Clear and concise** - Use simple language, avoid jargon
- **Practical focus** - Include real-world examples and use cases
- **Code examples** - Provide working code snippets with explanations
- **Cross-references** - Link to related sections and external resources

### Documentation Format

- **Use proper Markdown** - Follow standard markdown conventions
- **Include code blocks** - Specify language for syntax highlighting
- **Add diagrams** - Use Mermaid for flowcharts and diagrams
- **Consistent structure** - Follow existing page structures

### Example Structure for New Language Guide

```markdown
# [Language] Memory Leak Guide

## Introduction
Brief overview of memory management in this language.

## Common Memory Leak Patterns
### Pattern 1: [Name]
- Description
- Code example
- How to detect
- How to fix

## Detection Tools
List of tools and techniques.

## Best Practices
Prevention strategies.

## References
External resources and documentation.
```

## 🔄 Contribution Workflow

### For Documentation Changes

1. **Create a branch**

   ```bash
   git checkout -b docs/add-python-guide
   ```

2. **Make your changes**
   - Edit markdown files in `docs/`
   - Test locally with `pnpm docs:dev`
   - Ensure links work and formatting is correct

3. **Commit changes**

   ```bash
   git add .
   git commit -m "docs: add Python memory leak guide"
   ```

4. **Push and create PR**

   ```bash
   git push origin docs/add-python-guide
   ```

### For Code Examples

1. **Create feature branch**

   ```bash
   git checkout -b examples/python-demo
   ```

2. **Add your code**
   - Create new directory under appropriate language
   - Include README with setup instructions
   - Add memory leak examples with comments

3. **Test thoroughly**
   - Ensure examples actually demonstrate memory leaks
   - Verify detection tools work as expected
   - Test on multiple environments if possible

## 🎨 Translation Guidelines

### Adding a New Language

1. **Create language directory** under `docs/`

   ```text
   docs/es/           # For Spanish
   docs/fr/           # For French
   docs/de/           # For German
   ```

2. **Update VitePress config**

   ```typescript
   // docs/.vitepress/config.ts
   locales: {
     // ... existing locales
     es: {
       label: "Español",
       lang: "es",
       // ... configuration
     }
   }
   ```

3. **Translate systematically**
   - Start with key pages (index, getting-started)
   - Maintain same structure as English version
   - Adapt examples for local context when relevant

### Translation Quality

- **Accuracy** - Preserve technical meaning
- **Natural language** - Use idiomatic expressions
- **Consistency** - Maintain terminology throughout
- **Cultural adaptation** - Adjust examples for local context

## 🧪 Testing

### Documentation Testing

- **Build successfully** - `pnpm docs:build`
- **No broken links** - Check all internal and external links
- **Proper formatting** - Verify markdown renders correctly
- **Mobile friendly** - Test on different screen sizes

### Code Example Testing

- **Memory leaks occur** - Verify examples actually leak memory
- **Detection works** - Confirm monitoring tools detect the leaks
- **Fixes work** - Ensure provided solutions actually fix the issues
- **Cross-platform** - Test on different operating systems when relevant

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] **Test locally** - Ensure everything builds and works
- [ ] **Check formatting** - Run any available linters
- [ ] **Update documentation** - Add entries to relevant index pages
- [ ] **Self-review** - Read through your changes once more

### PR Description Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature/content
- [ ] Documentation update
- [ ] Translation
- [ ] Code example

## Testing
- [ ] Local build successful
- [ ] Links verified
- [ ] Code examples tested
- [ ] Cross-browser tested (if applicable)

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Any additional information or context.
```

## 📞 Getting Help

### Communication Channels

- **GitHub Issues** - For bugs, feature requests, and questions
- **GitHub Discussions** - For general questions and community chat
- **Email** - Contact maintainer at [your-email] for private matters

### Questions Welcome

Don't hesitate to ask if you're unsure about:

- **Content direction** - What topics to cover
- **Technical implementation** - How to implement examples
- **Style and formatting** - Following project conventions
- **Tool usage** - VitePress, Mermaid, or other tools

## 🏆 Recognition

Contributors will be:

- **Listed in README** - Added to contributors section
- **Credited in documentation** - Author attribution where appropriate
- **Featured in releases** - Mentioned in release notes
- **Invited to collaborate** - Ongoing involvement in project direction

## 📜 Code of Conduct

### Our Standards

- **Be respectful** - Treat all contributors with respect
- **Be inclusive** - Welcome contributors from all backgrounds
- **Be constructive** - Provide helpful feedback and suggestions
- **Be patient** - Remember that everyone is learning

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Offensive comments or personal attacks
- Spam or off-topic discussions
- Sharing private information without permission

### Enforcement

Issues should be reported to project maintainers who will review and take appropriate action.

## 🙏 Thank You

Your contributions make this project valuable for developers worldwide. Whether you're fixing a typo, adding a new language guide, or creating comprehensive examples, every effort helps build a better resource for the community.

Happy contributing! 🚀
