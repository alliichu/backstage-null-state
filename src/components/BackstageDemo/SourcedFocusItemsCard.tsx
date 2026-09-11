import { PdsCheckbox, PdsIcon } from '@pine-ds/react';
import { course, creatorStudio, draft, file, hdVideo, packages, product } from '@pine-ds/icons/icons';
import {
  FOCUS_ITEMS_SOURCED,
  FOCUS_SOURCES,
  FocusTask,
  TaskSegment,
} from '../../data/backstageDemo';
/* `V2_TIMING` (the original default source for these) was retired with the rest of V2 on
   2026-09-11. This card's only remaining caller (V8's `DemoSequence`) always passes its own
   `revealEase` / `revealMs` / `revealStaggerMs`, so these three defaults are unreachable in
   practice — kept as real, meaningful fallbacks (V8's own reveal timing) rather than deleted,
   since `revealMs` / `revealStaggerMs` / `resources` staying optional props is what lets this
   component still make sense on its own. */
import { REVEAL, REVEAL_EASE } from './timing';
import foodStill from './assets/course-knife-skills.jpg';
import coachToCamera from './assets/call-coach.jpg';
import './SourcedFocusItemsCard.css';

/**
 * The creator's real product art, keyed by the `art` field on `FOCUS_SOURCES`. Reached across
 * component folders rather than duplicated — the same call `Conversation.tsx` makes for the
 * client's avatar. See `FOCUS_SOURCES` for which stills exist and why only two are used.
 */
const OBJECT_ART: Record<string, string> = {
  /* a business lesson looks like the coach talking to camera, not like food */
  lesson: coachToCamera,
  /* appetite imagery as the offer's cover — plausible on a bakery-business product */
  product: foodStill,
};

/** Same object→glyph map as `FocusItemsCard`, all verified via Pine MCP. */
const OBJECT_ICONS: Record<string, string> = {
  course,
  lesson: hdVideo,
  file,
  product: packages,
};

/**
 * The `kajabi` variant's glyphs — Allison's "kajabi sources" frame `2227:3867`, which names each
 * resource by the Kajabi OBJECT it is rather than the media it contains: `creator-studio` for a
 * lesson, `draft` for a file, `product` (the cube) for a product. Same map for the chips, which
 * is why the Wholesale Playbook chip here is a cube and not V2-2's `packages`.
 */
const KAJABI_ICONS: Record<string, string> = {
  course,
  lesson: creatorStudio,
  file: draft,
  product,
};

interface SourcedFocusItemsCardProps {
  /** false = both lists are skeleton bars shimmering, true = the real content */
  loaded?: boolean;
  /** `thumbnail` swaps each Resources glyph for real product art (V2-3) */
  marks?: 'icon' | 'thumbnail';
  /**
   * The card is sliding in / on screen. This STARTS the shimmer rather than letting it
   * free-run from mount, so the viewer sees one whole pass instead of joining one partway —
   * see `shimmerMs`. Without it the sweep is ~78% done before the card is even visible.
   */
  active?: boolean;
  /**
   * `sourced` (default, V2-2) is frame `2192:18201`: a source column on every resource row and
   * media glyphs. `kajabi` (V8) is frame `2227:3867` — Allison, 2026-09-09: "make the end state
   * of the resources and tasks match this": NO source column, Kajabi-object glyphs, resource
   * names in regular 12 on `--pine-color-text`, and Pine chips with the grey-300 stroke and a
   * 12 medium label. Same rows, same reveal — the two frames differ only in dress, so this is
   * one component with a class, not a fork. V2-2 is untouched.
   */
  variant?: 'sourced' | 'kajabi';
  /**
   * Show the Resources section. V8 turns it off (`2227:3867`, 2026-09-09 — Allison: "take out
   * the resources"): the card is then Tasks alone, the heading at the top, and the reveal's
   * stagger starts at the first task instead of holding four empty slots for rows that are not
   * there. V2-2 keeps both sections.
   */
  resources?: boolean;
  /** the task rows — V8 passes its own short copy (`FOCUS_TASKS`); V2-2 uses the default */
  tasks?: FocusTask[];
  /**
   * `true` (default, V2-2) draws the skeleton bars while `loaded` is false; `false` doesn't render
   * the bar elements at all. V8 passed `false` for most of 2026-09-10 ("no skeleton at all... the
   * tasks will just fall in nicely") and went back to `true` that evening ("adding the skeleton
   * back in (but no shimmer state)") — the kajabi variant draws its bars FLAT, no sweep, and adds a
   * pill bar for each chip line (see the `is-kajabi` skeleton rules in the CSS). The content
   * reveal (the name/copy fade-and-rise, staggered by row) is unaffected either way — that
   * transition lives on the content itself, not on the skeleton.
   */
  skeleton?: boolean;
  /**
   * The reveal's easing curve, as a CSS `cubic-bezier(...)`. Defaults to V2's `REVEAL_EASE`.
   * ⚠️ A PROP, NOT A CSS VAR FROM THE PARENT: this component sets `--bs-tasks-reveal-ease` inline on
   * itself, and an inline custom property shadows any value an ancestor provides — so a stage
   * passing its own curve down the tree changed nothing (V8 did exactly that, unknowingly). V8
   * passes `TASKS_REVEAL_EASE` (2026-09-10, "slower at the end so a curve animation").
   */
  revealEase?: string;
  /**
   * Per-row reveal duration and the top-to-bottom stagger, in ms. Same story as `revealEase`:
   * the card sets `--bs-tasks-reveal` / `--bs-tasks-reveal-stagger` inline, so they have to come in as
   * props to be overridable at all. Default to V2's. V8 lengthens the duration (2026-09-10,
   * "i want it to appear slower at the end" — the curve alone was imperceptible at 380ms).
   */
  revealMs?: number;
  revealStaggerMs?: number;
}

function Segment({
  segment, icons, iconSize,
}: { segment: TaskSegment; icons: Record<string, string>; iconSize: string }) {
  if (segment.kind === 'link') {
    return <span className="bs-tasks__link">{segment.text}</span>;
  }
  if (segment.kind === 'chip') {
    return (
      <span className="bs-tasks__chip">
        {segment.icon && (
          <PdsIcon
            className="bs-tasks__objicon"
            icon={icons[segment.icon]}
            size={iconSize}
            color="var(--pine-color-text-secondary)"
          />
        )}
        {segment.text}
      </span>
    );
  }
  return <>{segment.text}</>;
}

/**
 * V2-2 — RESOURCES, THEN TASKS.
 *
 * TRANSCRIBED from Figma **`2192:18201`** on 2026-09-08, the frame Allison settled on after
 * four rounds of iteration. Two sections, each doing exactly one job:
 *
 *   Resources   WHAT IT IS    glyph, object name, and the admin sidebar's own word for where
 *                             it lives (`Courses`, `Media Library`) — see `FOCUS_SOURCES`
 *   Tasks       WHAT TO DO    the assignment and its timing, provenance in a chip below
 *
 * That split is why two sections earn their keep. An earlier pass merged them into a single
 * list and Allison rejected it: *"no i still want it to be resources and then tasks."*
 *
 * ⚠️ ALL SIX ROWS SHIMMER, not three. Allison: *"it should have more lines of shimmer with
 * resources and tasks already set."* Both section HEADINGS are present from the first frame of
 * the beat while every row is still a bar — the card's structure is established before its
 * content arrives, which makes the resolve read as data loading into a known shape rather than
 * a panel assembling itself.
 *
 * ⚠️ ONE shimmer rate for all six bars. A per-row multi-rate version was built and reverted on
 * Allison's call (*"no undo whatever you just did"*) — do not reintroduce it. The keyframes are
 * shared from `FocusItemsCard.css`.
 *
 * ⚠️ THE GLYPHS AND CHECKBOXES ARE WRAPPED IN PLAIN SPANS, and that is the only way they can
 * fade. They are Pine web components and Pine drives opacity on its own hosts — an author
 * `opacity: 0` on `pds-icon` / `pds-checkbox` loses the fight and leaves the glyph stuck
 * mid-transition (measured at 0.657). The wrapper is a plain element, so it animates normally.
 * Do not "simplify" the wrappers away.
 *
 * ⚠️ The reveal runs top to bottom across BOTH lists on ONE stagger — resource rows are indices
 * 0-2 and task rows 4-6, with slot 3 deliberately EMPTY. That held slot is what makes the two
 * sections read in order rather than together; a fully continuous 0-5 could not, because with
 * any overlap the first task starts before the last resource has settled. `--bs-tasks-index`
 * carries the position and every transition delay reads it. See `revealSectionGap`.
 *
 * ⚠️ NO CARD TITLE. The frame has only the two section headings — there is no "Focus items"
 * line above them, which is why `FOCUS_ITEMS_SOURCED.heading` is 'Resources'.
 *
 * ⚠️ Tasks rows 1-2 are PLAIN SENTENCES and only row 3 carries an inline chip. That asymmetry
 * is the frame's, and it makes row 3 shorter than the others. Allison was shown the fix and
 * declined it; see `FOCUS_ITEMS_SOURCED`.
 */
export function SourcedFocusItemsCard({
  loaded = false,
  marks = 'icon',
  active = false,
  variant = 'sourced',
  resources = true,
  tasks = FOCUS_ITEMS_SOURCED.tasks,
  skeleton = true,
  revealEase = REVEAL_EASE,
  revealMs = REVEAL.inMs,
  revealStaggerMs = REVEAL.staggerMs,
}: SourcedFocusItemsCardProps) {
  const art = marks === 'thumbnail';
  const kajabi = variant === 'kajabi';
  const icons = kajabi ? KAJABI_ICONS : OBJECT_ICONS;
  /* the chips' object glyph — 14 in the kajabi variant to sit with its 14px chip text (2026-09-10,
     Allison: "fix the chip card as well"); Pine's `small` for V2-2. The host box is sized to match
     in the `is-kajabi` CSS block. */
  const chipIconSize = kajabi ? '14px' : 'small';
  const sources = FOCUS_SOURCES.items;
  /* with no Resources above them the tasks are the first rows, and index from 0 */
  const taskIndex0 = resources ? sources.length + REVEAL.sectionGap : 0;

  return (
    <div
      className={
        `bs-tasks${loaded ? ' is-loaded' : ''}${art ? ' has-art' : ''}` +
        `${active ? ' is-active' : ''}${kajabi ? ' is-kajabi' : ''}`
      }
      /* the reveal's pacing has one home, `timing.ts` — the stylesheet holds no numbers */
      style={{
        ['--bs-tasks-reveal' as string]: `${revealMs}ms`,
        ['--bs-tasks-reveal-stagger' as string]: `${revealStaggerMs}ms`,
        ['--bs-tasks-reveal-ease' as string]: revealEase,
      }}
    >
      {/* ------------------------------------------------------------- Resources */}
      {resources && <p className="bs-tasks__heading">{FOCUS_ITEMS_SOURCED.heading}</p>}

      {resources && <div className="bs-tasks__resources">
        {sources.map((source, i) => (
          <div
            className="bs-tasks__resource"
            key={source.name}
            style={{ ['--bs-tasks-index' as string]: i }}
          >
            {art && OBJECT_ART[source.art ?? ''] ? (
              <img className="bs-tasks__art" src={OBJECT_ART[source.art ?? '']} alt="" />
            ) : art ? (
              /* no poster frame — Media Library's own typed placeholder, not a stand-in */
              <span className="bs-tasks__art bs-tasks__art--none">
                <PdsIcon
                  icon={icons[source.icon]}
                  size="small"
                  color="var(--pine-color-text-secondary)"
                />
              </span>
            ) : (
              <span className="bs-tasks__glyph-wrap">
                <PdsIcon
                  className="bs-tasks__glyph"
                  icon={icons[source.icon]}
                  /* the kajabi frame draws the glyph at 12, the same size as its chips' */
                  size={kajabi ? '12px' : 'small'}
                  color={kajabi ? 'var(--pine-color-text)' : 'var(--pine-color-text-secondary)'}
                />
              </span>
            )}

            <span className="bs-tasks__name">{source.name}</span>
            {/* the `kajabi` frame hides the source column — the glyph carries the "where" */}
            {!kajabi && <span className="bs-tasks__source">{source.source}</span>}

            {skeleton && (
              <span
                className="bs-tasks__skeleton bs-tasks__skeleton--resource"
                /* the TEXT width; the CSS adds the glyph slot it now also covers */
                style={{ ['--bs-tasks-bar' as string]: `${source.skeletonWidth}px` }}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>}

      {/* ----------------------------------------------------------------- Tasks */}
      {/* `--tasks` only carries the gap below a Resources section; alone, the heading sits at
          the top of the card as `2227:3867` draws it */}
      <p className={`bs-tasks__heading${resources ? ' bs-tasks__heading--tasks' : ''}`}>
        {FOCUS_ITEMS_SOURCED.subheading}
      </p>

      <div className="bs-tasks__list">
        {tasks.map((task, i) => (
          <div
            className="bs-tasks__row"
            key={task.label}
            /* continues the Resources stagger, plus a held slot so Resources finishes
               before Tasks starts — see `revealSectionGap`; from 0 when Tasks stand alone */
            style={{
              ['--bs-tasks-index' as string]: taskIndex0 + i,
            }}
          >
            <div className="bs-tasks__line">
              <span className="bs-tasks__check-wrap">
                <PdsCheckbox
                  className="bs-tasks__check"
                  componentId={`bs-tasks-task-${i}`}
                  label={task.label}
                  hideLabel
                />
              </span>

              <span className="bs-tasks__copy">
                {task.segments.map((segment, s) => (
                  <Segment segment={segment} icons={icons} iconSize={chipIconSize} key={s} />
                ))}
              </span>

              {skeleton && (
                <span
                  className="bs-tasks__skeleton"
                  /* the TEXT width; the CSS adds the checkbox slot it now also covers */
                  style={{ ['--bs-tasks-bar' as string]: `${task.skeletonWidth}px` }}
                  aria-hidden="true"
                />
              )}
            </div>

            {task.attachment && (
              <div className="bs-tasks__attachment">
                <div className="bs-tasks__attachment-inner">
                  <span className="bs-tasks__chip">
                    {task.attachment.icon && (
                      <PdsIcon
                        className="bs-tasks__objicon"
                        icon={icons[task.attachment.icon]}
                        size={chipIconSize}
                        color="var(--pine-color-text-secondary)"
                      />
                    )}
                    {task.attachment.text}
                  </span>
                </div>
                {/* the kajabi variant keeps the chip line's height while loading (the chips fade,
                    they don't unfold), so the line gets a bar of its own — a pill the chip's size.
                    `--bs-tasks-bar` is the CHIP's measured width here, not a text run. */}
                {skeleton && kajabi && task.attachment.skeletonWidth != null && (
                  <span
                    className="bs-tasks__skeleton bs-tasks__skeleton--chip"
                    style={{ ['--bs-tasks-bar' as string]: `${task.attachment.skeletonWidth}px` }}
                    aria-hidden="true"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
