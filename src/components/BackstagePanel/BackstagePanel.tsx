import { ReactNode } from 'react';
import './BackstagePanel.css';

interface BackstagePanelProps {
  /** the animation, once it exists. Empty for now — the panel is just its ground. */
  children?: ReactNode;
}

/**
 * Backstage demo panel — the 520 × 600 visual beside the copy column.
 * Figma `1867:10483` (`agents-card`).
 *
 * Right now this is only the ground: the teal gradient, at the exact footprint the
 * animation has to live in. Content lands in `children`, one state at a time.
 *
 * The ground is exported at its full 520 × 600 rather than downscaled the way
 * AgentDemoPanel's aura is (112 × 130 for a 560 × 640 stage). That trick works there
 * because the aura is blurred 137px and holds no detail; this one is a photographic crop
 * (Figma `image 49`: a CROP fill of a 4096 × 2731 source with +0.15 saturation) with
 * directional structure, and upscaling it bands. The crop's source of truth is Figma frame
 * `2369:51362` — re-export from there if the image moves again (how, and the one trap, is
 * in BackstagePanel.css above `.backstage-panel__ground`). Last export 2026-09-10, image at
 * (-220, -42): 61KB. Still a fair price for not banding.
 *
 * `aria-hidden` + `inert` mirrors AgentDemoPanel — the panel is decorative in prod and has
 * no business in the tab order.
 */

/**
 * Echoes a `?state=` param onto the panel, because every Backstage version uses one to pin a
 * beat for review — and a pinned beat runs NO timeline, so the panel sits perfectly still.
 *
 * That has now read as "the animation is broken" twice, from a URL left over from a previous
 * look. The param is invisible once you have scrolled past the address bar, and a still panel
 * is indistinguishable from a dead one. So it gets echoed where the thing it explains is.
 *
 * Deliberately just the raw param rather than the word "paused": whether a given value
 * actually pins anything is up to each version's own `PINNED` map, which this shared panel has
 * no business knowing. An unrecognised value is ignored and the loop plays — in which case the
 * badge is still telling the truth about the URL.
 *
 * Lives here rather than per-version so all seven get it from one place, and it renders only
 * when the param is present — so a normal view, and any screenshot taken from one, is clean.
 */
function pinnedStateParam(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('state');
}

export function BackstagePanel({ children }: BackstagePanelProps) {
  const pinned = pinnedStateParam();

  return (
    <div
      className="backstage-panel"
      aria-hidden="true"
      /* @ts-expect-error — `inert` is not in React 17's JSX types; it is a valid attribute */
      inert=""
    >
      <div className="backstage-panel__ground" />
      {children ? <div className="backstage-panel__stage">{children}</div> : null}

      {pinned && <span className="backstage-panel__pin">?state={pinned}</span>}
    </div>
  );
}
