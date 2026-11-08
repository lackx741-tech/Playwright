# How to Run PageForgeX

This guide covers installing, running, and verifying the application. It assumes a
POSIX shell (Linux/macOS) and Node.js 20 or newer.

## 1. Requirements

| Requirement | Version | Notes |
| --- | --- | --- |
| Node.js | 20+ | `node --version` to check |
| npm | 9+ | ships with Node |
| Chromium | latest | only needed for `scan` and screenshots |

Everything except live URL scanning works without a browser.

## 2. Install

```bash
npm install
```

`playwright` is an optional dependency, so `npm install` succeeds even if the browser
package cannot be fetched. Confirm the install:

```bash
npm run typecheck
npm test
```

`npm test` runs 50 tests across 7 files and does not launch a browser.

## 3. Install the browser (optional)

Only needed for `scan <url>` and `--screenshot`:

```bash
npx playwright install chromium
```

## 4. Run the CLI

There are two equivalent ways to invoke the CLI.

From TypeScript sources (no build step, best for development):

```bash
npm run dev -- <command> [options]
```

From the compiled output (run `npm run build` first):

```bash
npm run build
npm start -- <command> [options]
```

The `--` separates npm's own flags from the arguments passed to PageForgeX.

### Commands

| Command | What it does |
| --- | --- |
| `scan <url>` | Render the URL with Playwright, detect components, build and export a bundle |
| `parse <file.html>` | Parse a local HTML file and print DOM statistics |
| `components` | Print the built-in component schemas |
| `template <file.html> --name <name>` | Build a template definition from a file |
| `build <file.html> --name <name>` | Compile a bundle and export JS/HTML/JSON/ZIP |
| `dashboard` | Serve the visual builder UI and JSON API |
| `validate-url <url>` | Run the security URL validator |
| `help` | Print usage |

### Examples

Parse a local file:

```bash
npm run dev -- parse tests/fixtures/sample.html
```

Build a bundle from a local file:

```bash
npm run dev -- build tests/fixtures/sample.html --name demo
```

This writes:

```
output/bundles/demo.js
output/bundles/demo.js.map
output/templates/demo.html
output/templates/demo.manifest.json
output/archives/demo.zip
```

Scan a live site:

```bash
npm run dev -- scan https://example.com --name example
```

Add `--screenshot` to also capture a PNG into `public/previews/`.

Useful flags:

- `--name <bundle>` sets the output name (defaults to a timestamped name).
- `--screenshot` captures a full-page PNG (scan only).
- `--no-export` runs the pipeline without writing files (scan only).
- `--no-zip` skips the ZIP archive.
- `--out <file>` writes a template to disk instead of stdout (`template` only).
- `--json` prints full detected-component detail (`parse` only).
- `--port <n>` sets the dashboard port.

## 5. Run the dashboard

```bash
npm run build          # once
npm run dashboard      # serves http://0.0.0.0:12000
```

Then open `http://localhost:12000`. Stop it with `Ctrl+C`.

The dashboard exposes a small JSON API:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/status` | Module and component status |
| GET | `/api/components` | Component catalog |
| GET | `/api/templates` | Templates created in the session |
| GET | `/api/settings` | Current compiler settings |
| POST | `/api/analyze` | Analyze HTML or a URL |
| POST | `/api/build` | Compile and export a bundle |

## 6. Configuration

All settings are read from `PAGEFORGEX_*` environment variables. Copy the template
and export the values before running:

```bash
cp .env.example .env
set -a; . ./.env; set +a
npm run dev -- build tests/fixtures/sample.html --name demo
```

The code reads the process environment directly; it does not parse `.env` itself.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PAGEFORGEX_OUTPUT_DIR` | `output` | Base directory for bundles, templates, archives |
| `PAGEFORGEX_BROWSER_HEADLESS` | `true` | Run Chromium headless |
| `PAGEFORGEX_NAV_TIMEOUT_MS` | `30000` | Navigation timeout |
| `PAGEFORGEX_ACTION_TIMEOUT_MS` | `10000` | Per-action timeout |
| `PAGEFORGEX_USER_AGENT` | (browser default) | Override the User-Agent |
| `PAGEFORGEX_BASE_URI` | (none) | Base URI for resolving relative URLs |
| `PAGEFORGEX_ALLOW_PRIVATE_NETWORK` | `false` | Allow localhost/private-IP targets |
| `PAGEFORGEX_DASHBOARD_PORT` | `12000` | Dashboard listen port |

One-off overrides work without a `.env` file:

```bash
PAGEFORGEX_OUTPUT_DIR=/tmp/pfx-out npm run dev -- build tests/fixtures/sample.html --name demo
```

## 7. Scanning local pages

The URL validator blocks private addresses by default. To scan a local server, opt in:

```bash
python3 -m http.server 8099 --directory tests/fixtures &
PAGEFORGEX_ALLOW_PRIVATE_NETWORK=true \
  npm run dev -- scan http://127.0.0.1:8099/sample.html --name local --screenshot
```

## 8. Troubleshooting

**`Playwright is not available`** — run `npm install` then `npx playwright install chromium`.

**`Blocked private network target`** — expected for localhost. Set
`PAGEFORGEX_ALLOW_PRIVATE_NETWORK=true` if you intend to scan a local address.

**`Cannot find module '.../dist/src/cli/index.js'`** — you ran `npm start` before
building. Run `npm run build` first, or use `npm run dev --` instead.

**`listen EADDRINUSE ... :12000`** — another dashboard is already running. Stop it
with `Ctrl+C`, or pick another port with `--port 12001` or `PAGEFORGEX_DASHBOARD_PORT`.

**`Unknown component type`** — a template references a component that is not in the
registry. Run `npm run dev -- components` to list valid types.

**`Playwright is not available` during tests** — this should not happen; the test
suite never launches a browser and passes with no browser installed. If you see it,
a test fixture was changed to use a URL — switch it back to inline HTML.

## 9. Verifying a change

```bash
npm run typecheck   # no type errors
npm test            # 50 tests pass
npm run build       # emits dist/
```
