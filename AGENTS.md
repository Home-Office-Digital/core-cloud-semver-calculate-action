# Repository Guidance

## Project

This repository contains a GitHub Action that calculates the next SemVer tag. The action runs `dist/index.js`; implementation code and tests live in `src/` and `test/`.

## Development

- Prefer readable, straightforward code over the shortest or most optimized implementation.
- Add or update tests for behavior changes. Use a test-first approach when practical.
- Run `npm test` and `npm run lint` for relevant changes. Run `npm run all` before submitting when practical; it also builds the action bundle.
- When changing action behavior in `src/`, rebuild and include the generated `dist/index.js` with `npm run build`. Do not hand-edit generated bundle contents.
- Keep the README and action metadata accurate when changing inputs, outputs, supported events, or usage.