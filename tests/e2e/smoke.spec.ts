import { test as base, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SECTION_IDS = ['profile', 'record', 'operations', 'arsenal', 'education', 'contact'];

/**
 * Console errors and uncaught exceptions fail the test that produced them.
 * Nothing is ignored: WebGL driver chatter shows up as console.warn, which is not collected.
 * Google Fonts is stubbed so the run is hermetic (an offline runner would otherwise log
 * "Failed to load resource" errors that say nothing about the site).
 */
const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
      });
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, (r) =>
        r.fulfill({ status: 200, contentType: 'text/css', body: '' }),
      );
      await use(errors);
      expect(errors, 'console errors').toEqual([]);
    },
    { auto: true },
  ],
});

/** Load the site, skip the boot terminal with a key press and wait for the dossier. */
async function enterDossier(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Secure terminal' })).toBeVisible();
  await page.keyboard.press('Space');
  await expect(page.locator('#profile')).toBeInViewport({ timeout: 3000 });
}

/**
 * Scroll a section into view and wait until its whileInView reveal has finished.
 * Playwright counts opacity 0 as visible, so the end of the fade is asserted explicitly.
 */
async function reveal(page: Page, id: string) {
  const section = page.locator(`#${id}`);
  await section.scrollIntoViewIfNeeded();
  await section.evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await expect(section, `#${id} revealed`).toHaveCSS('opacity', '1');
  return section;
}

async function revealAll(page: Page) {
  for (const id of SECTION_IDS) await reveal(page, id);
}

/**
 * Elements whose box pokes outside the viewport horizontally. `overflow-x: clip` on the page
 * root hides real overflow from scrollWidth, so boxes are measured directly. Hidden elements
 * and anything inside an internally scrolling container (e.g. the SectionTabs bar) are skipped.
 */
function horizontalOverflow(root: Locator) {
  return root.evaluate((rootEl) => {
    const vw = window.innerWidth;
    const out: string[] = [];
    const hiddenOrScrolling = (el: Element) => {
      for (let n: Element | null = el; n; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return true;
        if (n !== el && (cs.overflowX === 'auto' || cs.overflowX === 'scroll')) return true;
      }
      return false;
    };
    for (const el of [rootEl, ...rootEl.querySelectorAll('*')]) {
      if (el instanceof SVGElement && !(el instanceof SVGSVGElement)) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.left >= -1 && r.right <= vw + 1) continue;
      if (hiddenOrScrolling(el)) continue;
      const cls = typeof el.className === 'string' ? el.className.slice(0, 40) : '';
      out.push(`${el.tagName.toLowerCase()}.${cls} [${Math.round(r.left)}..${Math.round(r.right)}] vw=${vw}`);
    }
    return out;
  });
}

/**
 * horizontalOverflow() deliberately skips everything inside an internally scrolling container,
 * so those containers are checked here directly: every element under `root` (and root itself)
 * that scrolls (overflow-x auto|scroll, which `overflow-y: auto` also computes to) must not
 * have content wider than its own box. `count` lets callers prove the check was not vacuous.
 */
function scrollerOverflow(root: Locator) {
  return root.evaluate((rootEl) => {
    const wide: string[] = [];
    let count = 0;
    for (const el of [rootEl, ...rootEl.querySelectorAll('*')]) {
      const cs = getComputedStyle(el);
      if (cs.overflowX !== 'auto' && cs.overflowX !== 'scroll') continue;
      count++;
      if (el.scrollWidth > el.clientWidth) {
        wide.push(`${el.tagName.toLowerCase()} scrollWidth=${el.scrollWidth} clientWidth=${el.clientWidth}`);
      }
    }
    return { count, wide };
  });
}

/** Open a case file from its card button and check the dialog fits the viewport. */
async function openCaseFile(page: Page, trigger: Locator) {
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { level: 2 })).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');

  // The panel never animates its own box, but poll anyway so a settling layout can't flake.
  await expect
    .poll(async () => {
      const box = await dialog.boundingBox();
      const vp = page.viewportSize()!;
      return !!box && box.x >= 0 && box.y >= 0 && box.x + box.width <= vp.width && box.y + box.height <= vp.height;
    })
    .toBe(true);
  // The body sits in a scrolling container, which horizontalOverflow() skips: check it directly.
  // The open animation briefly over-measures the content (seen as 18px at 1280 wide), so wait
  // for it to settle; the settled state is what has to fit.
  expect((await scrollerOverflow(dialog)).count, 'dialog has a scroll container').toBeGreaterThan(0);
  await expect
    .poll(async () => (await scrollerOverflow(dialog)).wide, {
      message: 'dialog scroll containers wider than their box',
    })
    .toEqual([]);
  expect(await horizontalOverflow(dialog)).toEqual([]);
  return dialog;
}

/** After closing: the role drops at once, then the whole overlay unmounts. */
async function expectCaseFileGone(page: Page, trigger: Locator) {
  // Closing drops the dialog role at once; the node itself outlives the exit animation.
  await expect(page.getByRole('dialog')).toHaveCount(0);
  // After the exit animation nothing of the file may stay in the DOM.
  await expect(page.getByTestId('casefile-backdrop')).toHaveCount(0);
  await expect(page.locator('[inert]')).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  // Focus goes back to the card that opened it.
  await expect(trigger).toBeFocused();
}

/** Open the HIVEMIND case file, check it, close it with Escape and check it is really gone. */
async function openCloseCaseFile(page: Page) {
  const trigger = page.getByRole('button', { name: /HIVEMIND/ });
  const dialog = await openCaseFile(page, trigger);
  await expect(dialog.getByRole('heading', { level: 2 })).toContainText('HIVEMIND');
  await page.keyboard.press('Escape');
  await expectCaseFileGone(page, trigger);
}

test.describe('boot and phases', () => {
  test('boot terminal skips on a key press and lands on the dossier', async ({ page }) => {
    await enterDossier(page);
    await expect(page.locator('#profile')).toBeVisible();
  });

  test('a reload in the same session skips the boot terminal', async ({ page }) => {
    await enterDossier(page);
    await page.reload();
    await expect(page.locator('#profile')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Secure terminal' })).toHaveCount(0);
  });

  test('dossier appears without WebGL', async ({ page }) => {
    await disableWebGL(page);
    await enterDossier(page);
    await expect(page.locator('#profile')).toBeVisible();
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('first load shows the static boot terminal, then fades to the dossier on its own', async ({ page }) => {
      await page.goto('/');
      const terminal = page.getByRole('region', { name: 'Secure terminal' });
      await expect(terminal).toBeVisible();
      // Static: every line is already on screen, nothing is typed.
      await expect(terminal.getByText(/MATCH FOUND/)).toBeVisible();
      await expect(page.locator('#profile')).toBeInViewport({ timeout: 5000 });
      await expect(terminal).toHaveCount(0);
    });

    test('a case file still opens and closes', async ({ page }) => {
      await enterDossier(page);
      await openCloseCaseFile(page);
    });
  });
});

/** Every request for three.js or a WebGL renderer chunk made by `page` from now on. */
function watchWebglChunks(page: Page) {
  const urls: string[] = [];
  page.on('request', (r) => {
    if (/\/assets\/(three|crtRenderer|grainRenderer|fullscreenQuad)-[^/]*\.js/.test(r.url())) urls.push(r.url());
  });
  return urls;
}

/** Block WebGL context creation (canvas 2D still works). */
async function disableWebGL(page: Page) {
  await page.addInitScript(() => {
    const real = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (/webgl/i.test(type)) return null;
      return (real as (...a: unknown[]) => unknown).call(this, type, ...rest);
    } as typeof real;
  });
}

test.describe('three.js loads only when WebGL effects run', () => {
  test('when the WebGL probe passes, three.js and both renderers are fetched (control)', async ({ page, errors }) => {
    // Headless Chromium on the test runner has no WebGL at all, so report it to the probe only
    // (a detached canvas). Each renderer's own canvas is attached and still gets no context,
    // so both fall back as on a real device whose GPU fails late; three.js logs that.
    await page.addInitScript(() => {
      const real = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (/webgl/i.test(type) && !this.isConnected) return { getExtension: () => null };
        return (real as (...a: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof real;
    });
    const urls = watchWebglChunks(page);
    await enterDossier(page);
    await page.waitForLoadState('networkidle');
    for (const chunk of ['three', 'crtRenderer', 'grainRenderer']) {
      expect(urls.some((u) => u.includes(`/assets/${chunk}-`)), `${chunk} chunk requested`).toBe(true);
    }
    // The late context failure above is expected here; anything else still fails the test.
    const expected = /THREE\.WebGLRenderer: (A WebGL context could not be created|Error creating WebGL context)/;
    for (let i = errors.length - 1; i >= 0; i--) if (expected.test(errors[i])) errors.splice(i, 1);
  });

  test('without WebGL, no three.js or renderer chunk is requested', async ({ page }) => {
    await disableWebGL(page);
    const urls = watchWebglChunks(page);
    await enterDossier(page);
    await page.waitForLoadState('networkidle');
    expect(urls).toEqual([]);
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('no three.js or renderer chunk is requested, even through a boot replay', async ({ page }) => {
      const urls = watchWebglChunks(page);
      await enterDossier(page);
      await page.getByRole('button', { name: /replay boot/i }).click();
      await expect(page.getByRole('region', { name: 'Secure terminal' })).toBeVisible();
      await page.keyboard.press('Space');
      await expect(page.locator('#profile')).toBeVisible();
      await page.waitForLoadState('networkidle');
      expect(urls).toEqual([]);
    });
  });
});

test.describe('language toggle', () => {
  test('ID switches <html lang> and survives a reload', async ({ page }) => {
    await enterDossier(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByRole('button', { name: 'ID', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');
    await expect(page.getByRole('button', { name: 'ID', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('operations', () => {
  test('15 case cards: 6 classified, 9 declassified', async ({ page }) => {
    await enterDossier(page);
    await reveal(page, 'operations');
    const cards = page.locator('#operations article');
    await expect(cards).toHaveCount(15);
    await expect(cards.getByText('CLASSIFIED', { exact: true })).toHaveCount(6);
    await expect(cards.getByText('DECLASSIFIED', { exact: true })).toHaveCount(9);
  });

  test('HIVEMIND case file opens inside the viewport, Escape closes it and it unmounts', async ({ page }) => {
    await enterDossier(page);
    await reveal(page, 'operations');
    await openCloseCaseFile(page);
  });

  test('every case file opens, fits and closes (all 15)', async ({ page }) => {
    // 15 open/close round trips of ~1.5 s each; the default 30 s is too tight under parallel load.
    test.slow();
    await enterDossier(page);
    await reveal(page, 'operations');
    const buttons = page.locator('#operations article button[aria-haspopup="dialog"]');
    await expect(buttons).toHaveCount(15);
    for (let i = 0; i < 15; i++) {
      const trigger = buttons.nth(i);
      await openCaseFile(page, trigger);
      // Alternate the two keyboard/pointer exits so both stay covered.
      if (i % 2 === 0) await page.keyboard.press('Escape');
      else await page.getByRole('button', { name: /close file/i }).click();
      await expectCaseFileGone(page, trigger);
    }
  });

  test('clicking the backdrop closes the case file', async ({ page }, info) => {
    // On phones the panel fills the screen, so there is no backdrop area to click.
    test.skip(info.project.name === 'mobile', 'panel is full-screen on phones');
    await enterDossier(page);
    await reveal(page, 'operations');
    const trigger = page.getByRole('button', { name: /HIVEMIND/ });
    await openCaseFile(page, trigger);
    const panel = (await page.getByRole('dialog').boundingBox())!;
    const backdrop = page.getByTestId('casefile-backdrop');
    // A point left of the panel is on the backdrop, not on the panel.
    const x = Math.floor(panel.x / 2);
    expect(x).toBeGreaterThan(0);
    await backdrop.click({ position: { x, y: 400 } });
    await expectCaseFileGone(page, trigger);
  });
});

/**
 * Short phone screens: a section far taller than the viewport (Operations runs ~7500px on a
 * phone) must still reveal when it is scrolled through, so nothing stays at opacity 0.
 * Runs in the mobile project only (touch emulation), at sizes below its 375×812 default.
 */
test.describe('scroll reveal on short phones', () => {
  const sizes = [
    { width: 360, height: 560, lang: 'en' },
    { width: 320, height: 568, lang: 'en' },
    { width: 360, height: 616, lang: 'id' },
  ] as const;

  for (const { width, height, lang } of sizes) {
    test.describe(`${width}×${height} (${lang})`, () => {
      test.use({ viewport: { width, height } });

      test('every section reaches opacity 1 after scrolling through the page', async ({ page }, info) => {
        test.skip(info.project.name !== 'mobile', 'phone sizes run in the mobile project');
        await enterDossier(page);
        if (lang === 'id') await page.getByRole('button', { name: 'ID', exact: true }).click();
        // Step down the page like a reader would, never jumping a section into view.
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        const step = Math.floor(height * 0.6);
        for (let y = 0; y <= total; y += step) {
          await page.mouse.wheel(0, step);
          await page.waitForTimeout(60);
        }
        for (const id of SECTION_IDS) {
          await expect(page.locator(`#${id}`), `#${id} revealed`).toHaveCSS('opacity', '1');
        }
      });
    });
  }
});

test.describe('layout', () => {
  test('no horizontal overflow in any section', async ({ page }, info) => {
    await enterDossier(page);
    const mobile = info.project.name === 'mobile';
    for (const id of SECTION_IDS) {
      const section = await reveal(page, id);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `scrollWidth in #${id}`,
      ).toBe(true);
      // `overflow-x: clip` can hide overflow from scrollWidth, so measure boxes too.
      expect(await horizontalOverflow(section), `boxes in #${id}`).toEqual([]);
      if (mobile) expect(page.viewportSize()!.width).toBe(375);
    }
    expect(await horizontalOverflow(page.locator('header'))).toEqual([]);
    // SectionTabs scrolls internally (its children are skipped above), so test the scroller itself.
    const tabs = page.getByRole('navigation', { name: 'Dossier sections' });
    const box = (await tabs.boundingBox())!;
    expect(box.x, 'section tabs left').toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, 'section tabs right').toBeLessThanOrEqual(page.viewportSize()!.width);
  });

  test('every case card fits the viewport width', async ({ page }) => {
    await enterDossier(page);
    await reveal(page, 'operations');
    const vw = page.viewportSize()!.width;
    const cards = page.locator('#operations article');
    for (let i = 0; i < 15; i++) {
      const card = cards.nth(i);
      await card.scrollIntoViewIfNeeded();
      const box = (await card.boundingBox())!;
      expect(box.x, `card ${i} left`).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, `card ${i} right`).toBeLessThanOrEqual(vw);
    }
  });
});

test.describe('meta', () => {
  test('head carries the title, description, Open Graph, Twitter and theme tags', async ({ page, request }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Egie Sugina — Classified Dossier');
    const meta = (sel: string) => page.locator(`head meta[${sel}]`).getAttribute('content');
    expect((await meta('name="description"'))?.length).toBeGreaterThan(40);
    expect(await meta('property="og:title"')).toBeTruthy();
    expect(await meta('property="og:description"')).toBeTruthy();
    expect(await meta('property="og:image"')).toBe('https://errorgeist.id/og.png');
    expect(await meta('property="og:url"')).toBe('https://errorgeist.id/');
    expect(await meta('name="twitter:card"')).toBe('summary_large_image');
    expect(await meta('name="theme-color"')).toBe('#0b0d0c');
    await expect(page.locator('head link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
    for (const path of ['/og.png', '/favicon.svg']) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
    }
    expect((await request.get('/og.png')).headers()['content-type']).toContain('image/png');
  });
});

test.describe('accessibility (axe)', () => {
  const serious = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
    violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');

  async function scan(page: Page, label: string) {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();
    for (const v of violations) {
      console.log(`axe[${label}] ${v.impact} ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
    }
    expect(serious(violations), `axe ${label}`).toEqual([]);
  }

  test('boot terminal', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('region', { name: 'Secure terminal' })).toBeVisible();
    await scan(page, 'boot');
  });

  test('dossier, English', async ({ page }) => {
    await enterDossier(page);
    await revealAll(page);
    await scan(page, 'dossier-en');
  });

  test('dossier, Indonesian', async ({ page }) => {
    await enterDossier(page);
    await page.getByRole('button', { name: 'ID', exact: true }).click();
    await revealAll(page);
    await scan(page, 'dossier-id');
  });

  test('open case file', async ({ page }) => {
    await enterDossier(page);
    await reveal(page, 'operations');
    await page.getByRole('button', { name: /HIVEMIND/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.waitForTimeout(700);
    await scan(page, 'casefile');
  });
});
