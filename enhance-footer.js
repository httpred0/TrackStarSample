// Build-time footer enhancement, applied by build.js after the design document
// has been translated.
//
// The design's footer is a single horizontal row of plain text links. On phones
// it should read as a tapable menu: label on the left, chevron on the right,
// with hairline dividers. That needs real elements, so they are added here
// rather than faked with CSS pseudo-elements, which would not be selectable or
// exposed to assistive tech.
//
// The added elements are inert above the mobile breakpoint (see overrides.css),
// so the desktop footer renders exactly as the design specifies.
//
// Every replacement below asserts its expected hit count, so if the design
// document changes shape the build fails loudly instead of silently emitting a
// half-transformed footer.

const NAV_LABELS = ['Charts', 'Lists', 'Reviews', 'Podcast', 'Stories', 'Support'];

const CHEVRON =
  '<svg data-fnav-chevron viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M9 4.8 16.2 12 9 19.2"/></svg>';

module.exports = function enhanceFooter(markup) {
  const match = /<footer[\s\S]*<\/footer>/.exec(markup);
  if (!match) throw new Error('enhance-footer: no <footer> in the generated markup');
  let footer = match[0];

  const expect = (label, got, want) => {
    if (got !== want) {
      throw new Error(`enhance-footer: expected ${want} ${label}, found ${got}`);
    }
  };

  // Hooks for overrides.css to target, so the CSS does not depend on the
  // design's inline style strings staying byte-identical.
  let tagged = 0;
  footer = footer.replace(/<div (style="[^"]*--ts-fnavjust[^"]*")/g, (_, s) => {
    tagged++;
    return `<div data-fnav ${s}`;
  });
  expect('nav container', tagged, 1);

  tagged = 0;
  footer = footer.replace(/<div (style="[^"]*--ts-forder[^"]*")/g, (_, s) => {
    tagged++;
    return `<div data-fsocial ${s}`;
  });
  expect('social container', tagged, 1);

  tagged = 0;
  footer = footer.replace(/<div (style="[^"]*gap:1\.4em;flex-wrap:wrap[^"]*")/g, (_, s) => {
    tagged++;
    return `<div data-flegal ${s}`;
  });
  expect('legal containers', tagged, 2);

  // the row that holds both legal groups; on mobile the two groups are merged
  // into a single wrapping line, which needs a hook on their shared parent
  tagged = 0;
  footer = footer.replace(/<div (style="[^"]*gap:1\.1em 1\.6em[^"]*")/g, (_, s) => {
    tagged++;
    return `<div data-flegalrow ${s}`;
  });
  expect('legal row', tagged, 1);

  // label + trailing chevron for each menu entry
  let links = 0;
  footer = footer.replace(
    new RegExp(
      `(<a\\b[^>]*text-decoration:underline[^>]*>)(${NAV_LABELS.join('|')})(</a>)`,
      'g'
    ),
    (_, open, label, close) => {
      links++;
      return `${open}<span data-fnav-label>${label}</span>${CHEVRON}${close}`;
    }
  );
  expect('footer menu links', links, NAV_LABELS.length);

  return markup.replace(match[0], footer);
};
