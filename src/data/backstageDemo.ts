/**
 * Mock content for the Backstage demo panel. Separated from page copy on purpose —
 * `backstageContent.ts` is what the marketing page says, this is what the demo shows.
 *
 * Transcribed from Alli's Sketchbook → `1925:17017` (Section 4), the two message states.
 * Cast is Design Masterclass / Andrew Dally, matching the product team's own Backstage
 * frames. ⚠️ The Expert Agents panel uses a different cast (Dana Reyes / Maya Chen) —
 * one of the two should move before either page ships.
 *
 * ⚠️ Everything here now serves V8 only — every earlier Backstage version (V1's replacing
 * states, V2's continuous morph and its V2-1/V2-2/V2-3 variants, V3-V7) was deleted
 * 2026-09-11 once V8 was picked as the shipped direction. See git history if any of their
 * content is wanted again.
 */

export const MESSAGES = {
  /** the coach's opening message — outgoing, dark bubble, right-aligned */
  outgoing: {
    body:
      'Hey! So excited you joined my Backstage. Really looking forward to working with '
      + 'you and chatting about your goals.',
    author: 'You',
    time: '4:23 PM',
  },
  /**
   * the client's reply — incoming, white bubble, left-aligned, lands after the dots.
   * Sized for a two-line bubble (259.783 x 58.8) on purpose — the shorter V1 line this
   * replaced left half the bubble empty; the geometry and this copy were designed together.
   */
  incoming: 'Hey! Super excited to get things going! Can’t wait to meet!',
};

/** State 2 — the scheduled session. Figma `1930:17130` / panel `1916:16147`. */
export const MEETING = {
  month: 'APR',
  day: '4',
  title: 'Meeting with Andrew',
  when: 'Wed, Apr 4 at 10:30am',
  cta: 'Start meeting',
};

/**
 * The focus/task list's shape. `label` is the checkbox's accessible name — the visible copy
 * is rendered as segments so it can carry an inline link and an inline chip, which a plain
 * string label cannot.
 */
export interface TaskSegment {
  kind: 'text' | 'link' | 'chip';
  text: string;
  /** `chip` only — the little colour square that stands in for a favicon or product mark */
  swatch?: string;
  /**
   * `chip` only, and an ALTERNATIVE to `swatch`: the name of a Pine feature icon, for a chip
   * that names a Kajabi object rather than an external site. Verify names with Pine MCP
   * (`list_pine_icons`).
   */
  icon?: string;
}

export interface FocusTask {
  label: string;
  segments: TaskSegment[];
  /** a chip on its own line under the copy, rather than inline in it. `skeletonWidth` here is the
      CHIP's measured width — the kajabi variant draws a pill-shaped bar in the chip's place while
      loading (2026-09-10); rows without it get no chip bar */
  attachment?: { text: string; swatch?: string; icon?: string; skeletonWidth?: number };
  /** width of this row's skeleton bar while the list is "loading" — frame 6 */
  skeletonWidth: number;
}

/**
 * THE THREE TASKS ARE REAL KAJABI OBJECTS, and deliberately three DIFFERENT object types — a
 * course lesson, a Media Library file, a product — because one repeated type reads as a
 * category and three reads as "your whole account". BUSINESS DEVELOPMENT, NOT BAKING
 * TECHNIQUE (rewritten 2026-09-08, Allison: *"i want to focus more on business development for
 * the focus items"*) — coaching someone on their business is the higher-value story.
 *
 * THE THREE ARE A SEQUENCE, not three samples, and that is the point most worth keeping:
 *
 *   1  learn   watch the pricing lesson    "before our next session"
 *   2  apply   cost your own menu          "this week"
 *   3  act     go get wholesale accounts   "once your costs are set"
 *
 * Task 3's tail is causally gated on task 2 — a coach sequences work, and one line of copy is
 * enough to show it. Task 1's tail points at the call the demo itself ends on, so the loop's
 * last beat pays off its first list.
 *
 * ⚠️ EVERY LINE IS WIDTH-MEASURED against the rendered card, because `.bs-tasks__copy` is
 * `white-space: nowrap` — overlong copy does not wrap, it overflows the card. Re-measure with
 * the harness in the browser before changing any of it; "it looks like it fits" is how the
 * shelf names got truncated twice.
 *
 * V8's own card is TASKS ONLY, short copy. Transcribed from `2227:3867` on 2026-09-09 after
 * Allison took the Resources section out ("take out the resources and edit the copy to
 * this"). The chips name the object, so each line is only the action — a coach's three-step
 * plan, watch -> do -> start. Same attachments and icons as `FOCUS_ITEMS_SOURCED`; only the
 * sentences changed.
 *
 * ⚠️ Two frame typos corrected here, not carried: "wekk" -> "week", and the trailing comma on
 * "Then start," (the chip completes the sentence; a comma before it reads as a list).
 *
 * ⚠️ `skeletonWidth`s are MEASURED, not authored — 2026-09-10 (evening), when the bars came back
 * ("adding the skeleton back in (but no shimmer state)"). These are the rendered text runs in
 * Chrome (`Range.getBoundingClientRect()` over the copy), rounded to the px, so each bar ends
 * where its line will. The attachments' `skeletonWidth` is the rendered CHIP width — the
 * kajabi variant stands a pill bar in for each chip. Re-measure if copy or type changes.
 */
export const FOCUS_TASKS: FocusTask[] = [
  {
    label: 'Watch before our next call',
    segments: [{ kind: 'text', text: 'Watch before our next call' }],
    attachment: { text: 'Bakery Business Foundations · Lesson 03', icon: 'course', skeletonWidth: 313 },
    skeletonWidth: 174,
  },
  {
    label: 'Fill this out this week',
    segments: [{ kind: 'text', text: 'Fill this out this week' }],
    attachment: { text: 'menu-costing.pdf', icon: 'file', skeletonWidth: 155 },
    skeletonWidth: 138,
  },
  {
    label: 'Then start Wholesale Playbook',
    segments: [
      /* ⚠️ no trailing space — the gap before the inline chip is the chip's own
         `margin-inline-start` (SourcedFocusItemsCard.css, `is-kajabi`), transcribed from the
         frame, not a whitespace glyph whose width depends on the font. 2026-09-10, Allison:
         "a little bit more space before the chip". */
      { kind: 'text', text: 'Then start' },
      { kind: 'chip', text: 'Wholesale Playbook', icon: 'product' },
    ],
    skeletonWidth: 244,
  },
];

/**
 * ⚠️ NO CARD TITLE. The Figma frame (`2192:18201`) has exactly two headings — Resources and
 * Tasks — and no "Focus items" title above them, so `heading` is the FIRST section's label
 * rather than a title for the card. Transcribed 2026-09-08 from the frame Allison settled on.
 *
 * `heading`/`subheading` are the only pieces of this object V8 actually renders — its
 * `SourcedFocusItemsCard` always mounts with `resources={false}`, so `tasks` here is dead at
 * runtime (V8 passes its own `FOCUS_TASKS`); it stayed because that was the default the
 * component's other consumer (the deleted V2-2) relied on.
 */
export const FOCUS_ITEMS_SOURCED = {
  heading: 'Resources',
  subheading: 'Tasks',
  tasks: [
    /**
     * ⚠️ Rows 1 and 2 are PLAIN SENTENCES — no inline chip. The frame puts each object's
     * provenance in the attachment chip UNDER the sentence and leaves the sentence itself
     * unstyled; only row 3 carries an inline chip, because there the chip completes the
     * sentence rather than annotating it. Do not "fix" 1 and 2 to match 3; the asymmetry is
     * the frame's, and Allison declined the change that would have evened it out.
     */
    {
      label: 'Watch Pricing for profit before our next session',
      segments: [
        { kind: 'text', text: 'Watch Pricing for profit before our next session' },
      ],
      attachment: { text: 'Bakery Business Foundations · Lesson 03', icon: 'course' },
      skeletonWidth: 349,
    },
    {
      label: 'Fill out the Menu costing worksheet this week',
      segments: [
        { kind: 'text', text: 'Fill out the Menu costing worksheet this week' },
      ],
      /* a real stored asset rather than a restatement of its location — the location is the
         Resources row's job now. The frame drops the byte size; see backstage/NOTES. */
      attachment: { text: 'menu-costing.pdf', icon: 'file' },
      skeletonWidth: 274,
    },
    {
      label: 'Once your costs are set, start Wholesale Playbook',
      segments: [
        { kind: 'text', text: 'Once your costs are set, start ' },
        { kind: 'chip', text: 'Wholesale Playbook', icon: 'product' },
      ],
      skeletonWidth: 306,
    },
  ] as FocusTask[],
};

/**
 * The Resources shelf's rows — the "bank" the tasks were drawn out of in the deleted V2-2/V2-3
 * demos. Also now dead at runtime under V8 (`resources={false}`), but `SourcedFocusItemsCard`
 * still reads `FOCUS_SOURCES.items` unconditionally before deciding whether to render it, so
 * the export has to exist. `surface` is the admin nav's own word for where the thing lives
 * (see `navigation.ts`) — `Courses` and `Media Library` are literally nav labels, and `art`
 * keys `OBJECT_ART` in `SourcedFocusItemsCard.tsx` for the (also now unused) real-product-art
 * marks.
 */
export const FOCUS_SOURCES = {
  items: [
    { icon: 'lesson', name: 'Pricing for profit', source: 'Courses', art: 'lesson', skeletonWidth: 168 },
    { icon: 'file', name: 'Menu costing worksheet', source: 'Media Library', art: null, skeletonWidth: 214 },
    { icon: 'product', name: 'Wholesale Playbook', source: 'Product', art: 'product', skeletonWidth: 186 },
  ],
};
