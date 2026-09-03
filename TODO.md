# TODO

Open items from the site audits of 2 and 3 September 2026. Everything here was
measured rather than guessed; the evidence is quoted so nobody has to take it on
trust or re-derive it.

Fixed items are not listed. `git log` has them, one commit each, with the
reasoning in the message.

---

## Needs a person, not a change

### Confirm the Guinness Partnership link works

`index.html`, About panel — the words "The Guinness Partnership".

`https://www.guinnesspartnership.com/` returns a bare `403 Forbidden` from
`server: awselb/2.0` on every path tried, from this network, with an ordinary
Chrome user-agent and `navigator.webdriver` hidden. That is a rule at their load
balancer rejecting the network, not a reaction to how the request was made, so
it cannot be checked from here.

Almost certainly fine from a home connection — it is a large housing
association's public site and search engines index it. **Open it on a phone or
laptop.** If it 403s there too, point the link at their contact page or drop it.

### Ask Islington about the estate's fire risk assessments

Not a website change. Islington's published FRA list covers 133 assessments, and
only three of the six blocks appear:

| Block | On the published list |
| --- | --- |
| Grimthorpe House (1–48, 49–128) | yes |
| Tompion House (1–15 … 66–80) | yes |
| Earnshaw House | yes |
| Crayle House | **no** |
| Partridge Court | **no** |
| Cyrus House | **no** |

Residents of the three missing blocks have only the email route. The eight that
are published are 2021 assessments whose own review dates fell in 2022:

- Grimthorpe 49–128 — review due 16/03/2022
- Tompion 1–15 … 66–80 — review due 04/05/2022
- Earnshaw House — review due 16/03/2022

Worth putting to the Building Safety Team on FireSafety@islington.gov.uk.

### Check whether the buildings insurance document is still current

`index.html`, Safety panel — "buildings insurance" links
`documents/buildings-insurance-policy-2024-2025.pdf`.

It is the 2024–25 policy year and it is now late 2026, so it may be two renewals
behind. Leaseholders could be reading superseded cover on a page that presents it
as current. Either replace the file with the current policy or say which year the
one on the site covers.

---

## Page weight

The site has had several rounds of weight work and the JavaScript is now 26,929
bytes across three files, down from 128,693 across seven. Images are what is
left, and one of them dwarfs everything.

### The slideshow is 85% of the home page

| | Bytes |
| --- | ---: |
| Slideshow, 13 images | **1,939,360** |
| Everything else on first load | 341,771 |
| **Total** | **2,281,131** |

All thirteen are fetched on every visit. `slideshow.js` gates the reveal on the
first image, then `loadRest()` requests the other twelve. They are 1280px wide
WebP, 78KB–227KB each.

What makes this worth revisiting: `slideshow.css` renders `#bg` at
`opacity: 0.25`, behind a dark overlay, rotating every five seconds. Nearly two
megabytes of photography is being spent on a backdrop nobody can see clearly.

Options, roughly in order of return:

1. Re-encode at lower quality. At a quarter opacity behind an overlay, artefacts
   that would be obvious in a gallery are invisible.
2. Ship fewer. Thirteen at five seconds each is over a minute of rotation; most
   visits will not see them all.
3. Load the first few, and fetch the rest only if the visitor is still there.
4. Serve a narrower set to phones. `#bg div` is 110% of viewport width, so a
   375px phone needs ~826px at 2×, not 1280px.

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

## Broken link

### Tower Block UK reference 404s

`index.html`, About panel, in the list of history links.

`https://www.towerblock.eca.ed.ac.uk/development/percival-street` returns 404.
Their site is up (homepage 200) but that path is gone, and their own search at
`/search/site/percival` also 404s, so the replacement is not obvious. Either
find where the record moved or drop the entry.

---

## Smaller

### Document links do not say what they are or how big

Five of seven links to `documents/` give no indication of file type or size:

| Link text | File | Size | Says type? |
| --- | --- | ---: | --- |
| Tenants and Residents Association (TRA) | tra-handbook.pdf | **3.3 MB** | no |
| Constituting a TRA | tra-model-constitution.pdf | 70 KB | no |
| info pack | tra-info-pack.pdf | 303 KB | yes |
| PDF | conditions-of-tenancy.pdf | 1.3 MB | yes |
| buildings insurance | buildings-insurance-policy-2024-2025.pdf | **2.4 MB** | no |
| Protector Insurance | protector-insurance-leasehold-buildings-policy.pdf | 345 KB | no |
| First Notification of Loss | first-notification-of-loss.docx | 12 KB | no |

Two carry `aria-label="…, PDF"`, so the page is inconsistent as well as quiet
about it. Tapping a link that reads like a page and getting 3.3MB is a poor deal
on mobile data, and the `.docx` will download rather than open.

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
`404.html` and the `/register` redirect both work.
