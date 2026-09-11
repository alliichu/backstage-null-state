import { PdsButton, PdsIcon } from '@pine-ds/react';
import { microphone, videoOn, remove } from '@pine-ds/icons/icons';
import { MEETING } from '../../data/backstageDemo';
import coach from './assets/call-coach.jpg';
import client from './assets/call-client.jpg';
import './MeetingBox.css';

export type BoxPhase = 'hidden' | 'card' | 'call' | 'ended';

interface MeetingBoxProps {
  phase: BoxPhase;
  /** the CTA is mid-press */
  pressed?: boolean;
  /** pane-local y for the card/ended size; the call phase ignores it and centres itself */
  y: number;
  /** how far it rises on arrival — its own height + gap, so it moves with the thread */
  riseDistance: number;
  /**
   * The thread's content is faded (`contentShown` false) — the box fades with it. ⚠️ Without
   * this the trace stayed at full opacity through the whole Resources beat and the slide back,
   * then snapped off mid-slide: the Messages pane peeks 44px at the panel's left edge in the
   * Resources state and the card's right 26px sat in that strip. Allison: "i still see a
   * message container disappear quickly ... make sure it doesn't show up at all".
   */
  faded?: boolean;
}

/**
 * THE MORPHING BOX — the notification, then the call, then the trace it leaves.
 *
 * ⚠️ ONE ELEMENT, THREE CONTENTS. The geometry animates continuously and only the contents
 * cross-fade inside it. Building the close as a *reverse* of the open would say nothing
 * happened; building the three as separate elements would make the box's growth three
 * transitions fighting each other. So: one absolutely-positioned container, three content
 * layers stacked on top of one another, exactly one of them opaque at a time.
 *
 * ⚠️ ABSOLUTELY POSITIONED, NOT IN THE THREAD'S FLOW. Storyboarding this in Figma, the card
 * had to be pulled out of the thread's auto-layout and set to absolute before it would grow at
 * all — the parent overrode both the size and the position, and fading the thread also faded
 * the one thing that had to stay solid. The same is true in CSS. The thread here is a fixed
 * three-item composition, so nothing is lost by positioning it explicitly.
 *
 * ⚠️ THE CARD IS A COMPACT STACK, transcribed from `2307:26136` (2026-09-09): calendar chip and
 * title on one line, a full-width outlined CTA beneath, 205 wide. Its type is at BUBBLE size (13
 * against the bubbles' 12.7) — Allison: "the font needs to all be similar size" — so it reads as
 * part of the conversation rather than as a panel dropped into it. (It was a 312-wide single row
 * before this; the stack is the simplification pass.)
 *
 * The tiles reuse V2's photos and crop percentages (224.24% / -61.98% and 300.92% / -93.36% /
 * -8.08%) — same source images, so no new assets.
 */
export function MeetingBox({ phase, pressed = false, y, riseDistance, faded = false }: MeetingBoxProps) {
  return (
    <div
      className={`demo-box is-${phase}${pressed ? ' is-pressed' : ''}${faded ? ' is-faded' : ''}`}
      style={{ ['--demo-box-y' as string]: `${y}px`, ['--demo-rise-d' as string]: `${riseDistance}px` }}
    >
      {/* ---------------------------------------------------------------- the notification */}
      <div className="demo-box__layer demo-box__card">
        <div className="demo-box__meta">
          <div className="demo-box__date">
            <span className="demo-box__month">{MEETING.month}</span>
            <span className="demo-box__day">{MEETING.day}</span>
          </div>
          <div className="demo-box__titles">
            <p className="demo-box__title">{MEETING.title}</p>
            {/* ⚠️ NO date line. The chip already says APR 4, and on a card that is pressed a
                second after it lands nobody finished reading "Wed, Apr 4 at 10:30am" — Allison
                cut it (2026-09-09, "lets cut the date underneath and make the meeting with
                andrew in the middle"). `MEETING.when` is kept in the data in case this is undone. */}
          </div>
        </div>
        <div className="demo-box__cta">
          {/* `2307:26136`: a full-width PRIMARY pill, 24 tall (Allison switched it from the
              outlined secondary on 2026-09-09, "change the button color to this"). Pine's `micro`
              primary is that component — 24px, with its own 12px label; the real component wins
              over a hand-styled lookalike (prototype quality bar). */}
          <PdsButton size="micro" variant="primary" fullWidth>{MEETING.cta}</PdsButton>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- the call */}
      <div className="demo-box__layer demo-box__call">
        <div className="demo-box__tiles">
          <div className="demo-box__tile">
            <img className="demo-box__img demo-box__img--1" src={coach} alt="" />
          </div>
          <div className="demo-box__tile">
            <img className="demo-box__img demo-box__img--2" src={client} alt="" />
          </div>
        </div>
        <div className="demo-box__controls">
          {[
            { icon: microphone, label: 'Mute', variant: 'secondary' as const },
            { icon: videoOn, label: 'Stop video', variant: 'secondary' as const },
            { icon: remove, label: 'Leave call', variant: 'destructive' as const },
          ].map((c, i) => (
            <span className="demo-box__control" key={c.label} style={{ ['--demo-ctl' as string]: i }}>
              {/* ⚠️ `iconOnly` hides the DEFAULT slot, which is the accessible name — so the
                  glyph must go in `start`. An icon as the only child is treated as the text
                  and disappears. */}
              <PdsButton variant={c.variant} iconOnly>
                {/* 18.134 — `2346:27084`'s `microphone` instance, centred at 11.334 in the 40.802
                    button (2026-09-10, her rebuilt controls row). The button's own size is set
                    through `::part(button)` in MeetingBox.css — see the note there on why. */}
                <PdsIcon slot="start" icon={c.icon} size="18.134px" />
                {c.label}
              </PdsButton>
            </span>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------- the trace */}
      <div className="demo-box__layer demo-box__ended">
        <div className="demo-box__meta">
          <div className="demo-box__date">
            <span className="demo-box__month">{MEETING.month}</span>
            <span className="demo-box__day">{MEETING.day}</span>
          </div>
          <div className="demo-box__titles">
            <p className="demo-box__title">{MEETING.title}</p>
            {/* no "Ended · 32 min" either — Allison cut it right after the date line. `2308:26183`
                is the trace: the card with its CTA row gone, chip at full colour, 60 tall. What
                says the meeting happened is the button leaving and the card settling shorter. */}
          </div>
        </div>
      </div>
    </div>
  );
}
