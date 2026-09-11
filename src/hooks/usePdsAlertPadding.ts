import { RefObject, useEffect } from 'react';

/**
 * Force pds-alert's inner container to 16px padding on both axes.
 *
 * Extracted verbatim from ExpertAgentsNullState, which carries the full rationale. The
 * short version, because every line of it is load-bearing:
 *
 *  • pds-alert pads `--pine-dimension-250` (20px) as a shorthand on
 *    `.pds-alert__container`, which lives in its shadow root behind no `part`, so a token
 *    override cannot reach it. This is the only shadow-piercing rule in the app.
 *  • It must WAIT for the shadow root. Pine upgrades custom elements asynchronously, so on
 *    a cold load `shadowRoot` is usually still null on the first effect run.
 *  • The retry is `setTimeout`, not `requestAnimationFrame` — rAF does not run in a
 *    background tab, so a page opened in one would lose the override.
 *  • The selector must be `.pds-alert__container.pds-box` (0,2,0), not
 *    `.pds-alert__container` (0,1,0). Adopting the sheet as soon as the root exists puts it
 *    BEFORE Pine's own sheet, so at equal specificity Pine wins and the padding stays 20px.
 *
 * ExpertAgentsNullState still has its own inline copy; it can adopt this hook whenever
 * someone touches that file. Left alone here so this change cannot regress the EA route.
 */
export function usePdsAlertPadding(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof CSSStyleSheet === 'undefined') return;

    let timer = 0;
    let attempts = 0;
    let cancelled = false;
    let sheet: CSSStyleSheet | null = null;
    let root: ShadowRoot | null = null;

    const attach = () => {
      if (cancelled || sheet) return;

      root = el.shadowRoot;
      if (!root) {
        // ~1s of retries, far longer than hydration takes
        if (attempts++ < 40) timer = window.setTimeout(attach, 25);
        return;
      }

      sheet = new CSSStyleSheet();
      sheet.replaceSync(
        '.pds-alert__container.pds-box{'
          + 'padding-inline:var(--pine-dimension-200);' // 16px
          + 'padding-block:var(--pine-dimension-200);'  // 16px → strip is 75 tall (16+43+16)
          + '}'
      );
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    };

    attach();
    customElements.whenDefined('pds-alert').then(attach);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (root && sheet) {
        const applied = sheet;
        root.adoptedStyleSheets = root.adoptedStyleSheets.filter(
          (s: CSSStyleSheet) => s !== applied
        );
      }
    };
  }, [ref]);
}
