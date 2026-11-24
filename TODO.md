# TODO

From the site audits of 2–4 September 2026. Everything here was measured rather
than guessed; the evidence is quoted so nobody has to take it on trust or
re-derive it.

One item is waiting on a reply from someone else, two are ours to do, and the
rest are closed records kept so the same ground is not covered twice.

The campaign page is not waiting on anything. The objection goes to
`Marc.Davis@islington.gov.uk`, copied to the planning inbox, three councillors
and `tra@percivalestate.com`; the register link points at the application
itself. All of it is set in `assets/js/objection.js`, and what the application
actually says is recorded below.

Fixed items are not listed. `git log` has them, one commit each, with the
reasoning in the message.

---

## Waiting on someone else

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

### Two questions left for Islington's Fire Safety Team

Both come out of the assessments they sent on 4 September 2026, and the
evidence for both is in the record further down.

- Was action **0043993** completed — "Inspect front entrance door to ensure it
  provides 30 minutes' fire resistance" on Grimthorpe House 1–48, due
  26/09/2024, still carried as OPEN in the September 2025 report?
- Why is **Partridge Court's** suggested review 06/09/2028, four years after its
  audit, when the team gave the medium-rise cycle as two years and the other two
  medium-rise blocks are on two?

Neither is urgent. Both are one sentence, and nobody has asked yet, so this is
not waiting on a reply.

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

## Fire risk assessments, answered

**Closed 4 September 2026.** Ben Cockle of Islington's Fire Safety Team replied
to the 4 September email and attached four assessments: Grimthorpe House 1–48,
Crayle House, Cyrus House and Partridge Court. The three blocks that were
missing from the published list do have assessments, and the one that led the
enquiry has been redone.

| Block | Audited | Suggested review | Overall risk |
| --- | --- | --- | --- |
| Grimthorpe House 1–48 | **15/09/2025** | 14/09/2026 | Tolerable |
| Cyrus House | 17/09/2025 | 17/09/2027 | Tolerable |
| Crayle House | 04/12/2024 | 03/12/2026 | Tolerable |
| Partridge Court | 04/09/2024 | **06/09/2028** | Tolerable |

Grimthorpe 1–48 was the one to lead on and it is the one that moved: it was
audited 09/09/2020, rated **Moderate**, with the Suggested Review field printed
blank. It is now a 2025 assessment, rated Tolerable, with a review date on it.
That closes the substance of the enquiry.

He also gave the reassessment cycle: higher-risk buildings such as Grimthorpe
every 12 months, medium-rise such as Crayle, Cyrus and Partridge every 2 years.
The dates above match that for three blocks and not for the fourth — **Partridge
Court's suggested review is four years out, not two.** Either the document is
wrong or the cycle is not being applied to that block, and it is worth one
sentence to ask which.

Outstanding actions, from each report's own "Previous O/S Actions (as of report
generation date)" field rather than by counting the word OPEN, which is what
miscounted the 2021 set:

- Crayle, Cyrus and Partridge: **None**.
- Grimthorpe 1–48 carries one over, ref 0043993 — "Inspect front entrance door
  to ensure it provides 30 minutes' fire resistance", due **26/09/2024**,
  responsible Fire Door Inspection Team, status OPEN. Due date passed. Also ref
  0045518, floor identification and flat indicator signage under Regulation 8 of
  the Fire Safety (England) Regulations 2022.
- New actions raised in the 2025/24 reports carry completion dates of 18/03/2026
  (Grimthorpe, two), 04/12/2025 (Crayle, three) and 19/03/2026 and 19/09/2026
  (Cyrus, three). All but the last have passed.

The same caveat as before applies and is the reason none of this is on the
website as a complaint: OPEN is the status as at report generation, so it is not
evidence the work is still outstanding. It is a reason to ask.

**Still to ask, if anyone picks this up:** whether the fire door action 0043993
was completed, and why Partridge Court's review is set four years out.

**He could not place the published list, and it exists.** "I am unsure I know of
this FRA list that you speak of. Is it on the LBI website?" It is:
`islington.gov.uk/housing/fire-safety-in-islington/fire-risk-assessments/fire-risk-assessment-list`,
checked again 4 September 2026 and returning 200 with Grimthorpe and Tompion
still on it. He is right that it is out of date — every document on it is from
2021 — and right that it is no use for Crayle, Cyrus or Partridge, which are not
on it at all. Worth telling him where it is, because residents will keep finding
it.

The high-rise route has moved to Twinnedit under the Building Safety Act 2022,
and he says that link "is not currently operational". So for the moment the
email address is the only working route for every block on this estate, which is
what the Safety panel now says.

---

## The P2026/1577/FUL application, as submitted

Read 4 September 2026 from the eight documents on the register. Recorded so
that the campaign copy can be checked against it without extracting them again,
and because the objection residents send quotes it.

**What is proposed.** Change of use of Tompion Community Hall from community use
(Class F1) to offices (Class E(g)(i)) for occupation by Islington Council as an
operational base for its **Parking Service** — "primarily office-based and
operational in nature, with no public-facing community function". Single storey,
208 m². Applicant Islington Council; Planning Portal ref PP-14997012; works
expected 08/2026 to 07/2027. Register id 537571, which is what the direct link
uses and which bears no relation to the reference.

**The dates, from the Council's own Community Needs Assessment and the
Existing Use answer on the form.** These are what the objection rests on, and
all of them are the applicant's own account:

| | |
| --- | --- |
| Leased from the Guinness Trust to Islington for community use | 2009 |
| Managed for community use by Community Partnerships | until 2019 |
| Closed for refurbishment works; end of use given on the form as | **02/06/2019** |
| Used temporarily for the Covid vaccination programme | 2020–21 |
| Council decides not to recommission it as a community centre | 2021 |
| Used by **Council Estate Services as an office base** | 2021/22 – **Nov 2024** |
| Declared surplus to Housing Revenue Account requirements | July 2025 |
| Lease runs until | at least 2034 |

Two things in that table do the work. The Community Hall "has not been available for
community bookings" because the Council closed it and then decided not to
reopen it — so six years of no bookings is a consequence of the Council's own
decisions, not evidence of no demand. And the building has been genuinely empty
only since November 2024, because the Council was using it as an office itself
for the three years before that.

The CNA also records, and then sets aside, "some interest from a local resident
to return the site to community use", and lists seven alternative venues at 5–15
minutes' walk. The Community Hall has continued in use as a polling station throughout.

**That local resident is a member of the association**, confirmed 4 September
2026, which is why the page can say "that was one of us" rather than leaving it
as an anonymous line in somebody else's report.

**The office use is the sharpest point in the file, and it is left as a question
on purpose.** Put two of the applicant's own statements side by side:

- on the lease — "The lease restrictions limit permitted use to Class F1
  (non-residential institutional) unless planning consent is obtained for
  Class E."
- on the history — "From 2021/22, the premise was used by Council Estate
  Services as an office base … Estate Services vacated the space in November
  2024."

So the Council occupied the Community Hall as offices for about three years and
is only now applying for the Class E consent that its own document says office
use requires. Had that consent existed, this application would be unnecessary.

The page and the letter both stop at asking the Council to explain what
permission was in place, rather than asserting a breach, and that is deliberate
rather than timid. A permitted development right, a temporary right, or an
argument that the use was ancillary to the F1 use would each be an answer, and
none can be ruled out from these documents alone. Several hundred residents
asserting an unlawful use they cannot then evidence is worth less than the same
number asking a question the Council has to answer on the record, and an
objection that overreaches is one an officer can discount. If somebody
establishes the position properly, the wording can harden.

Note also that the *reason* Estate Services left in November 2024 appears
nowhere in the documents. The sequence is suggestive and the page sets it out;
the motive is not stated in the file and should not be asserted as though it
were.

The fifteen-minute walk is not the argument, and was wrong as well as weak:
some of the listed alternatives are closer than that. The point is that a hall
on the estate is the one residents actually turn up to, and that booking
somebody else's hall means their rules, their times and their priorities.

**The address is not consistent within the application.** Four documents give
four combinations:

| Where | Address given |
| --- | --- |
| Application form, Site Location fields | 42 Percival Street, London **EC1V 0EB** |
| Location Plan | 42 Percival Street, London **EC1V 0EB** |
| Application form, Description | 42 Percival Street, London EC1V 0HX |
| Application form, Existing Use answer | **40** Percival Street, EC1V 0EB |
| Cover letter | 42 Percival Street, London EC1V 0HX |
| Community Needs Assessment | 42 on one page, 40 on another, EC1V 0EB |

The Site Location block and the Location Plan agree, and those are the fields
the register indexes, so **42 Percival Street, London EC1V 0EB** is what the
objection quotes. Do not "correct" it to the estate's own 40 Percival Street
again: that was in the generated letter until the documents were read.

**The sign on the building itself says 40.** Legible in the photograph taken on
9 May 2025 and now on the campaign page: a plaque beside the gate reading
"Tompion Centre / 40 Percival Street". So the number the building wears is a
fifth data point, and it agrees with the Existing Use answer and with the
estate's own address rather than with the field the application is registered
under. The objection still quotes 42, because that is what the register
indexes and the reference makes it unambiguous either way — but if anyone ever
needs to argue the point, the sign is in the picture.

The lease term is inconsistent too — the form says 35 years from 2009, the CNA
says 25 years and separately "until 2034". 2009 + 25 = 2034, so the CNA is
self-consistent and the form is the odd one out. The page says "until at least
2034", which both support.

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
