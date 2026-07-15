# ContextClip Project Instructions

## Project Context

This repository contains ContextClip, a frontend capstone project for the FlyRank AI Internship Frontend track.

ContextClip is a web application for organizing internet research visually. Users will be able to turn links into cards and organize them inside an interactive workspace.

Current assignment:

- FE-03: The AI-assisted workflow drill
- Phase: Foundations

## Stack

- Visual Studio Code as the code editor
- Claude web as the AI assistant
- React.js with JavaScript
- HTML through JSX
- Regular CSS for styling
- Vite for frontend tooling
- Git and GitHub for version control

## Working Style

- Keep changes simple and easy to understand.
- Explain the purpose of changes before applying them.
- Do not create or modify many files at once unless requested.
- Prefer beginner-friendly explanations.
- Keep documentation updated as the project evolves.
- Do not add unnecessary libraries without explaining why they are needed.

## Git Convention

Use Conventional Commits:

- `docs:` documentation changes
- `chore:` setup, tooling, or configuration
- `feat:` new features
- `fix:` bug fixes
- `refactor:` internal code improvements
- `test:` test changes

Example:

```text
feat: add basic link card
```

## Current Feature

For FE-03, the same feature was implemented in two independent branches:

> Allow the user to paste or enter a valid URL and convert it into a basic visual card.

Branches:

- `fe-03/vague-prompt`
- `fe-03/precise-prompt`

Both implementations began from the same base project so their differences could be compared fairly.

## Learned Project Rules

These rules were added after comparing both FE-03 implementations.

### 1. Respect the existing stack

- Use React, JavaScript, JSX, and regular CSS.
- Do not use Tailwind CSS or another styling system unless it is already configured and explicitly approved.
- Check `package.json` before generating code that imports a library.

### 2. Do not add dependencies silently

- Do not introduce a new dependency without explaining why it is necessary.
- Prefer the existing platform and browser APIs when they are sufficient.
- If a dependency is approved, include the installation command and verify that the project still builds.

### 3. Keep URL logic separate and testable

- URL validation and normalization must remain in pure utility functions outside React components.
- Accept only HTTP and HTTPS URLs.
- Reject unsupported explicit schemes such as `ftp:`, `mailto:`, or custom schemes.
- Prepend `https://` only when the user entered no explicit scheme.
- Reject hostnames without a dot for this feature.
- Store the normalized URL and display the domain without a leading `www.`.

### 4. Handle user errors visibly and accessibly

- Empty, invalid, and duplicate URLs must show distinct visible messages.
- Error messages must be associated with the input and announced with an accessible live message such as `role="alert"`.
- Interactive controls must have visible labels, keyboard focus styles, and descriptive accessible names.

### 5. Verify every feature before committing

Before committing a frontend feature, run:

```bash
npm run lint
npm run test
npm run build
```

Also manually verify:

- keyboard navigation;
- visible focus;
- empty and error states;
- mobile layout;
- duplicate prevention;
- creation and deletion behavior.

Do not describe a feature as complete if any required verification fails.
