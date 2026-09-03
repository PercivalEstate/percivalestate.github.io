# TODO

Open items from the site audits of 2 and 3 September 2026. Everything here was
measured rather than guessed; the evidence is quoted so nobody has to take it on
trust or re-derive it.

Fixed items are not listed. `git log` has them, one commit each, with the
reasoning in the message.

---

## Waiting on someone else

### Islington's reply about the estate's fire risk assessments

**Email sent to FireSafety@islington.gov.uk on 4 September 2026. Awaiting a
reply.** Not a website change either way; the evidence is kept below because a
chaser or a follow-up rests on it, and because a reply may only answer part of
it.

Islington's published FRA list covers 133 assessments, and only three of the six
blocks appear:

| Block | On the published list |
| --- | --- |
| Grimthorpe House (1–48, 49–128) | yes |
| Tompion House (1–15 … 66–80) | yes |
| Earnshaw House | yes |
| Crayle House | **no** |
| Partridge Court | **no** |
| Cyrus House | **no** |

Re-checked 3 September 2026 against the live list and the PDFs themselves: 133
assessments, eight for this estate, and Crayle, Partridge and Cyrus still absent
— the words do not appear on the page at all.

Residents of the three missing blocks have only the email route. The eight that
are published carry their own audit and suggested-review dates, all of which
have passed:

| Assessment | Audited | Suggested review | Overall risk |
| --- | --- | --- | --- |
| Earnshaw House | 16/03/2021 | 16/03/2022 | Tolerable |
| Grimthorpe 1–48 | **09/09/2020** | **blank** | **Moderate** |
| Grimthorpe 49–128 | 16/03/2021 | 16/03/2022 | Tolerable |
| Tompion 1–15 | 04/05/2021 | 04/05/2022 | Tolerable |
| Tompion 16–30 | 04/05/2021 | 04/05/2022 | Tolerable |
| Tompion 31–45 | 04/05/2021 | 04/05/2022 | Tolerable |
| Tompion 46–65 | 04/05/2021 | 04/05/2022 | Tolerable |
| Tompion 66–80 | 04/05/2021 | 04/05/2022 | Tolerable |

Grimthorpe 1–48 is the one to lead on. It is a year older than the rest, it is
the only block rated Moderate rather than Tolerable, and its "Suggested Review"
field is printed with nothing after it — the label is there and the date is
absent, which is in the document rather than an artefact of reading it.

Across the eight, 53 actions are listed and 24 are marked OPEN, 19 of those with
a due date that has now passed; the oldest two were due 09/03/2021. Careful how
that is used: OPEN is the status as at report generation in 2021, so it is not
evidence the work is still outstanding. The point is the opposite — there is no
later published assessment, so a resident cannot tell either way.

What was asked: whether assessments exist for Crayle, Partridge and Cyrus and
where to read them; when the estate is next due to be reassessed, Grimthorpe
1–48 especially; and the current status of the outstanding actions.

If nothing comes back, the Building Safety Team is the right desk and the three
missing blocks are the part with the least room for argument.

Extracted with macOS PDFKit via `osascript -l JavaScript` (no `pdftotext` or
`pypdf` on this machine, and the streams are compressed so `strings` finds
nothing). Two of the eight use a labelled field layout and six a tabular one,
which is why a naive grep for a status word miscounts them.

---

## Page weight

The site has had several rounds of weight work and the JavaScript is now 26,929
bytes across three files, down from 128,693 across seven. Images are what is
left, and the slideshow is still three quarters of a first load on its own.

### The slideshow is 76% of the home page

Measured 3 September 2026, file bytes, after the re-encode:

| | Bytes |
| --- | ---: |
| Slideshow, 13 images | **932,048** |
| Everything else on first load | 300,845 |
| **Total** | **1,232,893** |

All thirteen are still fetched on every visit. `slideshow.js` gates the reveal
on the first image and the webfont, then `loadRest()` requests the other twelve.
They are 1024px wide WebP at q45, 40KB–108KB each.

What keeps this open: `slideshow.css` renders `#bg` at `opacity: 0.25`, behind a
dark overlay, rotating every five seconds. Even re-encoded it is most of the
page, spent on a backdrop nobody can see clearly.

Re-encoding is done — 1280px q80 to 1024px q45, half the bytes, SSIM 0.955–0.992
composited the way the page draws it. What is left changes how many are fetched
rather than how big they are:

1. Ship fewer. Thirteen at five seconds each is over a minute of rotation; most
   visits will not see them all.
2. Load the first few, and fetch the rest only if the visitor is still there.
3. Serve a narrower set to phones. `#bg div` is 110% of viewport width, so a
   390px phone at 3× asks for 1287px but a 390px phone at 2× only 858px.

### The logo PNG is 78KB at 900×900

`images/percival-estate-logo-white-padding.png` is displayed at about 168px in
the header (10.5rem × 83%) and 8rem on `404.html`. A correctly sized copy, or an
SVG of a mark this simple, would be a fraction of it.

Note the history here: a previous commit removed a `favicon.svg` that was not a
vector at all, just a wrapped raster. If an SVG is made, make it a real one.

### `images/percival-estate-map-detailed.webp` is 307KB at 2600×1800

Lazy-loaded behind `data-src`, so only people who open the About panel pay for
it, which is why it is last here. It is displayed at panel width, well under
800px.

---

## Smaller

### The register button is still under the cookie banner at 375×568

Fixed for every size tested except an iPhone 5 / SE1 viewport, where the banner
is 128px and the hero cannot fit above it in 568px. The page scrolls, so the
button is reachable, but it is covered on arrival.

Fixing it means shrinking the logo or hero type at that height, which is a design
decision rather than a bug fix. Measured with `pointer: coarse` emulated —
without that the banner measures 88px instead of 139px and the problem hides.

### `sitemap.xml` `lastmod` goes stale

It is a hand-maintained date in a file nothing updates. Either remember to change
it with content edits, or drop the element — an inaccurate `lastmod` is worth
less than none.

### The 2020 cladding date rests on one source

`index.html`, About panel — "The new cladding went up in 2020".

Sotech Optima's case study, published July 2023, says "Three years on from
initial installation (which was completed in 2020)". Every other contractor page
on the job is undated: Rooff carries none, and A2O's Fact File lists sector,
status, value, scope and services but no programme.

The spring 2021 fit-out beside it is on much firmer ground — 41 of 43 Islington
building control records at 40 Percival Street fall in one week of March 2021.
If a Guinness newsletter or residents' notice dates the cladding, prefer it.

---

## Checked and clean, as of 3 September 2026

Recorded so the next audit need not repeat it: no missing `alt` text, no
untitled iframes, no links without an accessible name, no duplicate ids, no
heading-level jumps, every form control labelled except the deliberate honeypot,
no `target="_blank"` without `rel="noopener"`, zoom not disabled, `lang` set.
`404.html` and the `/register` redirect both work. All seven links to
`documents/` now carry type and size in their own link text, checked against the
files' actual byte counts.

Islington does not publish the full Conditions of Tenancy. Its
tenancy-conditions page links only an introductory tenancies factsheet, so the
2013 edition kept here is not a stale copy of something newer — there is nothing
to replace it with, and the page now says which edition it is. Do not file that
as an action again.

External links, swept 4 September 2026: 56 of them, 51 return 200. The five
that do not are bot blocks on sites that are plainly up and serving browsers —
three `met.police.uk` pages and `theundergroundmap.com` at 403, and
`facebook.com/PercivalEstate` at 400. Worth knowing before anyone reads a 403
here as a broken link; equally, `guinnesspartnership.com` looked like exactly
this and turned out to be genuinely unreachable, so a 403 is a reason to check
in a real browser rather than to assume either way.
