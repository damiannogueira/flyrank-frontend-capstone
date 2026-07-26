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

## Prompt 4 — Phase 2 Planning and Revision

### Goal

Review the completed Phase 1 application and plan enriched link cards and URL metadata retrieval without implementing changes.

### Prompt Used

Original planning prompt:

```text
Read AGENTS.md and AI_DEVELOPMENT_LOG.md, then inspect the current ContextClip implementation on the branch week-03/contextclip-full-app.

We are starting Week 3 Phase 2: enriched link cards and URL metadata retrieval.

Do not modify files, install packages, or write implementation code yet.

The current application already includes:
- URL validation and normalization;
- duplicate prevention;
- basic cards with URL and domain;
- card deletion;
- routing between Home and Saved Links;
- shared cards state in App;
- automated tests for URL utilities.

Phase 2 should focus only on:
- retrieving metadata for a submitted URL;
- displaying available title, description, domain, image, and favicon;
- keeping the existing URL and domain as reliable fallbacks;
- showing loading, success, error, and partial-data states;
- preserving duplicate prevention and card deletion;
- keeping the implementation realistic for a student React project.

Do not include Firebase, authentication, Saved Links persistence, Context API, or unrelated refactoring in this phase.

Provide a focused Phase 2 plan containing:

1. A review of the current card creation and rendering flow.
2. A comparison of realistic browser-compatible metadata retrieval approaches.
3. CORS, API-key exposure, privacy, rate-limit, reliability, and deployment considerations.
4. Your recommended approach for this assignment and why.
5. The proposed metadata service interface and returned data shape.
6. The state and data flow from URL submission to card rendering.
7. The exact files that would be created or modified.
8. Loading, error, partial-data, and fallback behavior.
9. Accessibility considerations.
10. Automated tests and manual checks required.
11. Any environment variables or external setup that would be necessary.

Prefer the minimum number of dependencies and preserve the current React JavaScript, Vite, and regular CSS stack.

Wait for approval before making any changes.
```

Follow-up revision prompt:

```text
The general Phase 2 direction is approved, but revise the plan before implementing anything.

Keep Microlink as the recommended metadata provider, but make these corrections:

1. Do not state that the unauthenticated quota is exactly 25 requests.
   Treat the free quota as provider-controlled and potentially changeable.
   Mention only that free usage has rate, concurrency, and daily limits, and that the application must handle HTTP 429 without automatic retries.

2. Divide Phase 2 into two independently reviewable implementation steps:

   Phase 2A — Metadata service and automated tests
   - create only the provider-independent metadata service;
   - normalize the Microlink response;
   - create stable error codes;
   - add mocked-fetch tests;
   - do not modify React components or CSS yet.

   Phase 2B — React integration and enriched card UI
   - integrate asynchronous submission;
   - add loading, success, partial, fallback, and rate-limit feedback;
   - render enriched cards and asset fallbacks;
   - add the required styles and manual accessibility checks.

3. Define a precise asynchronous contract between LinkForm and HomePage.

   The plan should explain:
   - which component owns isSubmitting;
   - which component calls fetchLinkMetadata;
   - what the async callback returns;
   - how LinkForm receives the result needed for its live-region message;
   - how App receives only the final normalized card data.

   Prefer a stable result shape such as:

   {
     outcome: 'complete' | 'partial' | 'fallback' | 'rate-limit',
     message: string
   }

   You may revise this shape if another small and clearer contract is preferable.

4. Add a finite request-timeout strategy so an external request cannot leave the form loading indefinitely.
   Explain where AbortController and timeout cleanup should live.
   Keep the solution simple and browser-compatible.

5. Include a short user-facing notice near the form explaining that:
   - metadata retrieval is intended for public URLs;
   - the submitted URL is processed by an external metadata service.

6. Preserve these approved decisions:
   - no Firebase or authentication in Phase 2;
   - no new npm dependency;
   - the locally normalized submitted URL remains the authoritative destination;
   - domain is always derived locally;
   - metadata failure still creates a fallback URL/domain card;
   - no automatic retries;
   - App remains the cards owner above the routes;
   - Card performs no API request.

Return only the revised plan with:
- responsibilities and async data flow;
- the exact files for Phase 2A and Phase 2B;
- service and result shapes;
- timeout and error behavior;
- automated verification for each step;
- manual checks for Phase 2B.

Do not modify files, install packages, commit, or push.
```

### AI Contribution

The AI inspected the current branch, instructions, development log, card flow, URL utilities, dependencies, and styles. It compared browser metadata approaches and proposed Microlink behind a service module, normalized metadata fields, URL/domain fallbacks, async form states, enriched cards, accessibility checks, and automated service tests. The revised plan divided the work into independently reviewable Phase 2A and Phase 2B steps.

### Human Review

Human review corrected the plan to avoid depending on an exact free-request quota, require stable HTTP 429 handling without automatic retries, define clear `LinkForm`/`HomePage`/`App` responsibilities, add a finite request timeout, include a visible public-URL/external-service notice, and split service work from React integration.

### Manual Changes or Corrections

The plan was revised before implementation. No files were modified, no packages were installed, and no code was written during this planning step.

### Verification

The requested branch and current implementation were inspected. No implementation commands were required because planning made no file changes.

---

## Prompt 5 — Phase 2A Metadata Service

### Goal

Create and test the metadata service independently from React.

### Prompt Used

```text
The revised Phase 2 plan is approved.

Implement only Phase 2A: metadata service and automated tests.

You are approved to create only:

- src/services/metadataService.js
- src/services/metadataService.test.js

Do not modify any existing file.
Do not modify React components, CSS, package files, documentation, routing, Firebase files, or environment files.
Do not install packages.
Do not commit or push.

Service requirements:

1. Export:

   fetchLinkMetadata(normalizedUrl, options?)

2. Support these optional injected values:

   {
     fetchImpl,
     timeoutMs
   }

   - Default fetchImpl to the browser/global fetch implementation.
   - Default timeoutMs to 8000.
   - Injection exists only to keep automated tests deterministic.

3. Request Microlink using browser-compatible fetch and construct the endpoint safely with URL and URLSearchParams.

4. The locally submitted URL is authoritative.
   Never return or use Microlink’s returned destination URL or domain.

5. Return only this normalized shape:

   {
     title: string | null,
     description: string | null,
     imageUrl: string | null,
     faviconUrl: string | null
   }

6. Normalize the response using:

   - data.title
   - data.description
   - data.image.url
   - data.logo.url

7. Normalization rules:

   - trim textual values;
   - convert blank strings and unexpected types to null;
   - accept only absolute HTTP or HTTPS asset URLs;
   - return null for absent or malformed optional metadata;
   - allow a successful response containing partial metadata;
   - do not expose the raw provider response.

8. Create and export a small custom error type or equivalent stable error mechanism.

   Expected codes:

   - rate-limit
   - timeout
   - request-failed
   - invalid-response

9. Error behavior:

   - HTTP 429 → rate-limit
   - any other non-success HTTP response → request-failed
   - network rejection → request-failed
   - unreadable JSON or malformed top-level response/data → invalid-response
   - an internally triggered timeout abort → timeout
   - no automatic retries

10. Timeout behavior:

   - create one AbortController per request;
   - pass its signal to fetchImpl;
   - abort after timeoutMs;
   - clear the timer in finally on every path;
   - distinguish the service’s own timeout abort from an unrelated request failure where reasonably possible.

11. Write tests with node:test and mocked fetch.

Required coverage:

- correctly constructed endpoint and encoded submitted URL;
- complete response normalization;
- trimmed title and description;
- empty or invalid text values becoming null;
- absent image and logo;
- malformed nested image and logo values;
- non-HTTP/HTTPS asset URLs becoming null;
- valid partial metadata response;
- HTTP 429;
- another non-success HTTP response;
- rejected fetch;
- invalid JSON;
- missing or malformed top-level data;
- timeout abort and timeout error;
- timeout cleanup after success and failure;
- provider-returned URL and domain excluded from the result.

Keep expected service failures stable and testable. Do not use real network requests.

After implementation:

1. Run npm run lint.
2. Run npm run test.
3. Run npm run build.
4. Run git diff --check.
5. Review the diff and confirm only the two approved files were created.

End your response with:

- files created;
- public exports;
- timeout implementation;
- error codes;
- number of tests added and total tests passing;
- lint and build results;
- any assumption requiring manual review.

Do not commit or push.
```

### AI Contribution

The AI created `src/services/metadataService.js` and `src/services/metadataService.test.js`. The service exports `fetchLinkMetadata` and `MetadataServiceError`, safely constructs the Microlink endpoint, and normalizes title, description, image, and favicon data. The locally submitted URL remains authoritative; provider-returned URL and domain values are not returned.

The service exposes stable `rate-limit`, `timeout`, `request-failed`, and `invalid-response` codes. It creates one `AbortController` per request, uses an 8000 ms default timeout, clears the timer in `finally`, and performs no automatic retries.

### Human Review

No API key, new dependency, environment variable, or real network request was introduced. Tests use injected mocked fetch behavior.

### Manual Changes or Corrections

- The service and its tests were manually reviewed.
- No mandatory code correction was required.
- A minor observation was made that the timeout test uses a real 5 ms timer and could theoretically be timing-sensitive, but it passed consistently and was accepted.
- No service or test file was changed after that review.

### Verification

- 22 new service test cases and subtests were added.
- `npm run test` passed 35/35 total tests.
- `npm run lint` passed.
- `npm run build` passed.
- `git diff --check` passed.
- Only the two approved service files were created.

---

## Prompt 6 — Phase 2B React Integration

### Goal

Integrate asynchronous metadata retrieval and enriched cards while preserving the approved state and service boundaries.

### Prompt Used

```text
Read AGENTS.md and inspect the current Phase 2A metadata service before making changes.

Implement only Week 3 Phase 2B: React integration and enriched link-card UI.

You are approved to modify only:

- src/App.jsx
- src/pages/HomePage.jsx
- src/components/LinkForm.jsx
- src/components/CardList.jsx
- src/components/Card.jsx
- src/App.css

Do not modify:
- metadataService.js or its tests;
- package.json or package-lock.json;
- routing files;
- SavedLinksPage;
- URL utilities or their tests;
- Firebase or authentication files;
- README, AGENTS.md, or AI_DEVELOPMENT_LOG.md;
- environment files.

Do not install packages.
Do not commit or push.

Implementation requirements:

1. Use fetchLinkMetadata from src/services/metadataService.js.

2. Preserve responsibility boundaries:

LinkForm:
- owns the input value;
- owns validation and duplicate errors;
- owns isSubmitting;
- owns the live-region result message;
- validates and normalizes the URL;
- prevents duplicates;
- awaits an async onSubmitUrl(normalizedUrl) callback;
- does not call the metadata service directly.

HomePage:
- implements handleSubmitUrl;
- calls fetchLinkMetadata;
- derives the domain locally with getDomain(normalizedUrl);
- creates the final normalized card data;
- calls onAddCard(finalCardData);
- returns a stable result to LinkForm.

App:
- remains the owner of the cards array;
- receives final normalized card data;
- adds only crypto.randomUUID();
- continues to own deletion.

Card:
- performs no API request;
- renders only supplied data and fallbacks.

3. The async callback must normally resolve with:

{
  outcome: 'complete' | 'partial' | 'fallback' | 'rate-limit',
  message: string
}

4. Metadata-success behavior:

Create final card data:

{
  url: normalizedUrl,
  domain: getDomain(normalizedUrl),
  title: metadata.title,
  description: metadata.description,
  imageUrl: metadata.imageUrl,
  faviconUrl: metadata.faviconUrl
}

- complete: all four optional metadata fields are present;
- partial: one or more optional fields are missing;
- locally normalized URL remains the destination;
- domain always comes from getDomain.

5. Metadata-error behavior:

- rate-limit:
  - add a URL/domain fallback card;
  - return outcome 'rate-limit';
  - explain that the metadata-service limit was reached;
  - do not retry.

- timeout:
  - add a URL/domain fallback card;
  - return outcome 'fallback';
  - explain that metadata retrieval took too long.

- other expected service failures:
  - add a URL/domain fallback card;
  - return outcome 'fallback';
  - explain that metadata was unavailable but the link was added.

- unexpected programming errors:
  - LinkForm must reset isSubmitting in finally;
  - show a generic form-level error;
  - do not leave the form busy indefinitely.

6. LinkForm behavior:

- disable the input and submit button while submitting;
- keep the input value visible while loading;
- change the button label to “Retrieving metadata…”;
- expose aria-busy while loading;
- prevent repeated submission;
- clear the input only after the card was successfully added;
- announce loading and result feedback with a polite live region;
- keep blocking validation errors assertive;
- preserve existing validation and duplicate prevention.

7. Add visible text near the form:

“Metadata retrieval is intended for public URLs. Submitted URLs are processed by an external metadata service.”

This must be normal visible explanatory text, not an alert or tooltip.

8. Enriched Card behavior:

Display:
- preview image when available;
- favicon when available;
- title, falling back to domain;
- description only when available;
- locally derived domain;
- authoritative normalized URL;
- Delete action.

Asset behavior:
- omit missing assets cleanly;
- independently hide a preview image or favicon if it fails to load;
- a broken asset must not remove the card;
- do not invent a favicon URL;
- treat images as decorative when adjacent text provides the same information.

Accessibility:
- make the card link name use title, falling back to domain;
- keep Delete labels contextual using title or domain;
- preserve visible focus styles;
- do not move focus automatically after adding a card;
- do not communicate outcomes through color alone;
- ensure long titles, descriptions, and URLs wrap;
- preserve logical mobile reading order.

9. CSS:

Add only the styles required for:
- enriched cards;
- preview image and favicon;
- public-URL notice;
- loading and feedback states;
- long-text wrapping;
- responsive mobile layout.

Preserve the current visual direction and existing navigation styles.

10. Verification:

After implementation:

- run npm run lint;
- run npm run test;
- run npm run build;
- run git diff --check;
- review the final diff for unrelated changes;
- confirm that only the six approved files changed.

Do not use real network requests in automated tests.
Do not add a component-testing dependency.
Do not commit or push.

End your response with:

- files modified;
- final component responsibility flow;
- complete, partial, fallback, timeout, and rate-limit behavior;
- accessibility and broken-asset behavior;
- lint, test, and build results;
- anything requiring manual browser verification.
```

### AI Contribution

The AI integrated the service across the six approved files. `LinkForm` owns validation, duplicate prevention, `isSubmitting`, and live-region feedback. `HomePage` calls `fetchLinkMetadata`, derives the domain locally, constructs final card data, and returns stable outcomes. `App` remains the cards owner and adds only the generated ID. `Card` performs no API request.

Complete and partial responses create enriched cards. Rate limits, timeouts, and other expected metadata failures create URL/domain fallback cards without retries. Cards display optional image, favicon, title, and description plus locally derived domain, authoritative URL, and Delete. A visible public-URL/external-service notice was added.

### Human Review

The implementation preserved keyboard navigation, visible focus, accessible link and Delete labels, long-text wrapping, responsive order, and outcome messages that do not rely on color alone. Broken preview images and favicons hide independently without removing the card.

### Manual Changes or Corrections

The targeted feedback-reset correction is documented separately in Prompt 7.

### Verification

- Exactly the six approved files were modified.
- `npm run lint` passed.
- `npm run test` passed 35/35 tests.
- `npm run build` passed.
- `git diff --check` passed.

---

## Prompt 7 — Manual Review Correction

### Goal

Clear stale validation and submission feedback when the user begins editing a new URL.

### Prompt Used

```text
Make one targeted manual-review correction in src/components/LinkForm.jsx only.

Problem:
After a completed submission or validation error, the previous feedback remains visible while the user starts typing a new URL. This can make the displayed status no longer correspond to the current input.

Update the URL input onChange behavior so that when the user edits the field it:

- updates inputValue;
- clears the current validation/form error;
- clears the previous submissionResult.

Do not change the async submission flow, validation logic, messages, accessibility attributes, styling, or any other file.

After the change:

- run npm run lint;
- run npm run test;
- run npm run build;
- run git diff --check;
- confirm that only src/components/LinkForm.jsx changed during this correction.

Do not commit or push.
Show the resulting diff and verification results.
```

### AI Contribution

The AI added `handleInputChange` to `LinkForm`. It updates `inputValue` and clears both `error` and `submissionResult` whenever the user edits the field.

### Human Review

Human review found that previous validation or submission feedback remained visible after the user began entering a different URL, causing the message to no longer match the current input.

### Manual Changes or Corrections

Only `src/components/LinkForm.jsx` changed during this correction. The async submission flow, validation behavior, messages, accessibility attributes, and styling were preserved.

### Verification

- `npm run lint` passed.
- `npm run test` passed 35/35 tests.
- `npm run build` passed.
- `git diff --check` passed.

---

## Phase 2 Manual Browser Verification

The following manual checks were completed:

- real complete metadata using React or GitHub;
- partial metadata using example.com;
- duplicate prevention;
- previous feedback cleared when editing the input;
- deletion;
- cards preserved between routes;
- network-offline fallback;
- simulated HTTP 429 fallback;
- simulated timeout and recovery after approximately eight seconds;
- broken preview image and favicon hidden independently;
- keyboard navigation and visible focus;
- mobile layout at approximately 375 px;
- no automatic retries;
- cards still reset after a full page reload because Firebase persistence is not implemented yet.

No screen-reader test is claimed.

---

## Phase 3A - Firebase Client and Anonymous Authentication

### Prompt Summary

Implement only Week 3 Phase 3A:

- install the Firebase client dependency;
- add a lazily initialized Firebase client for App, Auth, and Firestore;
- validate the required Vite environment variables;
- add an anonymous-authentication service;
- reuse existing Firebase initialization and concurrent authentication work;
- expose stable configuration, initialization, and authentication errors;
- add focused unit tests using injected Firebase dependencies;
- provide a safe `.env.example`;
- keep Firestore persistence and React integration out of scope;
- do not commit or push.

After implementation, run lint, tests, build, and diff verification.

### AI Contribution

The AI added:

- `src/services/firebaseClient.js`, containing lazy Firebase initialization, required environment-variable validation, existing-app reuse, and cached initialization results;
- `src/services/authService.js`, containing anonymous authentication, restored-user handling, concurrent-call reuse, observer cleanup, and stable authentication errors;
- focused unit tests for both services;
- `.env.example` with placeholder-only Firebase variables;
- the Firebase client dependency.

The implementation kept React integration and Firestore saved-link persistence outside Phase 3A.

### Human Review

Human review inspected the Firebase client and authentication services before committing them.

The review confirmed:

- missing or blank environment values fail with a stable configuration error;
- Firebase initialization remains lazy;
- an existing Firebase app is reused;
- initialization results and failures are cached;
- concurrent authentication callers reuse one operation;
- restored anonymous users do not trigger another sign-in;
- authentication observers are unsubscribed after success or failure;
- malformed Firebase users map to a stable authentication error;
- the real `.env.local` file is ignored by Git.

The Firebase Console setup was completed manually:

- a ContextClip Firebase project and web app were created;
- anonymous authentication was enabled;
- a default Firestore database was created in production mode;
- real client values were stored only in the ignored `.env.local` file.

### Manual Changes or Corrections

No source-code correction was required after reviewing the Phase 3A implementation.

Dependency security was reviewed manually:

- a safe `npm audit fix` updated the development-only `brace-expansion` dependency from 5.0.7 to 5.0.8;
- `npm audit fix --force` was not used because it proposed a React Router downgrade;
- the remaining React Router advisory concerns React Server Components mode, which ContextClip does not use;
- the blocked `@firebase/util` and `protobufjs` install scripts were inspected;
- both scripts were left blocked because neither is required for the current ContextClip setup.

### Verification

- `npm run lint` passed.
- `npm run test` passed 70/70 tests.
- `npm run build` passed.
- `git diff --check` passed.
- `git diff --cached --check` passed before the feature commit.
- `firebase@12.16.0` is the only new direct dependency.
- `brace-expansion@5.0.8` is installed through the ESLint dependency tree.
- `.env.local` was not staged or committed.
- No Firebase browser lifecycle or persistence behavior is claimed yet; that integration remains deferred to the later Phase 3 steps.

---

## Phase 3B - Firestore Saved Links Service and Security Rules

### Prompt Summary

Implement only Week 3 Phase 3B:

- create a UI-independent Firestore saved-links service;
- store data under `users/{uid}/savedLinks/{linkId}`;
- use Firestore-generated document IDs;
- prevent duplicate saves through a UID-scoped normalized-URL query;
- support saving, newest-first listing, and deletion;
- persist only the fields required by the current cards;
- validate user IDs, document IDs, links, optional text, and web asset URLs;
- expose stable service errors;
- return normalized plain JavaScript objects;
- create focused unit tests using injected Firestore dependencies;
- add production-safe Firestore Security Rules;
- keep React integration, Firebase CLI configuration, and rules deployment outside this phase;
- do not commit or push.

After implementation, run lint, tests, build, and diff verification.

### AI Contribution

The AI added:

- `src/services/savedLinksService.js`;
- `src/services/savedLinksService.test.js`;
- `firestore.rules`.

The saved-links service supports:

- duplicate checks scoped to the authenticated user’s collection;
- Firestore-generated document references;
- normalized saved-link serialization;
- server-generated creation timestamps;
- newest-first Firestore queries;
- plain returned objects containing Firestore document IDs and ISO timestamp strings;
- UID-scoped deletion;
- stable validation, duplicate, and Firestore-request errors;
- dependency injection for isolated unit tests.

The Firestore rules:

- require authentication;
- require `request.auth.uid` to match the user ID in the path;
- validate an exact allowlist of saved-link fields;
- validate field types and maximum lengths;
- permit only HTTP or HTTPS URLs for previews and favicons;
- require the creation timestamp to match `request.time`;
- allow ownership-scoped reads, creates, and deletes;
- deny updates;
- deny unrelated document access by default.

### Human Review

Human review inspected the complete saved-links service, its tests, and the Firestore rules before committing them.

The review confirmed:

- duplicate queries use only `users/{uid}/savedLinks`;
- duplicate detection prevents document creation and writes;
- new records use Firestore-generated IDs;
- only `url`, `domain`, `title`, `description`, `imageUrl`, `faviconUrl`, and `createdAt` are persisted;
- transient card properties are excluded;
- optional blank fields normalize to `null`;
- the normalized URL and locally derived domain remain authoritative;
- listing uses `orderBy('createdAt', 'desc')`;
- returned records are plain objects rather than mutable Firestore snapshots;
- deletion validates both UID and document ID before constructing its path;
- Firestore failures preserve their original causes;
- separate service factories remain isolated;
- the rules match the exact data written by the service.

The rules were reviewed locally but were not published, deployed, or emulator-tested during this phase.

### Manual Changes or Corrections

Human review identified that `listSavedLinks()` called `documentSnapshot.data()` twice for every returned document.

A narrowly scoped AI correction:

- stores the result of `documentSnapshot.data()` in one local variable;
- uses the same object for link normalization and timestamp conversion;
- preserves the public API and returned object shape;
- updates the existing listing test to verify that `data()` is called exactly once.

No correction to `firestore.rules` was required.

### Verification

- `npm run lint` passed.
- `npm run test` passed 87/87 tests.
- Phase 3B added 17 service tests.
- `npm run build` passed.
- `git diff --check` passed.
- `git diff --cached --check` passed after staging the three new files.
- The working tree contained exactly the three approved Phase 3B files before the feature commit.
- No React file was modified.
- No package was installed or updated.
- No real Firebase or network request was made by the tests.
- No Firebase rules were deployed.
- No emulator or Rules Playground result is claimed yet.
- React integration and real persistence verification remain deferred to Phase 3C.

---
## Final AI Assistance Summary

Pending until the later Week 3 phases are finished.

## Manual Improvements and Refactoring Summary

- Human review corrected the Phase 1 state architecture before implementation by keeping cards in `App` above the routes.
- Manual browser testing caught a multiline heading overlap that lint, unit tests, and the production build did not detect.
- The root line-height was changed from a computed percentage to a unitless value, and `h1` received an explicit line-height.
- Nested responsive rules were refactored into a standard top-level media query without changing their responsive values.
- The leftover Vite document title was changed to `ContextClip`.
- Phase 2 was divided into independently reviewable service and React-integration steps.
- Metadata retrieval was isolated behind a normalized service with stable errors, a finite timeout, and mocked-fetch tests.
- The locally normalized URL and locally derived domain remain authoritative when provider metadata is complete, partial, or unavailable.
- Manual browser testing verified complete, partial, offline, rate-limit, timeout, broken-asset, keyboard, route-state, and mobile behaviors.
- Human review improved feedback accuracy by clearing stale validation and submission messages as soon as the URL input is edited.

## Final Verification

Pending until the later Week 3 phases are finished.
