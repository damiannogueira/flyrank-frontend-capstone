# ContextClip Instructions for Codex

## Project Context

ContextClip is a frontend capstone project for the FlyRank AI Internship Frontend track.

The application helps users organize internet research by converting links into visual cards.

The current Week 3 assignment expands the existing URL-card prototype into a more complete React application.

## Current Scope

The Week 3 version should include:

- a Home page for entering URLs and retrieving link metadata;
- reusable enriched link cards;
- a Saved Links page;
- navigation between Home and Saved Links;
- Firebase persistence for saved links;
- loading, error, empty, and success states;
- documentation of prompts, AI assistance, and human corrections.

Authentication is not part of the initial Week 3 scope unless it is explicitly approved later.

## Existing Stack

- React.js with JavaScript
- HTML through JSX
- Vite
- Regular CSS
- Node.js and npm
- Git and GitHub
- Visual Studio Code
- Codex as the AI development assistant

## Working Rules

- Inspect the existing repository before proposing changes.
- Explain the plan before editing files when a task affects multiple files.
- Make focused changes in small steps.
- Do not build the complete application in one response.
- Do not modify unrelated files.
- Do not silently delete existing working functionality.
- Keep explanations understandable for a student developer.
- State assumptions instead of treating them as confirmed requirements.

## Dependencies

- Check `package.json` before importing a package.
- Do not add a dependency without explaining why it is necessary.
- Ask for approval before installing React Router, Firebase, or another package.
- Do not use Tailwind CSS or a UI component library.
- Prefer browser and platform APIs when they are sufficient.

## Architecture

- Keep React components focused on presentation and user interaction.
- Keep external API communication inside service modules.
- Keep Firebase communication inside a Firebase service module.
- Do not call external APIs or Firebase directly from presentational card components.
- Keep validation and normalization logic in pure utility functions.
- Reuse existing tested URL utilities where appropriate.

## External Services and Secrets

- Never hardcode API keys or Firebase credentials in source files.
- Read client configuration from Vite environment variables.
- Provide an `.env.example` with placeholder values.
- Do not commit the real `.env` file.
- Handle failed requests with readable user-facing errors.

## Accessibility and UI States

- Use semantic HTML and visible labels.
- Preserve keyboard navigation and visible focus styles.
- Associate form errors with their inputs.
- Include clear loading, error, empty, and success states.
- Keep layouts usable on desktop and mobile.

## Verification

Before describing a development step as complete, run the relevant commands:

```bash
npm run lint
npm run test
npm run build
```

Add focused automated tests when business logic can be tested without the browser.

Also perform the manual checks relevant to the feature.

## AI Development Log

- Preserve the exact important prompts used during development.
- After each development step, help update `AI_DEVELOPMENT_LOG.md`.
- Record what Codex contributed.
- Record AI mistakes or questionable assumptions.
- Record manual corrections, improvements, and refactoring.
- Do not invent verification results or manual corrections.

## Git

Use Conventional Commits:

- `feat:` new functionality
- `fix:` bug fixes
- `refactor:` internal code improvements
- `test:` test changes
- `docs:` documentation
- `chore:` tooling or configuration

Do not commit or push unless explicitly instructed.
