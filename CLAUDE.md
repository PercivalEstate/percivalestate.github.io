# Notes for Claude

Open work is in [TODO.md](TODO.md). Read it before proposing anything — several
items there were investigated in depth and the reasoning is recorded so it does
not have to be redone.

## What this is

A one-page static site for a residents' association, served by GitHub Pages from
`main` at percivalestate.com. Pushing to `main` deploys. There is no build step:
`assets/css/main.css` is the file that ships, not a compiled artefact.

The audience is residents of a council estate, many reading on a phone, some on
mobile data. Page weight and mobile behaviour matter more here than they would on
a marketing site, and the content includes fire safety and insurance information
that people may act on — so accuracy in those sections is not cosmetic.

## Line endings

Three files are **CRLF throughout**: `index.html`, `assets/js/main.js` and
`assets/js/slideshow.js`. Everything else is LF, including
`assets/js/consent.js` — so this is per-file, not per-directory. Check before
editing rather than trusting the rule:

```
python3 -c "b=open('FILE','rb').read(); print(b.count(b'\r\n'), b.count(b'\n')-b.count(b'\r\n'))"
```

A scripted edit that reads and rewrites one of the CRLF files with default
newline handling will flatten it to LF and turn a one-line change into a
whole-file diff. Converting `consent.js` the other way does the same damage.
Edit as bytes, or read and write with the newline explicitly preserved:

```python
b = open('index.html', 'rb').read()
open('index.html', 'wb').write(b.replace(old, new))   # old/new contain \r\n
```

## No JavaScript libraries

`assets/js/` is first-party only. jQuery was removed once `main.js` no longer
needed it, and `browser.min.js`, `breakpoints.min.js` and `util.js` were removed
because nothing called them. Do not reintroduce a library without a reason that
survives the question "what does this do that the DOM does not".

`main.js` drives the panels: articles live in `#main`, are `display: none` until
opened, and are opened by fragment. Images and Airtable embeds inside them carry
`data-src` and are only fetched when their panel is shown.

## Verifying changes

The useful loop is a local server plus headless Chrome over the DevTools
protocol. Screenshots and DOM probes have caught things that reading the diff did
not — including a focus fix that looked right and never fired, and a tap target
that was covered on a common phone size.

```
python3 -m http.server 8765 --bind 127.0.0.1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --remote-debugging-port=9222 --user-data-dir=/tmp/prof about:blank
```

Three things that will otherwise waste a session:

- **Disable the HTTP cache** (`Network.setCacheDisabled`) and reload with
  `ignoreCache`. Chrome will happily serve the old `index.html` and a
  before/after comparison will show no difference because both sides are the
  same cached page.
- **Emulate `pointer: coarse`** for anything touch-related
  (`Emulation.setTouchEmulationEnabled` plus `Emulation.setEmulatedMedia`).
  Without it the cookie banner measures 88px instead of the 139px it occupies on
  a phone, and touch-target problems disappear from the numbers.
- **Freeze animation before screenshotting.** The register button glows on a
  loop and the slideshow backdrop loads in a nondeterministic order, so two
  captures of an unchanged page will differ. Hide `#bg` and set
  `animation: none` before comparing.

When comparing screenshots, check the harness can detect a change at all —
perturb something by a pixel and confirm the diff is non-zero — before trusting a
zero-diff result.

## Commits

One change per commit, and the message says why rather than what. Several
commits record a measurement or a quotation that justified the change; keep that
habit, because it is what stopped the same questions being reopened.
