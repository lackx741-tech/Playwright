# AGENTS.md

Repository knowledge for PageForgeX (Playwright monolith).

## What this is

A monolithic Node.js/TypeScript application that loads a page with Playwright, parses the
rendered DOM with Cheerio, detects reusable UI components into a registry, assembles a
template, compiles a browser-ready JavaScript bundle, and exports JS/HTML/assets/ZIP.

## Commands

```bash
npm install                 # installs deps; playwright is an optionalDependency
npx playwright install chromium   # required only for URL scanning / screenshots
npm run build               # tsc -> dist/
npm run typecheck           # tsc --noEmit
npm test                    # vitest run
npm run dev -- <command>    # run the CLI from source via tsx
npm start -- <command>      # run the CLI from dist/
```

CLI commands: `scan <url>`, `parse <file.html>`, `components`, `template <file.html> --name <n>`,
`build <file.html> --name <n>`, `dashboard [--port]`, `validate-url <url>`, `help`.

## Layout

- `config/` – typed config modules reading `PAGEFORGEX_*` env vars (`env.ts` helpers).
- `src/core/types.ts` – shared types for schemas, snapshots, templates, bundles, validation.
- `src/playwright/` – browser lifecycle (`BrowserManager`), page loading, DOM snapshots,
  screenshots, and regex-based `ResourceCollector` asset extraction.
- `src/cheerio/` – parsing, element tree extraction, DOM statistics, selector engine, sanitizer.
- `src/components/` – registry plus `registry/` definitions and `schemas/` helpers.
- `src/templates/`, `src/transformations/` – template assembly/render and DOM->component conversion.
- `src/compiler/` – runtime/entry/sourcemap generation, CSS + dependency bundling.
- `src/exporter/` – JS/HTML/asset writers, hand-rolled ZIP (no archiver dependency), manifest.
- `src/security/` – URL validation (blocks private network by default), sanitizer, script policy.
- `src/storage/` – file-backed `JsonStore` and repositories (projects, components, templates, builds).
- `src/dashboard/` – dependency-free `node:http` server serving a static dashboard plus JSON API.
- `src/cli/` – arg parser and command dispatch.

## Conventions and gotchas

- ESM with `NodeNext` resolution: every relative import must end in `.js`.
- `tsconfig.json` uses `rootDir: "."` and compiles both `src/` and `config/` to `dist/`,
  so build output lives under `dist/src/...` and `dist/config/...`.
- Browser resources must be released: `PageLoader`/`ScreenshotCapture` expose `shutdown()`,
  and `MonolithApp.shutdown()` calls them. The CLI calls it in a `finally` block.
- Generated output goes to `output/{bundles,templates,archives}` and is gitignored.
- Tests never require a real browser; they cover the parse -> detect -> template -> compile -> export path.

## Verification

`npm run typecheck && npm test` must pass (7 files, 50 tests). A real browser run needs
`npx playwright install chromium` and `PAGEFORGEX_ALLOW_PRIVATE_NETWORK=true` when targeting localhost.
