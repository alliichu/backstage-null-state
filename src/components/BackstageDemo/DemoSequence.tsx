import { useEffect, useState } from 'react';
import {
  TIMING as T, GEOMETRY as G, REVEAL, TASKS_REVEAL_EASE, FADE_IN_EASE, PRESS_TOTAL_MS, CALL_SEED, CALL_SEED_OUT,
  CLOSE_EASE, SLIDE_EASE, PLACE_EASE, RISE_EASE,
} from './timing';
import { MessagesPane } from './MessagesPane';
import { BoxPhase } from './MeetingBox';
import { SourcedFocusItemsCard } from './SourcedFocusItemsCard';
import { FOCUS_TASKS } from '../../data/backstageDemo';
import './DemoSequence.css';

type Side = 'messages' | 'resources';

interface Beat {
  coach: boolean;
  client: boolean;
  card: BoxPhase;
  pressed: boolean;
  side: Side;
  loaded: boolean;
  /** false while the panes are swapped — the thread resets behind it */
  contentShown: boolean;
}

const START: Beat = {
  coach: false, client: false, card: 'hidden', pressed: false,
  side: 'messages', loaded: false, contentShown: true,
};

/**
 * Dev affordance: `?state=` pins one beat. ⚠️ A pinned frame runs NO timeline — it is visually
 * identical to the live beat it freezes, which cost Allison two rounds of "it's not animating".
 * The badge in the corner is the only tell.
 */
const PINNED: Record<string, Partial<Beat>> = {
  'msg1':      { coach: true },
  'msg2':      { coach: true, client: true },
  'card':      { coach: true, client: true, card: 'card' },
  'press':     { coach: true, client: true, card: 'card', pressed: true },
  'call':      { coach: true, client: true, card: 'call' },
  'ended':     { coach: true, client: true, card: 'ended' },
  /* the thread and the trace are faded in this beat live, so the pin fades them too */
  'resources': { coach: true, client: true, card: 'ended', side: 'resources', loaded: true, contentShown: false },
  /* the Tasks side before `loaded` — whatever the card draws there: flat bars when V8 passes
     `skeleton`, the bare heading when it doesn't (as now). Live this is only ever seen mid-slide;
     the pin holds it still. */
  'skeleton':  { coach: true, client: true, card: 'ended', side: 'resources', loaded: false, contentShown: false },
};

function pinnedBeat(): Beat | null {
  if (typeof window === 'undefined') return null;
  const key = new URLSearchParams(window.location.search).get('state');
  const pin = key ? PINNED[key] : undefined;
  return pin ? { ...START, ...pin } : null;
}

/**
 * V8 — the whole loop, inside one panel.
 *
 * ⚠️ NO REMOUNT. V2 keyed its stage on a cycle counter and rebuilt the tree every pass, because
 * resetting the beats in view rewound the animations visibly. This loop does not need that: the
 * thread's content is faded out while the panes are swapped, so the reset happens behind an
 * opacity of 0 and there is nothing to see. That is the one structural gain from keeping
 * everything in the panel.
 *
 * ⚠️ THE PANES SLIDE, NOTHING LEAVES. Both directions are the same 430.7px on the same curve,
 * because it is the same distance — see `trackAt`.
 *
 * The Resources/Tasks card is V2's `SourcedFocusItemsCard`, reused rather than forked: the
 * layout is identical and it carries the Kajabi-sourced data, the one-pass shimmer and the
 * cascade that were tuned there. Its four `--bs-tasks-*` vars are handed down below.
 */
export function DemoSequence() {
  const pin = pinnedBeat();
  const [beat, setBeat] = useState<Beat>(pin ?? START);

  useEffect(() => {
    if (pin) return;                       // pinned: hold this beat, run no timeline
    const timers: number[] = [];
    let cancelled = false;
    const at = (ms: number, patch: Partial<Beat>) =>
      timers.push(window.setTimeout(() => {
        if (!cancelled) setBeat((b) => ({ ...b, ...patch }));
      }, ms));

    const play = () => {
      let t = 0;

      /* 1-3 — the three items arrive like texts, each shoving the thread up */
      at(t, { coach: true });
      t += T.itemInMs + T.msg1HoldMs;
      at(t, { client: true });
      t += T.itemInMs + T.msg2HoldMs;
      at(t, { card: 'card' });
      t += T.itemInMs + T.cardHoldMs;

      /* 4-5 — the press, and the box opening at the bottom of it */
      at(t, { pressed: true });
      at(t + PRESS_TOTAL_MS, { pressed: false });
      at(t + T.openFromPressMs, { card: 'call' });
      t += T.openFromPressMs + T.openMs + T.callHoldMs;

      /* 6 — it closes back to the card, which now carries the trace. ⚠️ `closeDelayMs` first
         (2026-09-10): the beat opens with the controls dissolving on a still call, and the box,
         header, composer and thread all wait that long before moving — see timing.ts. */
      at(t, { card: 'ended' });
      t += T.closeDelayMs + T.closeMs + T.endedHoldMs;

      /* 7 — the panes swap; the thread's content RIDES the slide and fades only as it leaves.
         ⚠️ 2026-09-10 — `contentShown: false` used to fire WITH the slide, so the thread and the
         trace faded in the first 300ms while the pane was still mostly in view. Allison: "the
         content should stay there and it disappears when i can't look at it". So it now fires
         `contentFadeMs` before the slide lands: the fade runs over the slide's LAST 300ms, on
         `SLIDE_EASE`'s tail (~88% -> 100% of the travel), when only the coach bubble's and the
         trace's right edges are still inside the panel's 44px peek strip — and it finishes exactly
         as the slide does, so nothing is left in that strip at rest (her earlier "make sure it
         doesn't show up at all" still holds).
         ⚠️ Also 2026-09-10 — no skeleton BEAT any more (Allison: "no skeleton at all... the tasks
         will just fall in nicely"). `loaded` used to wait out one shimmer pass
         (`slideMs + shimmerMs`); now it flips at `revealAtSlide` (below), so the reveal's own
         top-to-bottom stagger is the whole effect. The bars themselves came back that evening
         ("adding the skeleton back in (but no shimmer state)") — static, seen during the slide-in
         and dissolving row by row under the reveal; there is still no held skeleton moment. If she
         wants one, it's a hold between the slide landing and `loaded`, not a shimmer. */
      at(t, { side: 'resources' });
      at(t + T.slideMs - T.contentFadeMs, { contentShown: false });
      /* ⚠️ the reveal starts at `revealAtSlide` of the slide, not at landing (2026-09-10, trial —
         see timing.ts): the pane is parked from ~80% and used to sit settled and empty until 100%.
         The hold is anchored to the reveal, so the LAST row still gets its full `resourcesHoldMs`
         before the return slide; only the dead wait is gone. */
      const revealAt = t + Math.round(T.slideMs * T.revealAtSlide);
      at(revealAt, { loaded: true });
      /* the reveal is one stagger per row AFTER THE FIRST, then the last row's own fade, then the
         hold. ⚠️ `length - 1` as of 2026-09-10 — it was `length`: one stagger of slack, invisible
         at V2's 130 and a 260ms dead beat at V8's own stagger. */
      t = revealAt + REVEAL.staggerMs * (FOCUS_TASKS.length - 1) + REVEAL.inMs + T.resourcesHoldMs;

      /* 8 — back to the messages. ⚠️ The reset fires with the content still faded, which is the
         whole reason this loop needs no remount.
         ⚠️ `loaded: false` rides the SAME reset, not the slide's start: flipped at the start it
         ran the reveal backwards — six rows reverting to bars on a 130ms stagger over ~800ms,
         in full view on a pane that had barely begun to move. Allison: "this weird lag of all
         the resources and tasks going back". Once the card stops being `active` its rows all
         fade together over `unloadMs` with no stagger — gradual, but as one thing, under motion.
         ⚠️ 35% -> 65% on 2026-09-10 — Allison, now that the checkboxes are pinned visible
         (skeleton dropped this session too): "i don't like that i can see it collapsing". Rows
         0-1 each carry a `.bs-tasks__attachment` chip that grid-collapses to 0 on unload, and since
         rows stack in normal flow that pulls every row below it upward — checkboxes included.
         With the checkbox fading out at the same moment as everything else, that shift used to
         be masked by the whole row disappearing; pinned permanently visible, it's exposed. 35%
         was tuned for peak velocity, but the real fix is for the shift to happen once the pane
         has mostly cleared the 476px window rather than while it's still substantially in view —
         on `SLIDE_EASE`, 65% of the time covers 88% of the distance (vs. 71% at 35%). */
      at(t, { side: 'messages' });
      /* ⚠️ `contentShown: true` rides the SAME tick as the reset (2026-09-10). It used to fire when
         the slide landed, and the loop then waited `contentFadeMs` for the thread to fade back in
         before the first bubble — 300ms of an EMPTY thread fading in, on a pane that had visibly
         settled ~200ms earlier. Allison: "a small hair of a lag before the first black text
         appears after it loops... a second of nothing". The bubbles are removed in this render
         with a hard opacity switch (no transition) and the thread is at 0 when it happens, so
         starting the fade-in here shows nothing but the empty pane arriving; it's fully opaque
         by 65% + 300 = 872, and the slide lands at 880, so `play()` can fire the instant it does.
         The box is at opacity 0 throughout (faded since the outbound slide), so its geometry
         resetting from the trace's slot is as unseen as before. */
      at(t + Math.round(T.slideMs * 0.65), {
        coach: false, client: false, card: 'hidden', loaded: false, contentShown: true,
      });
      t += T.slideMs;

      timers.push(window.setTimeout(() => { if (!cancelled) play(); }, t));
    };

    setBeat(START);
    play();
    return () => { cancelled = true; timers.forEach(window.clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`demo${pin ? ' is-pinned' : ''}`}
      style={{
        /* every duration and curve the CSS animates is handed down from `timing.ts`, so the
           pacing has exactly one home and the stylesheets hold no timing numbers */
        ['--demo-item-in' as string]: `${T.itemInMs}ms`,
        ['--demo-push' as string]: `${T.pushMs}ms`,
        ['--demo-open' as string]: `${T.openMs}ms`,
        ['--demo-close' as string]: `${T.closeMs}ms`,
        ['--demo-close-delay' as string]: `${T.closeDelayMs}ms`,
        ['--demo-close-solid' as string]: `${T.closeSolidMs}ms`,
        ['--call-out' as string]: `${T.callOutMs}ms`,
        ['--call-seed' as string]: `${CALL_SEED}`,
        ['--call-seed-out' as string]: `${CALL_SEED_OUT}`,
        ['--ended-h' as string]: `${G.ended.h}px`,
        ['--ended-in' as string]: `${T.endedInMs}ms`,
        ['--call-in' as string]: `${T.callInMs}ms`,
        ['--call-delay' as string]: `${T.callInDelayMs}ms`,
        ['--call-stagger' as string]: `${T.callInStaggerMs}ms`,
        ['--call-out-stagger' as string]: `${T.callOutStaggerMs}ms`,
        ['--demo-slide' as string]: `${T.slideMs}ms`,
        ['--demo-content-fade' as string]: `${T.contentFadeMs}ms`,
        ['--press-total' as string]: `${PRESS_TOTAL_MS}ms`,
        ['--card-h' as string]: `${G.card.h}px`,
        ['--card-w' as string]: `${G.card.w}px`,
        ['--demo-place-ease' as string]: PLACE_EASE,
        ['--demo-close-ease' as string]: CLOSE_EASE,
        ['--demo-slide-ease' as string]: SLIDE_EASE,
        /* the call's photos and controls land on this rather than fading linearly (see timing.ts) */
        ['--demo-fade-in-ease' as string]: FADE_IN_EASE,
        /* ⚠️ the shove uses the RISE curve, not PUSH_EASE. The new bubble rises by the same
           distance the thread above it is shoved; give them different curves and the gap
           between them breathes mid-motion instead of holding. One curve = one rigid thread. */
        ['--demo-push-ease' as string]: RISE_EASE,
        ['--demo-rise-ease' as string]: RISE_EASE,
        /* the reused Resources card reads this one. ⚠️ Its reveal duration, stagger and curve are
           NOT set here — the card sets those three vars inline on itself, which shadows anything
           an ancestor provides; three dead copies of them used to sit here and looked like the
           place to tune the reveal. The curve goes in as the `revealEase` PROP below. */
        ['--bs-tasks-unload' as string]: `${T.unloadMs}ms`,
      }}
    >
      {/* ⚠️ No `is-calling` on the track any more (2026-09-10) — the call changes nothing outside
          the Messages pane: the Resources sliver, its divider and the track's shadow all stay
          put. The pane sets its own `is-calling` from `card` (MessagesPane.tsx). */}
      <div className={`demo__track is-${beat.side}`}>
        <MessagesPane
          coach={beat.coach}
          client={beat.client}
          card={beat.card}
          pressed={beat.pressed}
          contentShown={beat.contentShown}
        />

        <div className="demo__resources">
          <SourcedFocusItemsCard
            loaded={beat.loaded}
            active={beat.side === 'resources'}
            variant="kajabi"
            resources={false}
            tasks={FOCUS_TASKS}
            /* ⚠️ OFF again, 2026-09-10 evening. The day's arc: "no skeleton at all" (morning) ->
               "adding the skeleton back in (but no shimmer state)" -> "the skeletons look weird but
               i don't want it to just be tasks and an empty UI before each task comes in". The
               answer is neither placeholder: the tasks arrive WITH the pane (`revealAtSlide` 0.5,
               timing.ts) so it is never parked and empty, and each row lands as one unit —
               checkbox and copy together. The kajabi block still knows how to draw flat bars if
               `true` comes back; see SourcedFocusItemsCard.css. */
            skeleton={false}
            revealEase={TASKS_REVEAL_EASE}
            revealMs={REVEAL.inMs}
            revealStaggerMs={REVEAL.staggerMs}
          />
        </div>
      </div>

      {pin && <span className="demo__pin">PINNED · no animation</span>}
    </div>
  );
}
