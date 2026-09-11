# Backstage — marketing null state (prototype)

A design prototype of the **not-yet-set-up Backstage null state**, rebuilt as a marketing
surface instead of a utility empty state.

It shows behaviour and pixel intent. Values were pulled from `kajabi-products` and the Figma
frames rather than eyeballed, so it can be used as the spec.

- **Figma:** Alli's Sketchbook → page `↳ Null State [WIP🚧]` — frame "Backstage null state"
  (`2363:43327`, the page copy) and section "Backstage Animation Story board" (`2369:49374`,
  the demo's dev storyboard). This is the dev-facing page; nothing here should point at
  Allison's own working file ("Scratchpad") — ask her directly if something's missing.

```bash
npm install     # .npmrc sets legacy-peer-deps (Pine peers react@^18; we pin 17 like prod)
npm run dev     # http://localhost:5200
```

One page, served at both `/` and `/backstage`. There is no shipped equivalent of this page
today.

⚠️ **This repo is Backstage only.** It started as a fork of the Expert Agents null-state
prototype (`expert-agents-null-state` — same shell, same conventions) and was split into its
own private repo on 2026-09-11 so the two could be shared independently. Expert Agents' page
and its demo panel were deliberately removed here; if you need that prototype, it's the
other repo, not a route on this one.

---

## The page

Same template as the Expert Agents page (`ExpertAgentsListEmptyState.tsx` in
`kajabi-products` is the shipped reference it was pixel-matched against — geometry read off
prod through the `pds-*` shadow roots, since the light DOM reports inherited defaults and the
real type only shows inside the shadow tree).

⚠️ **The headline tracking is +0.26px, not −0.5px.** Pine's Figma text style says −0.5, but
Pine's shipped CSS for `size="h2"` renders +0.26, and the EA page's own −0.5 override dies at
the shadow boundary. Prod paints +0.26, so that is what this matches. Worth raising with
design systems — the Figma style and the web component disagree.

**The 520×600 visual is `BackstagePanel`** — the teal gradient ground at the exact footprint,
with the demo mounting into its `children`. The `pds-alert` shadow-padding workaround is
`src/hooks/usePdsAlertPadding.ts`.

Copy is Allison's draft — see the open questions in `src/data/backstageContent.ts` (the noun,
the CTA destination, pricing sign-off, the missing Coaching comparison). **Copy is not
settled**; Sam's copy pass is still outstanding (`projects/marketing-null-states/backstage/NOTES.md`
in the design project, not this repo).

## The demo — the continuous loop

Storyboarded by Allison in Figma (page `↳ Null State [WIP🚧]`, section "Backstage Animation
Story board", `2369:49374`), 2026-09-09/10. Components live
in `src/components/BackstageDemo/`. Earlier directions (three replacing states, a continuous
morph and three variants of it, and four further concepts) were built, compared, and deleted
once this one was picked — see git history if any of them are wanted again.

**The idea: everything happens inside the panel.** Nothing arrives from outside it and nothing
leaves. Two messages and a meeting notification arrive one after another, like texts; the
notification opens into a video call; the call closes back to a trace of itself; the panel
then slides to a Resources/Tasks pane and back, and the loop restarts.

| # | Beat |
|---|---|
| 1-2 | the coach's message, then the client's reply, arrive as the thread pushes up |
| 3 | the meeting notification arrives the same way |
| 4 | `Start meeting` press — a real click, size-only, no colour change |
| 5 | the notification box opens into the video call, content fading in left tile → right tile → controls |
| 6 | the call closes back to a compact trace — controls dissolve, then the box shrinks, photos folding in right-then-left |
| 7 | the panes slide sideways to Resources/Tasks, tasks revealing as the pane lands, then slide back |

All pacing lives in `BackstageDemo/timing.ts` — nothing else hard-codes a duration. Every
number there carries the reasoning for its current value; read it before changing one.

**`?state=` pins one beat** for review. A pinned frame runs no timeline, it just renders that
instant.

`?state=msg1` · `msg2` · `card` · `press` · `call` · `ended` ·
`resources` · `skeleton`

e.g. `http://localhost:5200/backstage?state=call`

**Dev storyboard in Figma:** Alli's Sketchbook → page `↳ Null State [WIP🚧]`, section
"Backstage Animation Story board" (`2369:49374`) — one frame per pinned state, set to the
code's own values.

## Structure

```
src/
  data/
    backstageContent.ts   the page's own copy
    backstageDemo.ts       the demo panel's mock content (cast, tasks, resources)
    account.ts, navigation.ts   shared shell data (site name, sidenav labels)
  shell/                  topbar + left rail, built from prod
  hooks/
    usePdsAlertPadding.ts  pds-alert shadow-padding workaround
  components/
    BackstageNullState/     copy column + visual
    BackstagePanel/         the 520x600 teal-gradient ground the demo mounts into
    BackstageDemo/          the demo loop. timing.ts = ALL pacing + geometry
```
