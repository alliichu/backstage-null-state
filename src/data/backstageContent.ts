/**
 * Backstage null-state copy. One object today; add another (plus a row in App.tsx) if a
 * second direction is ever put on its own route.
 *
 * Transcribed from Alli's Sketchbook → page `↳ Null State [WIP🚧]` → frame "Backstage null
 * state" (`2363:43327`, Allison's draft, 2026-09-01). Earlier copy alternates were explored
 * before this one was settled on; this frame is the one to build from. Copy is NOT settled
 * even so; see the open questions at the bottom of this file.
 *
 * Same content recipe as Expert Agents' own page (a separate prototype): one line on what
 * it is → three short value lines → one visual → one action → a price strip that is the
 * lightest thing on the page.
 */

export interface ValueProp {
  heading: string;
  description: string;
}

export interface BackstageContent {
  headline: string;
  /** Optional. Allison's draft hides it; every alternate turns it back on. */
  body?: string;
  values: ValueProp[];
  pricing: {
    heading: string;
    body: string;
    linkLabel: string;
    linkHref: string;
  };
  cta: string;
}

/** Allison's draft, `2363:43327`. Her words, with one resolved change (see CTA). */
export const BACKSTAGE_CONTENT: BackstageContent = {
  // Explicit line break, matching the frame: "Offer a premium experience" /
  // "with direct access to you". Left wrapping, it breaks after "with" instead.
  // Rendered with `white-space: pre-line` rather than a <br>, so the copy stays plain text.
  headline: 'Offer a premium experience\nwith direct access to you',

  // Deliberately absent in the draft — she hid the Body layer, which makes the column 513
  // tall instead of 561. Nothing then states what Backstage IS, which is worth revisiting:
  // every alternate restores a line here. Left off so the route matches the frame.
  body: undefined,

  values: [
    {
      heading: 'Earn more from your audience',
      description:
        'A few members paying for closer access can be worth more than a hundred new signups.',
    },
    {
      heading: "Built from what you've already made",
      description:
        'Pull lessons, files, and videos from your library into a private space for one member.',
    },
    {
      heading: 'Create lifelong members',
      description:
        'Tasks, messages, and progress keep members engaged week to week, and lead to higher retention.',
    },
  ],

  // "Book a setup call", not the draft's "Book a call": the extra word says the call is to
  // get you running rather than to be sold to, and it measures 168px against the shipped
  // Expert Agents button's 188px, so it is well inside the house ceiling.
  cta: 'Book a setup call',

  pricing: {
    heading: 'Your first member is included',
    body: '$49/mo per member after that',
    linkLabel: 'Learn more',
    linkHref: 'https://help.kajabi.com/en/articles/13728979-private-client-backstage',
  },
};

/**
 * OPEN — do not treat any of this as settled:
 *
 * 1. NOUN. This says "member". Prod marketing copy and the help article say "client"; the
 *    beta alert says "seats". Three words for one thing, and two of the CTA candidates put
 *    the noun in the button. Pick one before build.
 * 2. CTA DESTINATION. "Book a setup call" assumes Sam's 8/21 request-access decision held.
 *    If self-serve came back it becomes "Get started" and the argument changes.
 * 3. PRICING. Restates the beta alert. Expert Agents hit a pricing sign-off problem on
 *    exactly this, and per-seat pricing dates fast.
 * 4. THE COACHING COMPARISON is missing entirely. Kajabi already sells a `CoachingProgram`
 *    product type with sessions, scheduling, recordings and Kajabi Live — and Backstage
 *    uses the SAME Kajabi Live. The differentiated surface is everything BETWEEN sessions
 *    (assignments with self-computing status, resources drawn from courses you already
 *    sell, transcribed voice memos). No version of this copy positions against Coaching.
 */
