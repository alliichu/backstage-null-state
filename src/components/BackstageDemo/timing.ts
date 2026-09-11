/**
 * V8 — EVERYTHING HAPPENS INSIDE THE PANEL.
 *
 * Storyboarded by Allison in Figma (page `↳ Null State [WIP🚧]`, section "Backstage Animation
 * Story board", `2369:49374`) on 2026-09-09. The thesis is no
 * longer V2's "one object morphs through four scenes" — it is *one surface, and look how much
 * of your business runs inside it*. Nothing arrives from outside the panel and nothing leaves.
 *
 * What that removes, deliberately:
 *   - the PLACEMENT. V2 opened with the chat bare on the gradient and then set it into the
 *     card, which implies the conversation lives elsewhere and gets deposited into Backstage.
 *     That undercuts the integration claim, so it is gone.
 *   - the TYPING BUBBLE. Allison: *"there are no chatting typing bubble anymore."* The three
 *     items simply arrive, one after another, "as if they are all coming in as a text message
 *     animation".
 *   - the PUSH-OUT. V2 threw the focus card 499px off the top of the panel. Content leaving is
 *     the wrong verb here; the panes slide aside instead.
 *
 * Curves are the house set:
 *   PLACE_EASE  (0.4, 0, 0.1, 1)     arrives and settles — long crawl at the end
 *   PUSH_EASE   (0.4, 0, 0.2, 1)     making room; the thread shoving up
 *   LIFT_EASE   (0.37, 0, 0.63, 1)   symmetric, slow at both ends
 * Their measured profiles were documented in `BackstageDemoV2/timing.ts` — inlined below,
 * comments intact, when V2 (and every other pre-V8 version) was deleted 2026-09-11. V8 is
 * now the only version left, so there is no sibling file left to drift from.
 */

/**
 * THE REVEAL CURVE — V2-2's six rows arriving. Kept for V8's own tasks reveal (see `REVEAL`,
 * `TASKS_REVEAL_EASE` and `FADE_IN_EASE` below, all measured against this one) and for
 * `RISE_EASE`, which is this same profile re-exported under the job it does in the thread.
 *
 * Allison asked for the reveal to *"appear smoother from top to bottom"*, and the cause of the
 * un-smoothness was the same curve this file has now rejected twice: `cubic-bezier(0.16, 1,
 * 0.3, 1)`. Measured, it puts **82.6% of its travel in the first quarter of its duration and
 * 0.2% in the last** — so every row snapped into place and then crawled, six times over. Six
 * snaps on a stagger is what reads as stepping.
 *
 *   curve                      @10%    @25%    @50%    @75%
 *   (0.16, 1, 0.3, 1)  old     0.494   0.826   0.972   0.998
 *   (0.33, 0, 0.2, 1)  now     0.039   0.315   0.791   0.960
 *
 * The new curve leaves from rest, does its travelling through the middle, and still has 4% of
 * the distance in hand to settle with. Paired with a stagger far shorter than the duration
 * (see `revealStaggerMs`), the six rows overlap into one sweep.
 *
 * ⚠️ Slightly quicker off the mark than `PUSH_EASE` (3.9% at 10% against 2.6%) on purpose:
 * this is a fade plus a 6px rise, not a 27px move, so a hard ease-in would read as lag rather
 * than as weight over that distance.
 *
 * ⚠️ This curve is what lets the stagger be WIDE. Per-row smoothness and cascade legibility
 * are separate levers — the curve owns the first, `revealStaggerMs` the second. Do not narrow
 * the stagger to chase smoothness; that was the 2026-09-08 mistake.
 */
export const REVEAL_EASE = 'cubic-bezier(0.33, 0, 0.2, 1)';

/**
 * THE LIFT / SESSION CURVE — the push out, shared by the departing focus card and the arriving
 * notification.
 *
 * ⚠️ SYMMETRIC ON PURPOSE, and it is NOT `PUSH_EASE`. Both ends of this curve are doing a job:
 *
 *   slow HEAD   the focus card lingers, drifting, while it is still being read — this is the
 *               dwell that replaced `tasksHoldMs`'s dead air
 *   slow TAIL   the notification decelerates into place rather than slamming into it
 *
 * `PUSH_EASE` (0.4, 0, 0.2, 1) is an ease-OUT: 30% of its travel lands in the first quarter.
 * That is right for the coach's bubble making room, where nothing needs to linger, and wrong
 * here — it would shove the focus card 150px in the first 250ms, off the page before it could
 * be read. The symmetric curve moves 14.5% in that same quarter.
 *
 *   curve                     1st 25%   last 25%
 *   (0.4, 0, 0.2, 1)  ease-out   30.0%      4.1%
 *   (0.37, 0, 0.63, 1) now       14.5%     14.5%
 *
 * ⚠️ ONE curve for both elements, as with the durations — a pusher and a pushed body on
 * different velocity profiles is what made this read as two events instead of one push, and
 * that was the whole 2026-09-08 fix. Do not give them separate curves to tune the head and
 * tail independently; retune the duration instead.
 */
export const LIFT_EASE = 'cubic-bezier(0.37, 0, 0.63, 1)';

/**
 * THE PUSH CURVE — the coach's bubble making room when the reply lands underneath it.
 *
 * Allison, 2026-09-08: *"can we make the transition when the chat typing bubble shows up
 * smoother. i think the black chat transforms up a little too abrupt."*
 *
 * The push was still on `cubic-bezier(0.16, 1, 0.3, 1)`, the ease-out-expo this file had
 * already measured and thrown out for the placement — for exactly this reason. Over the 27px
 * the coach travels (panel 233 -> 206), over `replyInMs`:
 *
 *   curve                      @10%    @25%    @50%    @75%   moved in 1st 10%
 *   (0.16, 1, 0.3, 1)  old     0.494   0.826   0.972   0.998      13.3px
 *   (0.4, 0, 0.2, 1)   now     0.026   0.237   0.776   0.959       0.7px
 *
 * The old curve threw HALF the travel — 13px of 27 — into the first 36ms and then crawled
 * the remainder, which is precisely what "transforms up abrupt" describes: a jump followed by
 * an invisible drift, not a move. The new one leaves from rest, does its travelling through
 * the middle, and still has 4% of the distance in hand for a settle you can see.
 *
 * ⚠️ NOT `PLACE_EASE`, though it is the same shape and was the obvious candidate — this was
 * V2's `.bs2-conv__bubble--reply` curve, since retired along with the rest of V2.
 */
export const PUSH_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

/**
 * THE PLACEMENT CURVE. Allison: *"can the messages get on the UI like slower at the end so
 * keep it the speed but a little curve in the animation speed."* Duration held at `placeMs`;
 * only the velocity profile changed.
 *
 * The previous curve was `cubic-bezier(0.16, 1, 0.3, 1)`, an ease-out-expo, and measuring it
 * showed why it read as abrupt rather than as a settle:
 *
 *   curve                       @25%    @50%    @75%   moved in 1st 25%   in last 25%
 *   (0.16, 1, 0.3, 1)   old     0.826   0.972   0.998        82.6%            0.2%
 *   (0.45, 0, 0.15, 1)  now     0.207   0.791   0.964        20.7%            3.6%
 *
 * The old one covered 82.6% of the distance in the first quarter of the time and 0.2% in the
 * last — so what you saw was a snap followed by an invisible crawl. The new one spreads the
 * movement through the middle (17% of it lands between 50% and 75%) and leaves a deceleration
 * you can actually see. It also eases IN slightly, which is the "little curve" — the chat
 * gathers pace and is set down, rather than starting at full speed.
 *
 * `(0.45, 0, 0.15, 1)` is strongly ASYMMETRIC: the 0.15 pulls the deceleration late, which
 * shoves the velocity forward into the middle. At 550ms and 60fps:
 *
 *   curve                     peak %/frame   x its own avg   peak at   done by 50%
 *   (0.45, 0, 0.15, 1)  old       9.43           3.11x        183ms       79.1%
 *   (0.37, 0, 0.63, 1)  now       4.81           1.59x        283ms       50.0%
 *
 * The old curve's fastest single frame moved 9.4% of the whole distance — 3.1x its average —
 * and that lurch through the middle is what reads as abrupt. The symmetric in-out halves the
 * peak, puts it in the centre where the eye expects it, and reaches halfway at halfway.
 *
 * ⚠️ THEN REVISED AGAIN to `(0.40, 0, 0.10, 1)` when the static beat was folded into the
 * curve. Pulling x2 from 0.63 to 0.10 drags the end control point hard left, which is what
 * produces the long crawl. At `placeMs` = 1100 / 66 frames:
 *
 *   peak            5.04 %/frame
 *   first quarter   30.0%   — brisk, but not the 82.6% snap of the original expo
 *   last quarter     3.2%   — the dwell
 *   reaches 90% at   667ms  -> 433ms still moving, almost imperceptibly
 *
 * ⚠️ The peak went UP against the symmetric curve (3.30 -> 5.04) and that is the honest price
 * of a tail: for a fixed distance, time spent crawling at the end has to be found somewhere.
 * 300ms of extra duration paid most of it — the same curve at 800ms would have peaked at 6.9.
 * If it reads as hurried in the middle, buy that back with duration, not by raising x2, which
 * would flatten the tail this exists to create.
 *
 * ⚠️ This does soften the hard settle the 2026-09-03 pass added to make the chat read as being
 * "placed" rather than gliding to a stop. That was the deliberate trade — if the placement now
 * reads as drifting instead of landing, pull x2 back toward 0.5 (e.g. `0.37, 0, 0.5, 1`) to
 * recover some deceleration without returning to a 3x peak.
 */
export const PLACE_EASE = 'cubic-bezier(0.4, 0, 0.1, 1)';

/**
 * THE RISE CURVE — how a message comes up into the thread. `(0.33, 0, 0.2, 1)`: 3.9% of the
 * travel at 10%, 31.5% at 25%, 4% in the last quarter. A hint of ease-in so it does not fire
 * off the mark, then a long settle so it lands rather than stops. It is the same profile as
 * V2's reveal cascade, re-exported under the job it does here so the stylesheet reads as intent.
 *
 * ⚠️ y-values never exceed 1, so nothing on this curve can bounce. Keep it that way — the
 * overshoot was tried and rejected.
 */
export const RISE_EASE = REVEAL_EASE;

/**
 * CLOSE_EASE (0.3, 0, 0.5, 1) — the collapse's own curve. PLACE_EASE (0.4, 0, 0.1, 1) is right
 * for arrivals, but its long tail meant the white slab spent the last ~280ms of the close
 * creeping the final few percent onto the card — Allison: "theres still this weird like
 * container thing ... make it go faster at the end". This one still leaves fast and still
 * arrives at zero velocity, but does its slowing late and briefly: 95% of the way by ~80% of
 * the time instead of ~50%. The open keeps PLACE_EASE; the two are not mirrors and were never
 * meant to be.
 */
export const CLOSE_EASE = 'cubic-bezier(0.3, 0, 0.5, 1)';

/**
 * SLIDE_EASE (0.4, 0, 0.3, 1) — the pane slide's own curve. Allison: "can there be a curve on the
 * slide over transition ... slow it down towards the end?" — it already ran on PLACE_EASE, but
 * that curve does 82% of its travel by half-time and then plateaus, so over a 430px slide the
 * slow-down was real yet too compressed to read as one. This curve spreads the deceleration
 * across the whole second half (71% at half-time, 88% at 65%, 97% at 80%), and the slide got
 * ~28% longer to give it room. Measured, not guessed — see the bezier table in the 09-09 session.
 */
export const SLIDE_EASE = 'cubic-bezier(0.4, 0, 0.3, 1)';

/**
 * The Tasks reveal. The held section slot is V2's (same component); the per-row DURATION and, as
 * of 2026-09-10, the STAGGER are V8's own. These feed both the sequence's arithmetic AND the
 * card's `revealMs` / `revealStaggerMs` props — one home, so the beat can't outrun the CSS.
 *
 * ⚠️ `inMs` 380 -> 640 -> 520 -> 460 on 2026-09-10 — Allison: "i don't see it changing... i
 * want it to appear slower at the end", then "its a little too slow now", then "a little bit
 * faster". The curve change (`TASKS_REVEAL_EASE`, below) was real but imperceptible at 380ms:
 * the old and new curves differed by 6% opacity over the last 95ms. Deceleration is only visible
 * if the tail is long enough in ABSOLUTE time to follow, so the lever is duration — 640 made it
 * unmistakable but dragged; 460 is where she landed by ear. On that curve a row is 63% opaque at
 * half-time and spends the whole back half — 230ms — settling 63 -> 100. Rows start
 * top-to-bottom on the stagger below, so the last row is the last thing still settling: the
 * cascade's end is its slowest moment. The last row lands at 350 x 2 + 460 = 1160ms.
 * ⚠️ Don't go much below ~420: the settle stops registering and it reads as the old stop again.
 *
 * ⚠️ No `shimmerCycleMs` here — V8's skeleton bars are STATIC (2026-09-10: dropped entirely in the
 * morning, back that evening "but no shimmer state"), so there is no sweep to sync a cycle to.
 * V2 still shimmers; its own cycle length lives on `V2_TIMING.shimmerCycleMs` and is untouched.
 */
export const REVEAL = {
  inMs: 460,
  /**
   * ⚠️ V8'S OWN, 350 — it was V2's 130 until 2026-09-10 (evening). Allison: "make it slower, like
   * first task, then second task, then third task. it can overlap a little bit and make it
   * seamless and feel good but i want it to be more separated feeling", then at 260: "better i
   * think it can be a little bit more separated", then at 300: "separate the tasks a little more
   * than what it is now" (confirmed she meant timing, not row spacing). At 130 adjacent rows
   * overlapped for 330 of their 460ms — 72% — and read as one sweep, which is what V2's six rows
   * want ("the six rows overlap into one sweep", its timing.ts) and what three rows don't. At 350
   * the overlap is 110ms (24%): on `TASKS_REVEAL_EASE` the previous row is ~90% in when the next
   * begins, so each row is READ as arrived before the next one starts, and only the last of the
   * settle knits into the next arrival.
   *
   *   row 1     0 .. 460
   *   row 2   350 .. 810
   *   row 3   700 .. 1160
   *
   * Lever: this number alone. ⚠️ At ~460 the rows stop overlapping at all and it becomes three
   * separate events rather than one list filling in — stay under that. The row duration is
   * settled (see `inMs`); don't trade it for separation.
   */
  staggerMs: 350,
  /* was `V2_TIMING.revealSectionGap` — V2's own value, 1, inlined here now V2 is gone.
     V8 always renders `resources={false}` so this held slot never actually applies (see
     `SourcedFocusItemsCard`'s `taskIndex0`), but the field stays for the same reason the
     component still accepts a `resources` prop at all. */
  sectionGap: 1,
};

/**
 * THE TASKS' OWN REVEAL CURVE — 2026-09-10, Allison: "can we have the animation when the tasks
 * appear to be slower at the end so a curve animation". V2's `REVEAL_EASE` (0.33, 0, 0.2, 1)
 * does 96% of its travel by 75% of the time: a 4% tail is imperceptible, so the row reads as
 * arriving and STOPPING, not settling. Measured against alternatives (distance covered):
 *
 *   curve                        @25%   @50%   @75%   last 25%   last 10%
 *   REVEAL_EASE  (0.33,0,0.2,1)  31.5   79.1   96.0      4.0        0.6    <- was
 *   SLIDE_EASE   (0.4,0,0.3,1)   19.7   71.3   94.7      5.3        0.7
 *   CLOSE_EASE   (0.3,0,0.5,1)   21.0   62.0   90.9      9.1        1.4
 *   THIS         (0.2,0,0.55,1)  26.2   63.3   90.2      9.8        1.6    <- now
 *
 * Chosen for the tail: ~10% of the motion in the last quarter (2.5x before) is a deceleration
 * you can see, while the first quarter is barely changed (26 vs 31.5), so the START feels the
 * same and only the landing softens. Applies to the fade as well as the rise (see the
 * `is-kajabi` block in SourcedFocusItemsCard.css). Passed to the card as a PROP — the card sets
 * `--bs-tasks-reveal-ease` inline on itself, so a var from this stage was shadowed and did nothing.
 * ⚠️ This curve alone was NOT visible at V2's 380ms — see `REVEAL.inMs` above for why the
 * duration had to move with it. If the settle still wants more room, `inMs` is the lever, not a
 * harder curve (which shrinks the tail again).
 */
export const TASKS_REVEAL_EASE = 'cubic-bezier(0.2, 0, 0.55, 1)';

/**
 * THE HOUSE CURVE FOR A FADE THAT LANDS — the same bezier as `TASKS_REVEAL_EASE`, under the name
 * of the job it does everywhere else. 2026-09-10 (evening): the call's photos and controls were
 * the last arrivals in the piece fading LINEARLY — one rate, then a dead stop at full opacity —
 * while the bubbles, the box and the tasks all settle. Allison: "do #1 the ease out on the
 * photos". A side effect worth having: on this curve each piece is ~63% in at half-time, so the
 * left -> right -> buttons order reads a shade more distinctly at the same stagger. Departures
 * (the close) stay linear — short, and accelerating away is what leaving looks like.
 */
export const FADE_IN_EASE = TASKS_REVEAL_EASE;

export const TIMING = {
  /* 1-3 — the three items arrive like texts. One duration for all of them: they are the same
     kind of event, and a shared curve is what makes them read as one thread filling in. */
  /**
   * ⚠️ A RISE FROM BELOW — the bubble comes up out of the composer into its slot, and the thread
   * above shoves up to make room. That is what iMessage actually does on send, and it took two
   * wrong turns to get here:
   *
   *   1. A small translate + fade. Right idea, but a position bug had every absent item parked
   *      at y = 0, so each one slid DOWN from the top as it appeared — "coming from the top and
   *      weird". The rise was never the problem; the parking spot was.
   *   2. A corner-anchored scale pop with a 1.03 overshoot, from misreading iMessage. Allison:
   *      *"too abrupt. and bouncy why does it come from the corner."* Scaling from a corner whips
   *      the far edge across the bubble in a third of a second, which reads as a snap however the
   *      curve is shaped, and any overshoot on top of that reads as wobble.
   *
   * So: NO scale, NO overshoot, NO corner — a rise, on `RISE_EASE`, over 480ms.
   *
   * ⚠️ THE THREAD MOVES AS ONE RIGID UNIT, and the rise distance is what makes that true. A
   * fixed 44px rise was tried and overlapped: the new bubble only had 44px to travel while the
   * bubble above it had to be shoved by the new one's full height plus the gap (72px for the
   * client, 135.8 for the card), so for the first third of the motion the riser's top sat above
   * the shover's bottom. Allison: *"overlapping across the previous messages especially the
   * meeting message."* The card overlapped most because it is the tallest.
   *
   * Each item now rises by EXACTLY its own height + gap — the same distance everything above it
   * is shoved, on the same curve, for the same duration. The gap between items is therefore
   * constant at every frame, and overlap is geometrically impossible. It also means every item
   * begins with its top just below the thread's bottom edge, i.e. behind the composer, and
   * comes up out of it — which is precisely where a sent message comes from.
   */
  itemInMs: 480,
  /** the thread shoving up, coupled to the rise — same duration, so the new bubble and the old
      ones move up together as one thread (V2's 2026-09-08 lesson) */
  pushMs: 480,
  msg1HoldMs: 520,
  msg2HoldMs: 620,
  /** the notification needs longer — it is the only item carrying an action.
      ⚠️ 900 -> 760 -> 700 on 2026-09-10 — Allison: "there is like a stagnant pause before the
      start meeting click animation begins", then "a little shorter". The rise's own tail is
      near-still for its last ~120ms (RISE_EASE puts 4% of the travel in the final quarter), so the
      read pause at 900 was ~1s. 700 keeps this the longest of the three holds (520 / 620 / 700)
      so the card still gets its extra beat. ⚠️ Below 620 it stops reading as "longer" than the
      messages — go under that only if the ordering is meant to change. */
  cardHoldMs: 700,

  /* 4 — the press.
     ⚠️ RETUNED 2026-09-09 — Allison: "make the click of start meeting more apparent and obvious
     i miss it a lot", then "it doesn't need to be held down ... but still work like its a click".
     It was 90 down / 110 held / 4.5% smaller and the eye went straight to the growth. A 260ms
     hold was tried and read as a long-press, not a click. So: a CLICK'S timing — down and
     released in 190ms — made visible by SIZE rather than by duration: the button drops 12% and
     springs back past 1 over 360ms. See `press` in MeetingBox.css, whose keyframe stops are
     these three numbers as fractions of their sum.
     ⚠️ SIZE ONLY as of 2026-09-10 — Allison: "just the size don't change anything with the
     opacity". The press used to also lighten the button (`filter: brightness(1.6)`) on the
     down-stroke; that's gone. If the click gets missed again the lever is scale depth, not light. */
  pressDownMs: 100,
  pressHoldMs: 90,
  pressUpMs: 360,
  /** ⚠️ offset from the press STARTING, and equal to pressDown + pressHold: the box opens at
      the bottom of the press and the button springs back while it opens. Keep them equal.
      ⚠️ Briefly 550 (opening after the press settled) on 2026-09-10 and reverted the same day —
      Allison: "i want it to overlap i like that overlapping that one its in the click it opens i
      don't want it to settle". */
  openFromPressMs: 190,

  /**
   * 5 — the box opens into the call. ONE transition, not two.
   *
   * ⚠️ V2 needed a chained two-leg seam (SEAM_IN -> SEAM_OUT) because its frame drew an
   * intermediate `expanded` keyframe, and two back-to-back CSS transitions stop dead in the
   * middle. Section 9 has no such keyframe — beat 5 is a mid-transition still, not a rest — so
   * this is a single continuous growth and the seam problem simply does not exist. Do not
   * reintroduce an intermediate state without also reintroducing the chained curves.
   */
  /* ⚠️ 780 -> 600 on 2026-09-09 — Allison: "the expanding to the phone call is a little too slow".
     The content cross-fade below is scaled with it so the call still appears INTO a box that has
     most of its size, not one still mid-growth. */
  openMs: 600,
  /**
   * The call's content fades in DURING the growth, trailing it — and IN SEQUENCE (2026-09-10,
   * Allison: "a little bit of a delay and it goes left photo then right photo then the UI
   * buttons. so subtle"). The three pieces fade on the same `callInMs`, each starting
   * `callInStaggerMs` after the one before: left tile at `callInDelayMs`, right tile one stagger
   * later, the controls row (as ONE group — see MeetingBox.css for why not per button) two later.
   * They all keep SCALING together with the box the whole time; only the fade is staggered, so it
   * still reads as one thing growing that fills in left to right.
   *
   *   left tile   180 .. 540
   *   right tile  260 .. 620
   *   controls    340 .. 700     (the box lands at 600 — PLACE_EASE covers its last ~1% in those
   *                              100ms, so it is visually still — the controls settle last)
   *
   * ⚠️ `callInDelayMs` 140 -> 180 for the "little bit of a delay": at 140 the first photo began
   * with the box only ~25% grown; at 180 it's ~46% (PLACE_EASE, measured). The stagger at 80 is
   * deliberately at the low end of readable — two 360ms fades 80 apart differ by ~22% opacity
   * mid-way when linear, a touch more on `FADE_IN_EASE` (which they are on since the evening) —
   * a ripple rather than a march. If Allison says she can't see the order, raise
   * `callInStaggerMs` (to ~120) before touching anything else; if the controls land too late,
   * shorten `callInMs`. (Before this the whole layer faded as one, 140 .. 500.)
   */
  callInDelayMs: 180,
  callInStaggerMs: 80,
  callInMs: 360,
  /** ⚠️ 2000 -> 1100 on 2026-09-09 — Allison: "i don't want the video call UI to be there for
      that long". Then 1100 -> 940 on 2026-09-10 when `closeDelayMs` (160, below) was added: the
      close now begins with the controls dissolving on a still box, which is still "the call UI
      being there", so the hold gives up exactly that much and the call's total time on screen —
      open start to trace landing, 600 + 940 + 160 + 480 = 2180 — is unchanged. The controls
      finish landing 700ms after the open starts (`callInDelayMs` + 2 x `callInStaggerMs` +
      `callInMs`, timetable above) — 100ms after the box — so the call sits complete and still for
      ~840ms before the first thing leaves. Open and close both run on eased curves — the box is
      never moving linearly, and the hold is the only still moment. */
  callHoldMs: 940,

  /* 6 — it closes back to the card, which now carries the trace.
     ⚠️ CHOREOGRAPHED, 2026-09-09 — Allison: "it looks like some part it goes dark or something,
     it feels a little weird". It did: the box shrank over 660ms while (a) its frosted grey stayed
     20% see-through with the blur snapped off, so the teal photo showed through as the panes
     were still fading back in, and (b) the two fixed-size photo tiles were CLIPPED by the
     shrinking box rather than leaving it — a dark mass being cropped. So now the call's content
     recedes and is gone in `closeSolidMs`, the box is opaque white in the same beat, and only
     then does a clean white slab settle into the card. The trace fades in over the last
     `endedInMs`, when the box is within a few px of its final size, instead of drifting down a
     still-tall box. */
  /**
   * ⚠️ THE DEPARTURE LEADS THE COLLAPSE — 2026-09-10. Nothing shrinks or slides back for this
   * long; the only thing happening is the controls row dissolving on a still, full-size call.
   * Allison, on the first reversed close (stagger 80, shrink from 0): "it doesn't really look
   * like its doing it reverse i can't tell". It didn't: CLOSE_EASE front-loads the shrink (62% of
   * it in the first 240ms), so all three pieces were fading while the whole thing was rapidly
   * getting small, and the shrink swallowed an 80ms offset. Widening the stagger inside the same
   * window only made each fade a blink. So the first step of the sequence now happens with the
   * box still — legible by construction — and the shrink starts as the second step does, taking
   * the photos with it right then left. Applies to the box geometry, the content's scale-out,
   * the trace's fade-in, and the header/composer/thread coming back (MessagesPane.css) — all
   * shifted by this, so the close is the same close, 160ms later.
   */
  closeDelayMs: 160,
  /* ⚠️ 560 -> 480 with the tail-less `CLOSE_EASE` (2026-09-09, "make it go faster at the end").
     The sub-beats below are scaled with it. Measured from the END of `closeDelayMs`. */
  closeMs: 480,
  /** the box to opaque white (and the blur off), at the top of the close */
  closeSolidMs: 160,
  /** the WINDOW over which the call's content fades out while it SHRINKS with the box (see
      `CALL_SEED`) — in reverse order, piece by piece, see `callOutStaggerMs` below; the window's
      END (`closeDelayMs` + this) is what the handoff described here is tuned against. The trace's
      start is shifted by `closeDelayMs` too, so the relation below is unchanged by the delay.
      ⚠️ 280 -> 420 on 2026-09-10 — Allison: "when the call ui collapses back into the notification
      it like blinks again". It did: the trace starts fading in at `closeMs - endedInMs` = 360, and
      at 280 the tiles were already gone — an 80ms window in which the box painted NOTHING. That
      window used to be invisible because the box itself was a white slab all the way down (the
      old `is-ended` choreography); once the box went see-through for the call, the slab stopped
      bridging it and the handoff became off -> empty -> on. So the content fade now OVERLAPS the
      trace's by 60ms (420 vs 360): the last of the tiles — ~0.2 scale, near-transparent, already
      shrunk into the card's footprint — cross-fades into the card. One content becoming the
      other, which is the whole point of this box; never a frame with neither.
      ⚠️ Keep this > closeMs - endedInMs. Equal is a one-frame gap; less is a visible one. */
  callOutMs: 420,
  /**
   * The close's order is the open's REVERSED (2026-09-10, Allison: "reverse that order when the
   * call stuff collapses back into the notification"): controls first, then the right tile, then
   * the left — last in, first out. The pieces' window runs from the close beat's start to
   * `closeDelayMs + callOutMs` (580), because the trace handoff above is tuned to when the LAST
   * piece is gone (both it and the trace's start are shifted by `closeDelayMs`, so the 60ms
   * cross-fade is unchanged). Each piece fades over `closeDelayMs + callOutMs - 2 x this` (260)
   * and the three tile the window; the box begins shrinking at `closeDelayMs`:
   *
   *   controls     0 .. 260    on a STILL box until 160
   *   right tile 160 .. 420    starts the instant the shrink does
   *   left tile  320 .. 580    folds up with the box; the trace fades in from 520
   *
   * ⚠️ 80 -> 160 on 2026-09-10 — see `closeDelayMs` for why 80 was invisible here. At 160 each
   * piece is fully gone before the next is 40% faded, and the first step happens on a still box.
   * Twice the open's stagger is deliberate: the open's order is read on a settling box, the
   * close's has to be read through a shrink. ⚠️ Keep 2 x this well under `closeDelayMs +
   * callOutMs`: below ~200ms per piece the fades read as blinks, not a sequence.
   */
  callOutStaggerMs: 160,
  /** the trace in, over the very last part of the close — short, so it lands on a box that is
      already within ~3% of the card rather than appearing inside one still visibly shrinking */
  endedInMs: 120,
  /* ⚠️ NO SNAP. A landing compress on the close was tried twice (with and without an overshoot)
     and taken out on Allison's call — "no bounce at all". The close is the geometry on PLACE_EASE
     and nothing more. */
  /** THE PAUSE ON THE NOTIFICATION before the pane slides to Tasks.
      ⚠️ 0 -> 300 on 2026-09-10 (evening) — Allison: "after the ui call collapses back into the
      notification can we have it stay there for a little longer like lag, i think it shifts a
      little too fast". She had asked for 0 earlier the same day ("remove the pause before it
      slides over to the resources part") — but that was against a close on PLACE_EASE whose
      near-still last ~280ms already read as a pause, so any hold on top was dead air. The close
      now finishes fast on `CLOSE_EASE`, the trace lands over its last 120ms, and the slide
      starting the same instant reads as the card being shoved off before it has landed. 300 is
      a beat: the card is read at rest, then the pane moves. Under ~200 it doesn't register after
      the landing; over ~450 it reads as a stop. */
  endedHoldMs: 300,

  /* 7 — the panes slide. Same duration both ways: it is the same distance.
     ⚠️ 690 -> 880 on 2026-09-09, with `SLIDE_EASE`, so the slow-down towards the end is visible. */
  slideMs: 880,
  /** ⚠️ 2026-09-10 — no skeleton, no shimmer. `loaded` used to wait out one shimmer cycle after
      the slide (`slideMs + shimmerMs`, pinned to `REVEAL.shimmerCycleMs`); then it flipped the
      moment the slide landed; now it flips at `revealAtSlide` (below). See beat 7. */
  /**
   * WHERE IN THE SLIDE THE TASKS START REVEALING, as a fraction of `slideMs`. 1 = at landing.
   * ⚠️ 0.8 -> 0.5 -> 0.7 -> 0.75 on 2026-09-10 (evening) — THE TASKS ARRIVE AS THE PANE SETTLES.
   * Allison, after trying flat skeleton bars: "the skeletons look weird but i don't want it to
   * just be tasks and an empty UI before each task comes in". Both placeholders were answers to
   * the same thing — the pane sitting parked and empty — and the real fix is that it never does.
   * 0.5 (row 1 from 440, with 29% of the slide still to go) overshot: "the first task is starting
   * a little too early, it's like a lot in that transition" — two motions competing. 0.7 was
   * "still a little bit more later". So 0.75: row 1 starts at 660, when the pane has covered ~95%
   * of its travel (`SLIDE_EASE`) and the remaining ~23px is a slow drift the eye reads as
   * settling; by the time it parks at 880 the row is ~60% in. No competing motion, and no
   * parked-and-empty rest either (that needs ~200ms to register).
   *
   *   what row 1 is at the moment the pane parks (880), by this value:
   *     0.5  ~98%   "arrives with the pane"  — too early, fights the slide
   *     0.7  ~68%   "still a little bit more later"
   *     0.75 ~60%   <- now
   *     0.8  ~45%   the midday trial; a hair of empty rest before it
   *     1     0%    the original, reveal at landing; ~180ms of empty rest
   *
   *   row 1   660 .. 1120     row 2   1010 .. 1470     row 3   1360 .. 1820   (at stagger 350)
   * The hold below is anchored to when the LAST row lands, so this moves nothing about how long
   * the Tasks rest. Bars would say "loading"; this says "here's your plan".
   * ⚠️ Lever is ±0.05: lower fights the slide again, higher brings the empty hair back.
   */
  revealAtSlide: 0.75,
  resourcesHoldMs: 1200,
  /** the Resources card's way back to bars for the next pass — ONE uniform cross-fade, no stagger.
      ⚠️ Allison, in order: the reverse reveal (800ms, staggered) was "this weird lag"; the
      one-frame swap that replaced it was "abrupt". This is the middle: every row goes at once,
      over this, while the pane is mid-slide. */
  unloadMs: 240,
  /** the thread's content fades out over the LAST `contentFadeMs` of the slide to Resources
      (2026-09-10 — it rides the slide until then, Allison: "it disappears when i can't look at
      it") and fades back in from the reset at 65% of the return slide — empty by then, so the
      fade shows nothing — landing at 65% + 300 = 872, just before the slide does at 880. That is
      what lets the reset happen unseen AND the first bubble rise the instant the pane lands (the
      loop used to wait this out AFTER landing, which read as "a second of nothing"). See beats
      7 and 8 in the sequence. ⚠️ Keep 0.65 x slideMs + this <= slideMs, or the first bubble
      rises into a thread that's still fading in. */
  contentFadeMs: 300,
};

/**
 * GEOMETRY, transcribed from Section 9's frames. Panel-local unless noted.
 *
 * ⚠️ THE RESOURCES PANE IS 430.7 HERE, NOT the 669.3 Allison drew. At 669.3 in a 520 panel it
 * clips badly on the way in, and the loop slides twice now, so the clipping would be seen
 * twice per pass. Equal panes make the slide one clean 430.7 shift in both directions. Flagged
 * to Allison — if the wider pane is wanted, the slide becomes a pan and needs re-deriving.
 *
 * ⚠️ A 45.3px sliver of the far pane always peeks, because a 430.7 pane sits in a 476 window
 * (520 less two 44 insets). That is deliberate — it is the affordance that says there is more
 * of the product over here rather than the content having simply swapped.
 */
export const GEOMETRY = {
  panel: { w: 520, h: 600 },
  track: { x: 44, y: 106, paneW: 430.7, paneH: 388.2 },
  /** track x for each side; the difference is one pane width */
  trackAt: { messages: 0, resources: -430.7 },
  pane: { headerH: 51.3, bodyTop: 51.3, bodyBottom: 294.5, composerH: 93.8, inset: 23.4 },

  /**
   * The thread is BOTTOM-ANCHORED and absolutely positioned, which is how a real thread grows:
   * each new item lands at the bottom and shoves everything above it up. Positions are
   * computed per beat rather than laid out, so the box can be animated freely — in Figma this
   * exact card had to be pulled out of its auto-layout twice before it would grow at all.
   */
  /**
   * ⚠️ THREAD-RELATIVE, not pane-relative. `.demo-pane__thread` starts below the header, so its
   * own origin is 51.3 down the pane — positioning against pane coordinates put every item
   * 51.3px too low and pushed the card straight through the composer.
   *
   *   thread height = paneH 388.2 - headerH 51.3 - composerH 93.8 = 243.1
   *
   * ⚠️ TRANSCRIBED FROM ALLISON'S `state-1` / `state-2` / `state-3` FRAMES in Section 9
   * (`2260:22576`, `2260:22373`, `2260:21942`) on 2026-09-09 — "replace the first three messages
   * with these figma states". The thread column is 397 wide at x 16; items sit 21.5 apart and
   * the stack's bottom is 10.4 above the composer (her three frames put it at 9.96 / 10.87 /
   * 10.4 — hand-placed, so the middle value). With all three present the coach's bubble runs
   * 16 above the thread's top edge, exactly as `state-3` draws it.
   *
   * ⚠️ BUBBLE HEIGHTS ARE MEASURED IN THE BROWSER, NOT ASSUMED: at Pine body (14 / 1.425 =
   * 19.95, 2026-09-10 type audit) the coach's three lines in a 312.54 bubble render 83.273 tall
   * and the client's two lines 63.328 — 3 x 19.95 + 2 x 11.72 padding, 2 x 19.95 + 23.44. They
   * were 82.44 / 63.44 at the frames' 13.674 / 19.534; the line counts held through the change,
   * which is the thing that could have blown the layout up (a fourth coach line would be +20).
   * A bottom-anchored stack turns any height error straight into an overlap — re-measure if the
   * copy, the type, or a bubble width changes. (Before this update the coach->client gap had
   * already drifted to 20.66 against the 21.5 spec, from the 0.83 the coach grew.)
   */
  thread: { h: 243.1, bottomPad: 10.4, gap: 21.5 },
  coach: { w: 312.54, h: 83.273 },
  client: { w: 318.41, h: 63.328, avatar: 32.26 },
  /* ⚠️ Allison's compact card `2307:26136` (2026-09-09, "can we try the container to look like
     this?") — STACKED: chip + title on top, a full-width outlined CTA beneath, padding 12. 100 =
     12 + 36 + 12 + 28 + 12 (the CTA went 24 -> 26 -> 28 on 2026-09-10, "a little too short";
     it's Pine's micro sized through `::part(button)`, see MeetingBox.css). It sits right-anchored to
     the coach bubble's edge like the row card
     before it (see `MeetingBox.css`). Feeds `RISE_DISTANCE.card`, `threadLayout`, `CALL_SEED`,
     and the box's `--card-w` / `--card-h` — one number, one home. The 312.54 x 60 row card
     it replaces is in git if this is undone.
     ⚠️ THE WIDTH HUGS ITS CONTENT — 2026-09-10, Allison: "make sure the container is set to hug
     for the call notification and the padding is even all around". 214.164 = 12 + 36 (chip) + 12
     (gap) + 142.164 ("Meeting with Andrew" at 14 medium, measured as the glyph run in Chrome) +
     12. The frame's 205 was right for its 13px title; at 14 the title ran 9px into the right
     padding. It's a measured constant rather than `max-content` because the width is a
     TRANSITIONED length (card -> call -> trace) and intrinsic sizes can't animate without
     `interpolate-size`, which Safari and Firefox lack — same reason the bubble heights above are
     numbers. Re-measure if the title copy or type changes. The trace shares it (same meta row). */
  card: { w: 214.164, h: 100 },
  /* ⚠️ THE TRACE IS SHORTER THAN THE CARD. `2308:26183` (2026-09-09, "the end state should be
     this"): the same 205 card with the CTA row gone — 60 = 12 + 36 + 12. The thread is
     bottom-anchored, so when the box lands 36 shorter the bubbles above it settle down by 36 —
     `threadLayout` takes the slot height for exactly this. */
  ended: { h: 60 },

  /** ⚠️ 2026-09-10 — no longer frame 4's 480.28 x 391. Allison: header/composer now slide off
      the pane instead of the call outgrowing it (see `.demo-box.is-call` in `MeetingBox.css`), so
      the call is exactly the pane's own size, at the pane's own panel origin. Doc-only; the CSS
      carries the numbers in pane coordinates. */
  call: { w: 430.7, h: 388.2, panelX: 44, panelY: 106 },
};

/**
 * THE CALL'S CONTENT GROWS WITH THE BOX. Allison: "the images inside the video call should grow
 * and expand with the ui in the background, just so it looks like the entire thing is growing".
 * The content layer scales from this seed to 1 on the SAME duration and curve as the geometry
 * (and back on the close), so at every instant it is proportional to the box. The seed is the
 * card-to-call HEIGHT ratio — height is the tighter dimension the box grows through, so tracking
 * it keeps the content inside the box at every point of the curve without cropping.
 *
 * ⚠️ 96/391 -> 96/388.2 -> 100/388.2 on 2026-09-10, as the call's size and then the card's
 * height changed (above) — the ratio barely moves (0.245 -> 0.2473 -> 0.2576).
 */
export const CALL_SEED = GEOMETRY.card.h / GEOMETRY.call.h;   // 0.2576

/** the same idea on the way OUT: the close lands on the trace (60), not the card (96), so the
    content shrinks to the trace's ratio and stays inside the box to the last frame */
export const CALL_SEED_OUT = GEOMETRY.ended.h / GEOMETRY.call.h;   // 0.1546

/** One press, start to settled — drives the class duration and the keyframe stops. */
export const PRESS_TOTAL_MS =
  TIMING.pressDownMs + TIMING.pressHoldMs + TIMING.pressUpMs;

/**
 * Bottom-anchored stack: given which items exist, where does each sit?
 *
 * Returned in PANE coordinates. Items above the body's top edge are clipped by the pane, which
 * is intentional once all three are present — the coach's bubble running off the top is what
 * makes the thread read as an ongoing relationship rather than one that starts from nothing.
 */
export function threadLayout(
  items: { coach: boolean; client: boolean; card: boolean },
  /** the box's slot height — the card's, or the shorter trace's once the meeting has ended */
  cardH: number = GEOMETRY.card.h,
) {
  const G = GEOMETRY;
  const bottom = G.thread.h - G.thread.bottomPad;

  // present items stack upward from the bottom, newest lowest
  let b = bottom;
  const out = { coach: 0, client: 0, card: 0 };
  if (items.card) { out.card = b - cardH; b = out.card - G.thread.gap; }
  if (items.client) { out.client = b - G.client.h; b = out.client - G.thread.gap; }
  if (items.coach) { out.coach = b - G.coach.h; }

  /**
   * ⚠️ ABSENT ITEMS WAIT IN THE SLOT THEY WILL LAND IN — the bottom one — so that arriving
   * changes their opacity and scale but NOT their position.
   *
   * Allison: *"its like coming from the top and its weird."* It was. Absent items defaulted to
   * y = 0, and the `inset-block-start` transition then carried each one from the top of the
   * thread down to its slot at the same moment it popped. The notification was worst, because
   * its position rides the 780ms open transition, so it descended slowly. iMessage never moves
   * the new bubble: it appears where it lands, and it is the EXISTING bubbles that shove up.
   * Pre-placing the absent item in its landing slot is what makes the push the only motion.
   */
  if (!items.card) out.card = bottom - G.card.h;
  if (!items.client) out.client = bottom - G.client.h;
  if (!items.coach) out.coach = bottom - G.coach.h;
  return out;
}

/**
 * ⚠️ WITH ALL THREE PRESENT THE STACK IS TALLER THAN THE THREAD, BY DESIGN.
 * coach + gap + client + gap + card = 83.273 + 21.5 + 63.328 + 21.5 + 100 = 289.6 against
 * 243.1 - 10.4 = 232.7 of room, so the coach's bubble runs ~57px off the top and about a line
 * and a half of it stays visible. That is the effect Allison picked out of her own two options —
 * a thread clipped at the top reads as an ongoing relationship rather than one that begins from
 * nothing. It is not an overflow bug; do not "fix" it by shrinking the card or the gaps.
 * Derived from the geometry rather than written out, so it can't go stale the way the previous
 * hand-summed version (which still had the 60-tall row card in it) had.
 */
export const THREAD_OVERFLOW_BY_DESIGN =
  GEOMETRY.coach.h + GEOMETRY.thread.gap + GEOMETRY.client.h + GEOMETRY.thread.gap +
  GEOMETRY.card.h - (GEOMETRY.thread.h - GEOMETRY.thread.bottomPad);

/**
 * How far an arriving item rises — its own height plus the gap, which is also exactly how far
 * everything above it gets shoved. ⚠️ Keep these two equal or the thread stops being rigid and
 * the overlap comes back. Because every item lands with its bottom at the same line, every item
 * also STARTS at the same line: top = thread bottom + gap, just behind the composer.
 */
export const RISE_DISTANCE = {
  coach: GEOMETRY.coach.h + GEOMETRY.thread.gap,   // 104.77
  client: GEOMETRY.client.h + GEOMETRY.thread.gap, // 84.83
  card: GEOMETRY.card.h + GEOMETRY.thread.gap,     // 121.5
};
