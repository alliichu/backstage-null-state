import { PdsIcon } from '@pine-ds/react';
import { add, recording02 } from '@pine-ds/icons/icons';
import { MESSAGES } from '../../data/backstageDemo';
import { threadLayout, RISE_DISTANCE as R, GEOMETRY as G } from './timing';
import { MeetingBox, BoxPhase } from './MeetingBox';
import client from './assets/call-client.jpg';
import './MessagesPane.css';

interface MessagesPaneProps {
  coach: boolean;
  client: boolean;
  card: BoxPhase;
  pressed?: boolean;
  /** false while the panes are swapped — lets the thread reset unseen */
  contentShown?: boolean;
}

/**
 * The Messages pane: header, thread, composer. Fixed 430.7 x 388.2.
 *
 * ⚠️ THE THREAD IS BOTTOM-ANCHORED AND ABSOLUTELY POSITIONED. Each item's `y` comes from
 * `threadLayout`, recomputed per beat, so a new arrival lands at the bottom and shoves
 * everything above it up — which is what a real thread does, and what makes the three
 * arrivals read as one conversation filling in rather than three elements fading on.
 *
 * The coach's bubble runs off the top once all three are present. That is deliberate: a thread
 * clipped at the top implies an ongoing relationship, which is the point of a feature about
 * long-term member access.
 *
 * ⚠️ `contentShown` fades the thread AND the box, NOT the pane. The reset happens while both are
 * 0, which is what lets the loop restart without the visible rewind that forced V2 to remount
 * its whole stage every cycle. (The box is a pane-level element, so the thread's fade never
 * reached it — see `faded` on `MeetingBox`.)
 */
export function MessagesPane({
  coach, client: hasClient, card, pressed = false, contentShown = true,
}: MessagesPaneProps) {
  const boxPresent = card !== 'hidden';
  /* the trace is 36 shorter than the card, and the thread is bottom-anchored — so once the
     meeting has ended the bubbles settle down by that much, on the same push transition */
  const y = threadLayout(
    { coach, client: hasClient, card: boxPresent },
    card === 'ended' ? G.ended.h : G.card.h,
  );
  /**
   * ⚠️ The box is a PANE-level element, not a thread child, and it has to be: as the call it is
   * 350.7 tall against the thread's 243.1, so inside the thread it was simply clipped. Its
   * resting y is therefore the thread layout plus the header's height.
   */
  const boxY = y.card + G.pane.headerH;
  const calling = card === 'call';
  /* `is-ended` scopes the close's `--demo-close-delay` (MessagesPane.css): header, composer, thread
     and bubbles hold with the box while the call's controls dissolve, then all return together */
  const ended = card === 'ended';

  return (
    <div className={`demo-pane${calling ? ' is-calling' : ''}${ended ? ' is-ended' : ''}`}>
      <div className="demo-pane__header">
        {/* "Backstage", not "Messages" (Allison, 2026-09-09): the pane is the whole feature's
            surface — messages, the call, the resources all happen in it — so its header names the
            feature. The frames still say "Messages". */}
        <p className="demo-pane__title">Backstage</p>
      </div>

      <div className={`demo-pane__thread${contentShown ? ' is-shown' : ''}`}>
        <div
          className={`demo-bubble demo-bubble--coach${coach ? ' is-in' : ''}`}
          style={{ ['--demo-y' as string]: `${y.coach}px`, ['--demo-rise-d' as string]: `${R.coach}px` }}
        >
          <p className="demo-bubble__text">{MESSAGES.outgoing.body}</p>
        </div>

        <div
          className={`demo-bubble demo-bubble--client${hasClient ? ' is-in' : ''}`}
          style={{ ['--demo-y' as string]: `${y.client}px`, ['--demo-rise-d' as string]: `${R.client}px` }}
        >
          <img className="demo-bubble__avatar" src={client} alt="" />
          <p className="demo-bubble__text">{MESSAGES.incoming}</p>
        </div>

      </div>

      {/* ⚠️ outside the thread — see `boxY`. As the call it grows to fill this pane exactly
          while the header and composer slide off to make room (MessagesPane.css `.is-calling`). */}
      <MeetingBox phase={card} pressed={pressed} y={boxY} riseDistance={R.card} faded={!contentShown} />

      {/* inert chrome — it exists so the thread reads as living in a real messaging surface */}
      <div className="demo-pane__composer">
        <span className="demo-pane__plus"><PdsIcon icon={add} size="19.534px" /></span>
        <span className="demo-pane__input">
          <span className="demo-pane__placeholder">Message</span>
          <PdsIcon className="demo-pane__wave" icon={recording02} size="19.534px" />
        </span>
      </div>
    </div>
  );
}
