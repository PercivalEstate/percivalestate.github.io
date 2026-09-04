# TODO

From the site audits of 2–4 September 2026. Everything here was measured rather
than guessed; the evidence is quoted so nobody has to take it on trust or
re-derive it.

Most of what is open is waiting on a reply from someone else. The one item that
is ours to do is the focus-ring gap in `main.css`, below. The two sections at
the end are closed records kept so the same ground is not covered twice.

The campaign page is not waiting on anything: the objection goes to
`Marc.Davis@islington.gov.uk`, copied to the planning inbox, three councillors
and `tra@percivalestate.com`, all confirmed by the association on 4 September
2026 and all set in `assets/js/objection.js`.

Fixed items are not listed. `git log` has them, one commit each, with the
reasoning in the message.

---

## Waiting on someone else

### A direct link to P2026/1577/FUL on the planning register

`PLANNING_APPLICATION_URL` in `assets/js/objection.js` currently points at
`https://planning.agileapplications.co.uk/islington/search-applications`, which
is real and current but is the search page rather than the application. The
register is an Angular app that builds its routes at runtime, so an
application's own address cannot be constructed from its reference — the same
thing that stopped the cladding-date search below. Open the application once,
check the address in the bar still works pasted fresh, and put it in the
constant; the wording on the page tells residents to search for the reference
either way, so it is an improvement rather than a blocker.

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

### The 2020 cladding completion date, waiting on Guinness

`index.html`, About panel — "The new cladding went up in 2020".

Much better bracketed than it was, but not independently confirmed. Islington's
own records now date everything either side of it:

- **30 January 2018** — Housing Scrutiny Committee. Guinness's own presentation
  says structure investigation works were "nearing completion", options for
  re-cladding "to be finalised in February", planning and building regulation
  submissions to follow, and "once submissions approved works commence".
  So nothing had started.
- **24 July 2018** — planning application **P2018/2521/FUL** registered,
  "Facade refurbishment works including replacement of the existing rainscreen
  cladding finishes", 40 Percival Street EC1V 0EB, Bunhill ward. Site notice
  2 August, consultation expiry 23 August.
- **24 October 2018** — approved with conditions, three-year consent period, so
  work had to begin by 24 October 2021.
- **March 2021** — 41 of 43 building control records at the address fall in one
  week, which is the fit-out.

A 2020 completion sits comfortably in that gap, and the page now states the
October 2018 consent because it is checkable. But the *year the cladding
finished* is still only Sotech Optima's case study of July 2023 saying "Three
years on from initial installation (which was completed in 2020)". Rooff carries
no date and A2O's page 403s to everything, like Guinness's own site.

**Guinness were asked on 4 September 2026. Awaiting a reply.** They own the
block, so they are the ones who can say when the work finished.

Failing that: a building control completion certificate for the facade works, or
a residents' notice from the time. The planning register is at
`planning.agileapplications.co.uk/islington` — an Angular app, so it needs a real
browser; its API rejects direct calls with "Client has not beeing selected".

---

## Open, and ours to fix

### Buttons on the home page have no focus indicator

`main.css` sets `outline: 0` on `input[type=submit]`, `input[type=reset]`,
`input[type=button]`, `button` and `.button` (line 1078) and puts nothing in its
place, so tabbing to **Send Message** or **Reset** on the contact form shows
nothing at all. Text fields are fine — they take a white `box-shadow` on focus
— and so are tick boxes, whose label `::before` takes one; it is buttons and
plain links that are bare. WCAG 2.4.7.

`/save-our-community-hall/` is almost entirely buttons, so it carries its own
fix in `campaign.css`, scoped to `.campaign-page`. Lifting those four lines into
`main.css` without the scope would fix the contact form too. It was left scoped
deliberately: it is a change to a shared file that nobody asked for, and it
belongs in its own commit rather than inside a campaign one.

Verified with a real Tab walk over both pages rather than by reading the CSS:
21 stops on the campaign page, every one showing an outline, a box-shadow or a
tick-box ring.

---

## Page weight, settled

Closed 4 September 2026. Nothing here needs doing; it is recorded so the next
audit does not reopen it.

| | Bytes |
| --- | ---: |
| What a visitor arrives with | **418,957** |
| Of which the slideshow, 3 images | 180,026 |
| Someone with `prefers-reduced-motion` | **299,369** |
| A visitor who stays past a minute | 1,170,979 |
| For comparison, when the audit opened | 2,281,131 |

Icons are 11,739 of that arrival figure across two files, having been 25,263.
All five icon files were 32-bit RGBA with an alpha channel no pixel used and
only 634–1,250 distinct colours, nearly all of them antialiasing between the
green and the white; they are now 8-bit palette PNGs. `favicon.ico` is left
alone: 15,086 bytes, but nothing fetches it now that `index.html` declares a
PNG icon, so it costs a visitor nothing and some old consumer may still probe
for it.

The slideshow stays at thirteen images: with fetching paced to the rotation the
other ten cost an arriving visitor nothing, so the count is a question about how
long the rotation should be, and thirteen is wanted.

Serving a narrower set to 2x phones was measured and rejected. Across nine
device profiles only 2x phones are over-served, by 114–320px; every 3x phone is
short by 164–395px, an iPad by 776px and a 1440 laptop by 2144px. Most of the
audience is already looking at an upscaled backdrop, which b33ef14 chose
knowingly because at `opacity: 0.25` behind an overlay it does not show. An
858px set would save 64,758 bytes of the 180,026 a 2x phone arrives with, and
cost a second set of thirteen files plus a second encoding step to keep in step
forever. Worth revisiting only if 2x phones turn out to be a large share of
visits. Note the backdrops are CSS `background-image` set from `slideshow.js`,
not `<img>`, so there is no `srcset` route — it would need `image-set()` or a
DPR check in the JS.

---

## Checked and clean, as of 4 September 2026

Recorded so the next audit need not repeat it: no missing `alt` text, no
untitled iframes, no links without an accessible name, no duplicate ids, no
heading-level jumps, every form control labelled except the deliberate honeypot,
no `target="_blank"` without `rel="noopener"`, zoom not disabled, `lang` set.
`404.html` and the `/register` redirect both work. All seven links to
`documents/` now carry type and size in their own link text, checked against the
files' actual byte counts.

The register button clears the cookie banner in portrait at every size tested
from 320×568 up, hit-tested at three points down the button rather than by
geometry alone. In landscape it sits below the fold — 391px down a 375px window
at 667×375 — which is ordinary scrolling, not a button that looks pressable and
is not, so it is left alone and the landscape rule in `main.css` is unchanged.
Screens shorter than about 520px in portrait (a 320×480 phone) are still
covered; nothing was done for those.

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
