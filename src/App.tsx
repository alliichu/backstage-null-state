import { useEffect } from 'react';
import { AppShell } from './shell/AppShell/AppShell';
import { BackstageNullState } from './components/BackstageNullState/BackstageNullState';
import { DemoSequence } from './components/BackstageDemo/DemoSequence';
import { BACKSTAGE_CONTENT } from './data/backstageContent';

/**
 * This repo is Backstage only. It started life as a fork of the Expert Agents null-state
 * prototype (same shell, same conventions — see that repo, `expert-agents-null-state`, if
 * you need it) and was split off 2026-09-11 into its own private repo so the two could be
 * shared and worked on independently. Expert Agents' page, its demo panel, and its page copy
 * were removed here on purpose; this repo carries no Expert Agents content or route.
 *
 * `/` and `/backstage` both render the same page — the CONTINUOUS LOOP, storyboarded in
 * Figma (page `↳ Null State [WIP🚧]`, section "Backstage Animation Story board", `2369:49374`)
 * on 2026-09-09/10. Everything happens inside the panel: two
 * messages and a meeting notification arrive like texts, the notification opens into the
 * call, closes to a trace, then the panes slide to Resources and Tasks and back. No
 * placement, no typing dots, nothing enters or leaves the panel.
 *
 * Backstage had seven earlier directions (three-replacing-states, a continuous morph and
 * its three variants, the library-crossing / constellation / pick-the-one concepts, and a
 * Section 7 transcription) — all deleted 2026-09-11 once this one was picked as the shipped
 * direction (it used to be called "V8" internally; that numbering is gone from the code now
 * that nothing else is being compared against it). See git history if any of them are
 * wanted again.
 */
const LABEL = 'Backstage — continuous loop';

export default function App() {
  // so tabs open on different routes are tellable apart from Expert Agents' own deploy
  useEffect(() => {
    document.title = LABEL;
  }, []);

  return (
    <AppShell activeNavItem="Backstage">
      <BackstageNullState content={BACKSTAGE_CONTENT} demo={<DemoSequence />} />
    </AppShell>
  );
}
