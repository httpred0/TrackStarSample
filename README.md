# Track Star — Hero

Implementation of the `Hero Track Star.dc.html` design document from the
[Claude Design project](https://claude.ai/design/p/196d553e-1004-4857-a4d5-c3e313526e38).

## Running it

```bash
node serve.js
```

Then open <http://localhost:4173>. It is a plain static site — any static file
server (or opening `index.html` over `file://`) works too.

## Layout

| Path                      | What it is                                                        |
| ------------------------- | ----------------------------------------------------------------- |
| `Hero Track Star.dc.html` | The imported design document. **Source of truth.**                 |
| `build.js`                | Transpiles the design document into `index.html` + `app.js`.       |
| `index.html`, `app.js`    | Generated output. Do not edit by hand — edit the design and rebuild. |
| `covers/`, `people/`, `stories/`, `mark-trackstar*.svg` | Artwork.       |
| `overrides.css`           | Hand-authored corrections layered over the generated CSS.           |
| `enhance-footer.js`       | Build-time footer markup transform.                                 |
| `favicon.svg`             | Tab icon, cropped from the logo mark.                               |
| `serve.js`                | Minimal static dev server.                                          |

## Rebuilding

```bash
node build.js
```

The design document targets a runtime (`support.js`) that the built site does
not need. `build.js` removes that dependency by translating the three
runtime-specific constructs into standard web platform equivalents:

- `<helmet>…</helmet>` becomes the real `<head>`.
- `style-hover="…"` becomes a generated class plus a real `:hover` rule.
  Inline `style` attributes out-rank class selectors, so each declaration is
  emitted with `!important`. The 33 hover attributes in the design dedupe to
  9 rules.
- `onClick="{{ handler }}"` becomes `data-dc-click="handler"`, wired up in
  `app.js` from the object returned by `renderVals()`.

The `data-dc-script` class body is already plain DOM code, so `app.js` copies
it verbatim under a no-op `DCLogic` base class rather than rewriting it. That
keeps the scroll-driven marquee physics, star cursor trail, theme toggle,
reveal observers, face rotation, shine sweep and video hover previews
behaviourally identical to the design.

## Corrections layer

`index.html` and `app.js` are regenerated, so changes go in `overrides.css`,
which `build.js` links last, and in `enhance-footer.js` when new elements are
needed. Because the design styles everything inline, and inline styles
out-rank selectors, nearly every declaration in the CSS needs `!important`.

Items 1–6 are scoped to the mobile breakpoint; 7 and 8 are desktop-only. Apart
from those two deliberate desktop changes, 1280px renders as the design
specifies — verified: footer back to its two-group row, chevrons `display:
none`, headline at 108.9px, card rows back to a grid.

**1 · Decorative glows escaped their sections.** Each content section positions
large radial-gradient circles at negative offsets to bleed light in from the
edges. The hero clips them, but the three `[data-shell]` sections did not, so
on a phone they extended past the right edge and widened the document. Fixed
with `overflow-x: clip` (not `hidden`, which would force the other axis to
`auto` and turn each section into a scroll container).

**2 · The top navbar did not fit.** The row is `flex-wrap: nowrap` and measures
27.4× its font-size — 411px at the design's 15px mobile base, more than a
390px phone has. It did not merely overflow: flexbox squashed the round theme
toggle into an oval and the bar grew from 72px to 87px tall. Wrapping was not
an option, as the bar is `position: fixed` over the hero.

Whitespace is tightened (the bar's side padding and the two nav gaps) to bring
the row to ~25.6×, and the items scale with `min(var(--ts-base), 3.4vw)` —
about 13.3px at 390px, leaving ~50px of slack so the row sits comfortably
rather than only just fitting. Every size in the bar is `em` of that one
value, so it keeps the design's proportions as it scales.

**3 · Hero scale.** The design's mobile `--ts-h1` of 3.25em (48.75px) reads
small on a phone. It is set fluidly instead — `20.5vw`, about 80px at 390px —
so the headline dominates the hero and scales with the viewport. `--ts-lead`
drops from 0.95em to 0.85em so the step down to the supporting copy reads
correctly.

**4 · Card carousels show a slice of the next card.** The `--ts-cardw`
flex-basis was being ignored for two independent reasons. Flex items default
to `min-width: auto`, so a card could not go narrower than its ~314px
min-content width; and the feed cards carry 1.5em of padding under
`content-box` sizing, which added another 47px on top. Together those left a
15px sliver. `min-width: 0` and `box-sizing: border-box` make the basis apply,
giving a 55px peek at 390px.

**4b · Larger marquee covers.** `--ts-cover` moves from 11.5em (172px) to
`54vw` (~211px at 390px), with `--ts-marq` following so the marquee's
min-height keeps up with the taller artwork.

**5 · Mobile footer menu.** The design's footer is one row of underlined text
links; on a phone it now reads as a tapable menu — label left, chevron right,
hairline dividers — with a larger mark and larger social circles.

The legal links live in two sibling groups (Terms/Privacy/Cookies and
Jobs/Press/Apps). `display: contents` dissolves both boxes so their children
become items of one shared row, putting all six on a single line down to 320px
with the copyright centred above them. Each link is `flex: 1 1 auto`, so they
share the leftover width and the row spans the footer edge to edge with the
separators at even intervals; an `auto` basis rather than `0` keeps the longer
labels from being squeezed at 320px. Because the two
groups are separate parents, an `a + a` rule would miss the seam between
Cookies and Jobs, so the hairline separator goes on every link and is removed
from the first. The copyright needs `text-align: center` of its own, since
flex centring does not position text inside an item that already spans the
line.

The chevrons are real elements added at build time by `enhance-footer.js`, not
CSS pseudo-elements, so they remain selectable and exposed to assistive tech.
That module asserts an expected hit count for every replacement, so a change
in the design document fails the build loudly instead of silently emitting a
half-transformed footer.

**6 · Space between the hero and the next section.** At 390×844 the gap from
the cover art to the "Just rated" heading was 146px: 90px of section top
padding, 32px of slack inside the marquee, and 24px of hero bottom padding.
The slack came from the hero being `min-height: 100svh` while the marquee is
`flex: 1 0 auto` — it absorbed the leftover viewport height while the covers
stayed pinned to its top. Letting the hero size to its content removes that,
and a mobile-sized section top padding removes most of the rest, bringing the
gap to 82px. The hero still fills the screen in practice: its content is
~831px tall at 390×844.

**7 · Desktop hero CTA.** The lead row is a grid of `repeat(auto-fit,
minmax(min(100%, 18em), 1fr))`, four tracks wide at 1280px. The paragraph took
the first track and "Start Rating" simply landed in the second, stranded
mid-row. It is now pinned to the last track and aligned to its end, so it sits
hard right at any column count. Mobile collapses to one column, where the CTA
belongs under the paragraph, so this is scoped above the breakpoint.

**8 · Desktop footer links.** Underlines dropped and a small `•` set between
neighbours via `::before` on every link after the first, with
`pointer-events: none` so the bullet stays out of the link's hit area.

## Favicon

`favicon.svg` is the same mark as `mark-trackstar.svg`, with the viewBox
cropped from `0 0 122 110` to the artwork's own bounds so it fills a 16px tab
icon instead of sitting inside the source file's padding.

### Measured

In a fixed-width iframe, per viewport width:

| Width | 320 | 390 | 430 | 1280 |
| ----- | --- | --- | --- | ---- |
| Headline | 65.6px | 79.9px | 88.2px | 108.9px |
| Cover width | 173px | 211px | 232px | 243px |
| Card peek | 39px | 55px | 64px | grid |
| Topbar font | 10.9px | 13.3px | 14.6px | 14.7px |
| Horizontal overflow | 0 | 0 | 0 | 0 |

The theme toggle stays circular at every width, the card scrollers still
scroll, and no local image fails to load.

> Note: the in-app browser's mobile emulation evaluates media queries against
> a different width than it reports through `documentElement.clientWidth`, so
> it is not reliable for this. Measuring inside a fixed-width iframe is.

> Note: the in-app browser's mobile emulation evaluates media queries against
> a different width than it reports through `documentElement.clientWidth`, so
> it is not reliable for this. Measuring inside a fixed-width iframe is.

## Artwork

All 20 PNGs are the real, full-resolution artwork. They were supplied as Figma
SVG exports that wrap the source PNG as a base64 data URI, and were matched to
their target filenames by byte-comparing each candidate against the partial
copies pulled from the design project. Every one matched exactly, so the
mapping is verified rather than inferred:

| Target                | Source                      |
| --------------------- | --------------------------- |
| `covers/cover-1`–`5`  | `Rectangle 4`–`8`           |
| `covers/cover-6`      | `image 50`                  |
| `covers/cover-7`      | `image 51`                  |
| `covers/cover-8`      | `ê lá em casa - cover 1`    |
| `people/p1`–`p9`      | `image 28`–`34`, `36`, `37` |
| `stories/story-1`–`3` | `1.1`, `1.2`, `1.3`         |

`people/p8` and `p9` never appear in the initial markup — they enter the DOM
only through the face-rotation timer in `app.js`, which cycles the pool
`p1`–`p9`.

The two `mark-trackstar*.svg` logos are text, so those came through the design
project's file API complete and are the genuine assets.

Note for future syncs: that API caps reads at 256 KiB of base64, and every PNG
in the project is larger than that, so fetching artwork through it returns
truncated data (8–44% of each image's scanlines). Artwork has to come from an
export instead.
