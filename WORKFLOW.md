# FE-03 Workflow Comparison

## Feature

For FE-03, I implemented the same ContextClip feature twice: a user can enter or paste a URL and convert a valid link into a visual card.

Both implementations started from the same React, JavaScript, Vite, and regular CSS base stored in `main`.

## Round One: Vague Prompt

The first branch, `fe-03/vague-prompt`, was created from one short prompt with almost no project context. Claude generated a single large component, `src/URLArchive.jsx`, with 477 lines. It also assumed that the project used `lucide-react` and Tailwind CSS.

The first run failed because `lucide-react` was imported but not installed. I had to install the dependency manually. After that, the component rendered, but much of the layout was broken because the project did not have Tailwind configured. ESLint also failed because the generated file imported `React` without using it, so I removed that unused import.

The main behavior worked: a valid URL created a card and an invalid URL disabled submission. However, the invalid state did not explain the problem to the user, duplicate links were allowed, and there were no automated tests.

## Round Two: Precise Workflow

The second branch, `fe-03/precise-prompt`, used the real project files, explicit constraints, expected behavior examples, a planning phase, code review, and verification requirements.

The result separated the interface into `LinkForm`, `CardList`, and `Card`, while URL logic was placed in `src/utils/url.js`. The implementation used only the existing stack and added no dependencies. It provides visible and accessible errors for empty, invalid, and duplicate URLs, safely opens links in a new tab, supports deletion, and has a clear empty state.

During review, I caught an AI validation mistake: relying only on `new URL()` could accept `https://hello`, and unsupported schemes such as `mailto:` could be rewritten incorrectly. I asked Claude to add hostname and explicit-scheme checks before applying the code.

## Verification and Review Effort

The precise version passed:

- `npm run lint`
- `npm run test` with 13 passing tests
- `npm run build`
- manual checks for keyboard navigation, visible focus, mobile layout, duplicates, validation, URL normalization, and deletion

The vague round was faster to generate, but required more manual repair and still produced a broken layout. The precise round took longer during planning and review, but was faster and safer end-to-end because the final implementation matched the project, handled edge cases, and was already verifiable.
