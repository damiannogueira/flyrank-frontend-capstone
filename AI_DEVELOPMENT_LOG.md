# AI Development Log — Week 3

## Assignment

**React app development with AI**

Build a React application independently using AI as a development assistant.

## Project

**ContextClip**

ContextClip is a frontend application for organizing internet research through visual link cards.

For this assignment, the existing URL-card prototype will be expanded into a more complete React application with:

- navigation between Home and Saved Links;
- reusable enriched link cards;
- external metadata retrieval;
- Firebase persistence;
- loading, error, empty, and success states.

## Development Environment

- Visual Studio Code
- Codex extension for Visual Studio Code
- React.js with JavaScript
- Vite
- Regular CSS
- Git and GitHub

## Working Method

For each development step:

1. Write a focused prompt.
2. Ask the AI to inspect and plan before changing code when appropriate.
3. Review the proposed changes.
4. Apply or approve only the necessary changes.
5. Run the application and verification commands.
6. Record AI mistakes, manual corrections, and refactoring.
7. Commit the completed step using Conventional Commits.

---

## Prompt 1 — Project Review and Implementation Plan

### Goal

Review the existing ContextClip repository and create a realistic, phased Week 3 implementation plan before changing code.

### Prompt Used

```text
Read AGENTS.md and inspect the existing ContextClip repository before responding.

We are starting the Week 3 assignment: “React app development with AI”.

The current application already allows users to:
- enter a URL;
- validate and normalize it;
- create a basic link card;
- prevent duplicates;
- delete cards;
- run automated tests for the URL utility logic.

For Week 3, we want to expand ContextClip into a more complete React application inspired by the development process demonstrated in the internship React session, but without copying the mentor’s movie application.

The approved product direction is:

- a Home page where users enter a URL and retrieve enriched link metadata;
- reusable cards displaying available metadata such as title, description, domain, and image;
- a Saved Links page;
- navigation between Home and Saved Links;
- Firebase persistence for saving and deleting links;
- clear loading, error, empty, and success states;
- React with JavaScript, Vite, and regular CSS;
- no authentication in the initial Week 3 scope.

Do not modify files, install packages, or write implementation code yet.

First provide a focused technical review and implementation plan containing:

1. A summary of the current project structure and existing functionality.
2. A recommended architecture for the expanded application.
3. A phased implementation plan with small, testable development steps.
4. The files that would likely be created or modified in each phase.
5. The minimum dependencies that may be required, explaining why each one is necessary.
6. A recommendation for retrieving URL metadata from a browser application, including CORS, API-key, privacy, and rate-limit considerations.
7. A proposed Firebase data structure for saved links.
8. Which existing utilities and components should be reused or refactored.
9. The main technical risks and assumptions.
10. A verification strategy covering lint, automated tests, build, accessibility, and manual behavior checks.

Keep the scope realistic for a student assignment. Do not propose building every possible ContextClip feature. Wait for approval before making any changes.
```

Follow-up instruction:

```text
The overall plan is approved, but revise Phase 1 before implementing it.

There is one behavior risk in the current proposal: if the existing cards state is moved completely into HomePage, navigating to Saved Links and returning to Home may unmount HomePage and erase the current in-memory cards.

For Phase 1, preserve the existing session behavior by keeping the cards state above the routes, preferably in App. Pass the cards and the add/delete actions to HomePage through props. Do not introduce Context or another state-management solution yet.

Use:

- BrowserRouter in main.jsx
- Routes and Route for `/` and `/saved`
- NavLink for accessible navigation and active-link styling
- App as the small shared state and routing container
- HomePage for the existing URL form and card list
- SavedLinksPage as a clear placeholder only

Phase 1 must not include:

- metadata retrieval;
- Firebase;
- enriched-card refactoring;
- new tests unless existing behavior requires a test correction;
- README or AI_DEVELOPMENT_LOG changes;
- unrelated asset deletion.

The existing LinkForm, CardList, Card, and URL utilities should be reused with the minimum changes necessary.

Return only the revised Phase 1 plan, including:

1. Exact files to create or modify.
2. State and props flow.
3. Router structure.
4. Accessibility considerations.
5. Verification commands and manual checks.

Do not install packages or modify files yet.
```

### AI Contribution

The AI inspected `AGENTS.md`, the repository structure, source components, URL utilities and tests, CSS, package configuration, README, development log, and Git status. It summarized the existing prototype and proposed a phased architecture covering routing, reusable cards, metadata retrieval, Firebase persistence, application states, accessibility, and documentation. It also identified dependency, CORS, API-key, privacy, rate-limit, and Firebase security considerations.

### Human Review

Human review identified a state-lifetime risk in the initial Phase 1 proposal: moving the cards state completely into `HomePage` would allow route navigation to unmount the page and erase the current in-memory cards. The revised plan kept the state and add/delete actions in `App`, above the routes, and passed them into `HomePage` through props.

### Manual Changes or Corrections

The Phase 1 architecture was corrected before implementation. No source files were changed, no packages were installed, and no implementation code was written during this planning step.

### Verification

The repository was inspected and the working tree was confirmed clean before planning. No implementation verification commands were required because this step made no code changes.

---

## Prompt 2 — Phase 1 Implementation

### Goal

Implement the approved routing and page structure while preserving the existing in-memory URL-card behavior.

### Prompt Used

```text
The revised Phase 1 plan is approved.

Implement Phase 1 now.

You are explicitly approved to:

- install `react-router-dom`;
- create `src/components/AppHeader.jsx`;
- create `src/pages/HomePage.jsx`;
- create `src/pages/SavedLinksPage.jsx`;
- modify `src/main.jsx`;
- modify `src/App.jsx`;
- modify `src/App.css`;
- update `package.json` and `package-lock.json` through the dependency installation.

Implementation requirements:

- Wrap App with BrowserRouter in main.jsx.
- Keep the existing cards state and add/delete functions in App.
- Use Routes and Route for:
  - `/`
  - `/saved`
- Pass cards and the existing actions to HomePage through props.
- Reuse LinkForm, CardList, Card, and the URL utilities without modifying them unless compilation requires a minimal justified correction.
- Use NavLink for Home and Saved Links.
- Add `end` to the Home NavLink.
- Use a semantic header and `nav aria-label="Primary navigation"`.
- Keep only one main landmark, owned by App.
- Use a page-specific h1 on each page.
- Display ContextClip in the shared header as the application brand, but not as another h1.
- Make the active navigation state visible through more than color alone.
- Preserve visible keyboard focus styles.
- SavedLinksPage must be a simple explanatory placeholder stating that persistence is not implemented yet.
- Preserve the current in-memory cards when navigating between routes.
- Do not add metadata retrieval, Firebase, authentication, Context, new tests, documentation changes, or unrelated refactoring.
- Do not delete assets.
- Do not commit or push.

After making the changes:

1. Run `npm run lint`.
2. Run `npm run test`.
3. Run `npm run build`.
4. Review the final diff for unrelated changes.

End your response with:

- the dependency installed;
- the files created;
- the files modified;
- how state is preserved between routes;
- verification results;
- any assumptions or issues I should manually review.
```

### AI Contribution

The AI installed `react-router-dom`, wrapped `App` with `BrowserRouter`, and added routes for `/` and `/saved`. It created `AppHeader`, `HomePage`, and `SavedLinksPage`; used `NavLink` with `end` on the Home link; and added active navigation, keyboard focus, responsive header, and placeholder styles. It reused `LinkForm`, `CardList`, `Card`, and the URL utilities without modifying them.

`App` retained ownership of the cards state and the existing add/delete functions. It passed `cards`, `onAddCard`, and `onDeleteCard` to `HomePage`, preserving cards while switching routes.

### Human Review

Manual browser checks confirmed:

- navigation between Home and Saved Links worked;
- direct access to `/saved` worked;
- in-memory cards remained when navigating between routes;
- cards reset after a full reload, matching the existing non-persistent behavior;
- keyboard navigation worked;
- focus styles were visible;
- the layout remained usable on mobile.

### Manual Changes or Corrections

No manual code corrections were made during the initial Phase 1 implementation. Visual issues discovered afterward are documented in Prompt 3.

### Verification

- `npm run lint` passed.
- `npm run test` passed all 13 existing URL utility tests.
- `npm run build` passed.
- The final implementation diff was reviewed for unrelated changes.

---

## Prompt 3 — Manual Review and Visual Correction

### Goal

Correct typography and document-title issues found during manual browser review without changing routing or application behavior.

### Prompt Used

```text
I manually reviewed Phase 1 in the browser and found two issues that were not caught by lint, tests, or build.

1. The Home page h1 wraps onto two lines and the lines overlap.

The cause is in src/index.css:

`font: 18px/145% var(--sans);`

A percentage line-height on the root is computed from the root font size and the resulting fixed value is inherited by the 56px h1.

Correct this by:

- changing the root font declaration to use a unitless line-height:
  `font: 18px/1.45 var(--sans);`
- adding an explicit `line-height: 1.1` to h1;
- preserving the existing font sizes and visual design.

2. The browser tab still displays `vite-base`.

Change the document title in index.html to:

`ContextClip`

Also refactor the nested `@media` rules currently inside `:root`, `h1`, and `h2` into regular top-level media queries. Preserve their existing responsive behavior.

Modify only:

- src/index.css
- index.html

Do not modify routing, components, application behavior, dependencies, or documentation.

After the changes:

- run npm run lint;
- run npm run test;
- run npm run build;
- review the diff for unrelated changes.

Do not commit or push.

End with a concise explanation of the cause, the exact corrections made, and the verification results.
```

### AI Contribution

The AI changed only `src/index.css` and `index.html`. It replaced `font: 18px/145% var(--sans);` with `font: 18px/1.45 var(--sans);`, added `line-height: 1.1` to `h1`, moved the nested responsive declarations for `:root`, `h1`, and `h2` into a regular top-level `@media (max-width: 1024px)` rule, and changed the document title from `vite-base` to `ContextClip`.

### Human Review

Manual browser review found two issues that automated checks did not detect:

1. The multiline Home page heading overlapped because the percentage root line-height was computed from the root font size and inherited as a fixed value by the 56px `h1`.
2. The browser tab still displayed the Vite starter title, `vite-base`.

Visual verification passed after the corrections.

### Manual Changes or Corrections

The human diagnosis identified the CSS inheritance cause and specified a unitless root line-height plus an explicit heading line-height. The correction also included flattening the existing nested media queries and replacing the starter document title.

### Verification

- `npm run lint` passed.
- `npm run test` passed all 13 tests.
- `npm run build` passed.
- The two-file diff was reviewed for unrelated changes and whitespace errors.
- Visual verification passed.

---

## Final AI Assistance Summary

Pending until the later Week 3 phases are finished.

## Manual Improvements and Refactoring Summary

- Human review corrected the Phase 1 state architecture before implementation by keeping cards in `App` above the routes.
- Manual browser testing caught a multiline heading overlap that lint, unit tests, and the production build did not detect.
- The root line-height was changed from a computed percentage to a unitless value, and `h1` received an explicit line-height.
- Nested responsive rules were refactored into a standard top-level media query without changing their responsive values.
- The leftover Vite document title was changed to `ContextClip`.

## Final Verification

Pending until the later Week 3 phases are finished.
