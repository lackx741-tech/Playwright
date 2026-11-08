export function renderDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PageForgeX Dashboard</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: #12101a; color: #ece9f5; }
  header { padding: 20px 28px; border-bottom: 1px solid #2a2440; }
  h1 { margin: 0; font-size: 18px; letter-spacing: 0.08em; text-transform: uppercase; }
  main { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; padding: 24px; }
  section { background: #1b1729; border: 1px solid #2a2440; border-radius: 10px; padding: 16px; }
  h2 { margin: 0 0 12px; font-size: 13px; text-transform: uppercase; color: #a99cd8; }
  textarea, input, select, button { width: 100%; box-sizing: border-box; margin-bottom: 8px; border-radius: 6px; border: 1px solid #332b4d; background: #14111f; color: inherit; padding: 8px; }
  button { background: #6d4dd6; border-color: #6d4dd6; cursor: pointer; font-weight: 600; }
  pre { background: #14111f; border: 1px solid #2a2440; border-radius: 8px; padding: 10px; overflow: auto; max-height: 320px; font-size: 12px; }
</style>
</head>
<body>
<header><h1>PageForgeX Dashboard</h1></header>
<main>
  <section>
    <h2>Browser Intelligence</h2>
    <input id="url" placeholder="https://example.com">
    <button onclick="loadStatus()">Load URL</button>
    <pre id="status"></pre>
  </section>
  <section>
    <h2>Component Registry</h2>
    <button onclick="loadComponents()">Detect Components</button>
    <pre id="components"></pre>
  </section>
  <section>
    <h2>Template Builder</h2>
    <textarea id="html" rows="6" placeholder="<html>...</html>"></textarea>
    <button onclick="analyze()">Analyze</button>
    <pre id="analysis"></pre>
  </section>
  <section>
    <h2>Compiler &amp; Export</h2>
    <input id="name" placeholder="bundle-name" value="pageforgex">
    <button onclick="build()">Build Bundle</button>
    <pre id="build"></pre>
  </section>
</main>
<script>
async function json(url, options) { const res = await fetch(url, options); return res.json(); }
async function loadStatus() {
  document.getElementById('status').textContent = JSON.stringify(await json('/api/status'), null, 2);
}
async function loadComponents() {
  document.getElementById('components').textContent = JSON.stringify(await json('/api/components'), null, 2);
}
async function analyze() {
  const html = document.getElementById('html').value;
  document.getElementById('analysis').textContent = JSON.stringify(await json('/api/analyze', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ html }) }), null, 2);
}
async function build() {
  const html = document.getElementById('html').value;
  const name = document.getElementById('name').value;
  document.getElementById('build').textContent = JSON.stringify(await json('/api/build', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ html, name }) }), null, 2);
}
loadStatus();
</script>
</body>
</html>`;
}
