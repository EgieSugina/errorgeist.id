#!/usr/bin/env node
// Renders public/og.png (1200x630) from an inline SVG template with @resvg/resvg-js.
// Text only: no subject photo. Run with `node scripts/make-og.mjs`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'public/og.png');

const MONO = "'DejaVu Sans Mono', 'Courier New', monospace";
const SANS = "'DejaVu Sans', Arial, sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="lamp" cx="25%" cy="0%" r="90%">
      <stop offset="0" stop-color="#3a3226" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#0b0907" stop-opacity="0"/>
    </radialGradient>
    <pattern id="lines" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="1" fill="#e6dcc4" opacity="0.035"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#0b0907"/>
  <rect width="1200" height="630" fill="url(#lamp)"/>
  <rect width="1200" height="630" fill="url(#lines)"/>

  <!-- folder -->
  <rect x="60" y="60" width="1080" height="510" rx="6" fill="#1a1612" stroke="#3a3226" stroke-width="2"/>
  <rect x="60" y="60" width="260" height="38" fill="#2b241a" stroke="#3a3226" stroke-width="2"/>
  <text x="82" y="86" font-family="${MONO}" font-size="18" letter-spacing="3" fill="#b3a586">FILE NO. 0816-ES</text>

  <text x="110" y="250" font-family="${SANS}" font-weight="700" font-size="96" letter-spacing="3" fill="#e6dcc4">EGIE SUGINA</text>
  <text x="112" y="318" font-family="${MONO}" font-size="34" letter-spacing="3" fill="#b3a586">FULL STACK / BACKEND ENGINEER</text>

  <!-- redaction bars -->
  <rect x="112" y="362" width="420" height="18" fill="#000"/>
  <rect x="112" y="394" width="300" height="18" fill="#000"/>

  <!-- stamp -->
  <g transform="rotate(-10 880 440)" fill="none" stroke="#c0262d">
    <rect x="690" y="385" width="380" height="110" rx="8" stroke-width="8"/>
    <rect x="702" y="397" width="356" height="86" rx="4" stroke-width="2"/>
    <text x="880" y="456" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="48" letter-spacing="4" fill="#c0262d" stroke="none">TOP SECRET</text>
  </g>

  <text x="112" y="510" font-family="${MONO}" font-size="32" letter-spacing="2" fill="#39ff6a">&gt; errorgeist.id</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: true, defaultFontFamily: 'DejaVu Sans' },
});
const png = resvg.render().asPng();
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);
console.log(`og image: wrote ${out} (${png.length} bytes)`);
