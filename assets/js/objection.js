/* Objection generator for planning application P2026/1577/FUL.

   Everything this file does happens in the visitor's own browser. It makes no
   network request of any kind: nothing is posted, no fetch, no XHR, no beacon,
   no image ping. The name, address, building, uses and personal comment a
   resident types are read from the DOM, assembled into a letter, and handed
   either to the clipboard or to the visitor's own mail client through a
   mailto: URI. The Percival Estate Community never receives them, which is
   what lets the page say so on its face.

   The analytics calls below are the one exception, and they are deliberately
   built so that they cannot carry anything: each one sends a bare event name
   and no parameters at all. See track() for the reasoning. */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     CONFIGURATION -- the two values that have to be filled in by hand
     --------------------------------------------------------------------- */

  /* Who the objection is addressed to, and who is copied in.

     Confirmed by the association on 4 September 2026 rather than inferred from
     Islington's website, which only ever names planning@islington.gov.uk for
     *viewing* comments already made. Change these and the page follows: the
     recipients are read out on screen from these constants rather than being
     written into the markup, so there is one place to edit and nothing to keep
     in step.

     tra@percivalestate.com is on the copy list at the association's request, so
     that it can count how many residents have objected. That means the
     association does receive the objection itself -- by email, from the
     resident, not from this page -- and the page says so plainly next to the
     button rather than leaving somebody to notice it in their own sent items.
     Nothing stops a resident deleting the address before they send. */
  var PLANNING_OBJECTION_EMAIL = 'Marc.Davis@islington.gov.uk';

  var PLANNING_OBJECTION_CC = [
    'planning@islington.gov.uk',
    'steven.caplan@islington.gov.uk',
    'martin.klute@islington.gov.uk',
    'Kane.emerson@Islington.gov.uk',
    'tra@percivalestate.com'
  ];

  /* Where "Submit on Islington Council website" points.

     The application itself, not the search page. The register is an Angular
     application that builds its own routes at runtime, so this could not be
     constructed from the reference and had to be copied out of a browser
     once; 537571 is the register's own id for P2026/1577/FUL and has nothing
     to do with the reference. Checked: it answers 200. */
  var PLANNING_APPLICATION_URL =
    'https://planning.agileapplications.co.uk/islington/application-details/537571';

  var PLANNING_APPLICATION_REFERENCE = 'P2026/1577/FUL';

  /* The site address as the application form's own Site Location fields give
     it, and as the Location Plan repeats: "Tompion Community Centre, 42,
     Percival Street, London, EC1V 0EB".

     Worth pinning down, because the application is not consistent with
     itself. Its description says EC1V 0HX, its Existing Use answer says 40
     Percival Street, the cover letter says 42 Percival Street EC1V 0HX and
     the Community Needs Assessment uses 42 and 40 on different pages. The
     Site Location block and the Location Plan agree with each other and are
     the fields the register indexes, so they are the ones to quote. */
  var HALL_ADDRESS = '42 Percival Street, London EC1V 0EB';

  var OBJECTION_SUBJECT =
    'Objection to ' + PLANNING_APPLICATION_REFERENCE + ' - Tompion Community Hall';

  /* Long enough for a considered paragraph or two, short enough that the
     mailto URI stays inside what mail clients handle comfortably. */
  var COMMENT_MAX_LENGTH = 1000;

  /* Where a mailto URI is long enough that some clients shorten it without
     saying so. Measured rather than guessed, and re-measured every time the
     letter changed: with the recipients, the shared case and the shortest
     possible answers it encodes to 2,243 characters, and with every field at
     its limit, all eight uses and the full 1,000-character comment, to 3,905.

     So a substantive objection is already past the 2,048 characters that
     Windows mailto handlers were once held to, and no threshold can fix that
     -- which is why the note beside the button tells everybody to check the
     whole letter is there before they press Send, rather than only the people
     a warning happens to catch. 3,200 is set where the warning still says
     something: it appears once a resident has written a few hundred words of
     their own, which is exactly when there is most to lose. */
  var MAILTO_WARN_LENGTH = 3200;

  /* ---------------------------------------------------------------------
     Wording
     --------------------------------------------------------------------- */

  /* How each checkbox reads inside a sentence, which is not how it reads as a
     label above a tick box. */
  var USE_PHRASES = {
    meetings: "residents' meetings",
    events: 'community events',
    social: 'social activities',
    children: "children's and family activities",
    older: 'activities for older residents',
    classes: 'classes or workshops',
    support: 'local support services',
    other: 'other community activities'
  };

  /* The blocks of the estate, in the order they appear in the select. */
  var ESTATE_BUILDINGS = {
    grimthorpe: 'Grimthorpe House',
    crayle: 'Crayle House',
    partridge: 'Partridge Court',
    tompion: 'Tompion House',
    earnshaw: 'Earnshaw House',
    cyrus: 'Cyrus House'
  };

  /* ---------------------------------------------------------------------
     Small helpers
     --------------------------------------------------------------------- */

  function $(id) {
    return document.getElementById(id);
  }

  /* Analytics, and the shape of it matters more than the fact of it.

     gtag is called with an event name and nothing else. There is no second
     argument, so there is no parameter object into which a field value could
     ever be added by accident, and no code path here reads a form value on
     its way to this function. GA4 adds its own page and device context, as it
     does for every pageview on the site already; it never sees what was
     typed.

     Guarded because the campaign page is perfectly usable with analytics
     blocked, declined, or simply not loaded yet. */
  function track(eventName) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName);
  }

  /* "a", "a and b", "a, b and c" -- an Oxford-comma-free list, because the
     objection is a letter rather than a bibliography. */
  function sentenceList(items) {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];

    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }

  /* Trims, and collapses runs of blank lines, so that a comment pasted in
     from a notes app does not open a chasm in the middle of the letter. */
  function tidyComment(text) {
    return text
      .replace(/\r\n?/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+$/gm, '')
      .trim();
  }

  /* ---------------------------------------------------------------------
     The objection itself
     --------------------------------------------------------------------- */

  /* Builds the letter from the answers.

     The parts that change are the residency line, the sentence about how the
     resident would use the Hall, and the resident's own comment. Everything
     else is the association's shared case, which is the part that is the same
     for everybody because it is the same argument. Nothing here is invented
     about the resident: every personal sentence is assembled from something
     they actually answered, and there is no random phrasing, because an
     objection that varies for the sake of varying is exactly what a planning
     officer is entitled to discount. */
  function buildObjection(answers) {
    var paragraphs = [];

    paragraphs.push('Dear Planning Team,');

    paragraphs.push(
      'I am writing to object to planning application ' +
        PLANNING_APPLICATION_REFERENCE +
        ', the proposed change of use of Tompion Hall, ' +
        HALL_ADDRESS +
        ", from community use (Class F1) to offices for the Council's Parking Service (Class E(g))."
    );

    /* Residency. The required question governs, so an answer of "no" is never
       overridden by a block picked from the optional list below it. */
    if (answers.onEstate && answers.building) {
      paragraphs.push(
        'I am a resident of ' + answers.building + ', on the Percival Estate.'
      );
    } else if (answers.onEstate) {
      paragraphs.push('I am a resident of the Percival Estate.');
    } else {
      paragraphs.push('I live locally, close to the Percival Estate.');
    }

    paragraphs.push(
      'I object to the permanent loss of Tompion Hall as a community facility.'
    );

    if (answers.uses.length > 0) {
      paragraphs.push(
        'If the Hall were available for community use, I would use it for ' +
          sentenceList(answers.uses) +
          '.'
      );
    }

    if (answers.comment) {
      paragraphs.push(answers.comment);
    }

    /* From here on, the association's shared case. Every factual claim in it
       is taken from the applicant's own submission, and attributed, so that a
       resident is not being asked to put their name to anything they cannot
       point at.

       Three paragraphs, not six. The campaign page makes six points and this
       letter deliberately carries the three that answer the application's own
       central argument; the rest are there on the page for anyone who wants to
       add them in their own words. Two reasons. Identical boilerplate is worth
       less to a planning officer the more of it there is, and length has a
       cost here that it does not have on a web page -- a mailto that runs long
       is one some mail clients quietly shorten. */
    paragraphs.push(
      "The Council's own Community Needs Assessment says the Hall closed in 2019 for refurbishment and has not been available for community bookings since. The absence of bookings follows from that closure, and is not evidence that residents do not want it."
    );

    paragraphs.push(
      'The same document records that the Council used the Hall as an office base for its own Estate Services team from 2021/22 until November 2024, so it has stood genuinely empty only since then.'
    );

    paragraphs.push(
      "Venues a five to fifteen minute walk away are welcome, but they are not equivalent to a hall on the estate itself, particularly for older residents and for families with young children. Tompion Hall is the only community facility on the Percival Estate, and the interest in reopening it that the Assessment itself notes is borne out by objections like this one."
    );

    paragraphs.push(
      answers.onEstate
        ? 'I believe Tompion Hall should remain available as a community facility for residents of the Percival Estate, and I ask Islington Council to refuse the proposed change of use.'
        : 'I believe Tompion Hall should remain available as a community facility for residents of the Percival Estate and the surrounding area, and I ask Islington Council to refuse the proposed change of use.'
    );

    paragraphs.push('Kind regards,');

    paragraphs.push(answers.name + '\n' + answers.address);

    return paragraphs.join('\n\n');
  }

  /* ---------------------------------------------------------------------
     Reading the form
     --------------------------------------------------------------------- */

  function readAnswers(form) {
    var buildingSelect = $('objection-building');
    var buildingValue = buildingSelect ? buildingSelect.value : '';

    var uses = [];
    Array.prototype.forEach.call(
      form.querySelectorAll('input[name="use"]:checked'),
      function (input) {
        var phrase = USE_PHRASES[input.value];
        if (phrase) uses.push(phrase);
      }
    );

    var estateInput = form.querySelector('input[name="on-estate"]:checked');

    return {
      name: $('objection-name').value.trim(),
      address: $('objection-address').value.trim(),
      onEstate: !!estateInput && estateInput.value === 'yes',
      building: ESTATE_BUILDINGS[buildingValue] || '',
      uses: uses,
      comment: tidyComment($('objection-comment').value)
    };
  }

  /* ---------------------------------------------------------------------
     Validation
     --------------------------------------------------------------------- */

  /* The form carries novalidate and this stands in for the browser's own
     bubbles, which cannot be styled, vanish on the next keystroke and are
     never announced twice. Errors are shown three ways -- in a summary that
     takes focus, beside the field itself, and through aria-invalid -- so none
     of them depends on the red. */
  function validate(form) {
    var errors = [];

    var name = $('objection-name');
    var address = $('objection-address');
    var estate = form.querySelector('input[name="on-estate"]:checked');

    if (name.value.trim() === '') {
      errors.push({ id: 'objection-name', message: 'Enter your full name.' });
    }

    if (address.value.trim() === '') {
      errors.push({
        id: 'objection-address',
        message: 'Enter your address or postcode.'
      });
    }

    if (!estate) {
      errors.push({
        id: 'objection-on-estate-yes',
        message: 'Choose whether you live on the Percival Estate.'
      });
    }

    return errors;
  }

  function clearErrors(form) {
    var summary = $('objection-errors');
    summary.hidden = true;
    summary.innerHTML = '';

    Array.prototype.forEach.call(
      form.querySelectorAll('.campaign-field-error'),
      function (el) {
        el.parentNode.removeChild(el);
      }
    );

    Array.prototype.forEach.call(
      form.querySelectorAll('.campaign-invalid'),
      function (el) {
        el.classList.remove('campaign-invalid');
      }
    );

    Array.prototype.forEach.call(
      form.querySelectorAll('[aria-invalid="true"]'),
      function (el) {
        el.removeAttribute('aria-invalid');
      }
    );
  }

  function showErrors(form, errors) {
    var summary = $('objection-errors');

    var heading = document.createElement('h3');
    heading.textContent =
      errors.length === 1
        ? 'There is a problem with 1 answer'
        : 'There is a problem with ' + errors.length + ' answers';

    var list = document.createElement('ul');

    errors.forEach(function (error) {
      var target = $(error.id);
      var item = document.createElement('li');
      var link = document.createElement('a');

      link.href = '#' + error.id;
      link.textContent = error.message;
      link.addEventListener('click', function (event) {
        event.preventDefault();
        target.focus();
      });

      item.appendChild(link);
      list.appendChild(item);

      target.setAttribute('aria-invalid', 'true');

      /* The message goes just above the control it belongs to, inside the
         same field wrapper, and starts with the word Error so that it reads
         as one whether or not the colour arrives. */
      var field = target.closest('.field') || target.closest('.campaign-fieldset');
      if (!field) return;

      field.classList.add('campaign-invalid');

      if (!field.querySelector('.campaign-field-error')) {
        var message = document.createElement('span');
        message.className = 'campaign-field-error';
        message.textContent = 'Error: ' + error.message;

        var label = field.querySelector('label, legend');
        if (label && label.nextSibling) {
          field.insertBefore(message, label.nextSibling);
        } else {
          field.insertBefore(message, field.firstChild);
        }
      }
    });

    summary.appendChild(heading);
    summary.appendChild(list);
    summary.hidden = false;
    summary.focus();
  }

  /* ---------------------------------------------------------------------
     mailto
     --------------------------------------------------------------------- */

  var hasPlanningEmail =
    typeof PLANNING_OBJECTION_EMAIL === 'string' &&
    PLANNING_OBJECTION_EMAIL.indexOf('@') > 0;

  /* Every address the objection reaches, in the order the header puts them.
     This is what the copy fallback hands over, because somebody without a mail
     client is building the whole email by hand and needs the copies as much as
     the addressee. */
  function allRecipients() {
    return [PLANNING_OBJECTION_EMAIL].concat(PLANNING_OBJECTION_CC).join(', ');
  }

  /* CRLF rather than bare newlines: RFC 5322 asks for it, Outlook on Windows
     needs it to keep the paragraphs apart, and every client that is happy
     with a bare newline is equally happy with this.

     encodeURIComponent, not encodeURI: it is the only one of the two that
     escapes &, ? and # -- the characters that would otherwise end the body
     early and drop the rest of the letter on the floor. It leaves the
     apostrophe alone, which is correct and which mail clients handle. */
  function mailtoUri(bodyText) {
    var body = bodyText.replace(/\r\n?/g, '\n').replace(/\n/g, '\r\n');

    /* An address needs no escaping beyond the @ that encodeURIComponent
       insists on, and mail clients read a cc list separated by commas. */
    var address = function (value) {
      return encodeURIComponent(value).replace(/%40/g, '@');
    };

    return (
      'mailto:' +
      address(PLANNING_OBJECTION_EMAIL) +
      '?cc=' +
      PLANNING_OBJECTION_CC.map(address).join(',') +
      '&subject=' +
      encodeURIComponent(OBJECTION_SUBJECT) +
      '&body=' +
      encodeURIComponent(body)
    );
  }

  /* ---------------------------------------------------------------------
     Clipboard
     --------------------------------------------------------------------- */

  /* navigator.clipboard needs a secure context and a permission that some
     browsers withhold, so the old selection-and-execCommand route is kept as
     the fallback. Both are entirely local. */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        return legacyCopy(text);
      });
    }

    return legacyCopy(text);
  }

  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var scratch = document.createElement('textarea');

      scratch.value = text;
      scratch.setAttribute('readonly', '');
      scratch.setAttribute('aria-hidden', 'true');
      scratch.style.position = 'fixed';
      scratch.style.top = '-1000px';
      scratch.style.opacity = '0';

      document.body.appendChild(scratch);
      scratch.select();

      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (e) {
        ok = false;
      }

      document.body.removeChild(scratch);

      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  /* ---------------------------------------------------------------------
     Wiring
     --------------------------------------------------------------------- */

  function init() {
    var form = $('objection-form');
    if (!form) return;

    var result = $('objection-result');
    var output = $('objection-output');
    var mailLink = $('objection-mail-link');
    var mailNote = $('objection-mail-note');
    var lengthWarning = $('objection-length-warning');
    var status = $('objection-status');
    var counter = $('objection-comment-counter');
    var comment = $('objection-comment');

    /* Somebody arriving here has already seen the campaign, so the home page
       has no reason to put the modal in front of them on their next visit. */
    try {
      window.localStorage.setItem('pec-campaign-notice', 'seen');
    } catch (e) {
      /* Storage is blocked; the modal will simply show again. */
    }

    /* Configuration that the markup cannot know about. */
    /* The register is linked from two places -- once where the application is
       explained and once among the ways to send an objection -- so the href
       and the tracking hang off an attribute rather than an id. The markup
       carries the same URL, so the links still work if this file does not
       run; this keeps them in step with the constant. */
    var portalLinks = document.querySelectorAll('[data-planning-portal]');
    Array.prototype.forEach.call(portalLinks, function (link) {
      link.href = PLANNING_APPLICATION_URL;
      link.addEventListener('click', function () {
        track('planning_portal_clicked');
      });
    });

    var emailAddressText = $('objection-email-address');
    if (emailAddressText && hasPlanningEmail) {
      emailAddressText.textContent = PLANNING_OBJECTION_EMAIL;
    }

    var emailCcText = $('objection-email-cc');
    if (emailCcText) {
      emailCcText.textContent = PLANNING_OBJECTION_CC.join(', ');
    }

    /* With no confirmed address there is no honest email button to offer, so
       the copy route and the council's own portal become the whole answer
       rather than a footnote to one. */
    var emailBlocks = document.querySelectorAll('[data-requires-email]');
    Array.prototype.forEach.call(emailBlocks, function (el) {
      el.hidden = !hasPlanningEmail;
    });

    var noEmailNotice = $('objection-no-email');
    if (noEmailNotice) noEmailNotice.hidden = hasPlanningEmail;

    /* ----- character counter ----- */

    function updateCounter() {
      var used = comment.value.length;
      counter.textContent =
        used + ' of ' + COMMENT_MAX_LENGTH + ' characters used';
    }

    comment.setAttribute('maxlength', String(COMMENT_MAX_LENGTH));
    comment.addEventListener('input', updateCounter);
    updateCounter();

    /* ----- objection_started, once ----- */

    var started = false;
    form.addEventListener(
      'input',
      function () {
        if (started) return;
        started = true;
        track('objection_started');
      },
      true
    );

    /* ----- keeping the mail link in step with the textarea ----- */

    /* The link's href is rebuilt from whatever is in the box at that moment,
       so an edit made after generating is the text that reaches the mail
       client. An <a href="mailto:"> rather than a scripted navigation on
       purpose: assigning location.href from a handler is what mobile popup
       blockers and in-app browsers refuse, and a plain link is not. The
       link carries target="_blank" so that following it cannot take the
       resident away from the letter they have just written; see the markup. */
    function syncMailLink() {
      if (!hasPlanningEmail) return;

      var uri = mailtoUri(output.value);
      mailLink.href = uri;
      lengthWarning.hidden = uri.length <= MAILTO_WARN_LENGTH;
    }

    output.addEventListener('input', syncMailLink);

    /* ----- generate ----- */

    form.addEventListener('submit', function (event) {
      /* Nothing is ever posted. The form element exists for the labelling,
         the keyboard behaviour and Enter-to-submit that come with it; it has
         no action, and this stops the submission regardless. */
      event.preventDefault();

      clearErrors(form);

      var errors = validate(form);
      if (errors.length > 0) {
        showErrors(form, errors);
        return;
      }

      output.value = buildObjection(readAnswers(form));
      syncMailLink();

      status.textContent = '';
      mailNote.hidden = true;
      result.hidden = false;

      track('objection_generated');

      /* Assigning to a textarea's value leaves the caret at the end, and
         focusing it then scrolls it there: measured at 390x844, the box
         opened 460px down a 943px letter, so the first thing a resident read
         was the middle of their own objection. Wind it back explicitly.

         Focus goes to the result container rather than into the textarea.
         Focusing the textarea would be a user gesture on a phone and would
         raise the soft keyboard over the very letter we have just asked
         somebody to read; the container is a tab stop away from it, and a
         screen reader lands on the "Your objection" heading instead. */
      output.setSelectionRange(0, 0);
      output.scrollTop = 0;

      result.scrollIntoView({ block: 'start' });
      result.focus();
    });

    /* ----- open the mail client ----- */

    if (mailLink) {
      mailLink.addEventListener('click', function () {
        track('objection_mailto_clicked');

        /* Deliberately does not say the objection has been sent, because
           clicking this has not sent anything: it has asked the device to
           open a mail client, which on a webmail-only phone may not happen
           at all. */
        mailNote.hidden = false;
      });
    }

    /* ----- copy ----- */

    function announce(message) {
      status.textContent = message;
    }

    var copyButton = $('objection-copy');
    copyButton.addEventListener('click', function () {
      copyText(output.value).then(
        function () {
          track('objection_copied');
          announce(
            'Objection copied. Paste it into a new email' +
              (hasPlanningEmail ? ' to ' + PLANNING_OBJECTION_EMAIL : '') +
              ', or into the council’s comment form.'
          );

        },
        function () {
          announce(
            'Your browser would not let us copy it. Select the text in the box above and copy it yourself.'
          );
        }
      );
    });

    var copyEmailButton = $('objection-copy-email');
    if (copyEmailButton) {
      copyEmailButton.addEventListener('click', function () {
        copyText(allRecipients()).then(
          function () {
            announce(
              'All ' +
                (PLANNING_OBJECTION_CC.length + 1) +
                ' addresses copied. Paste them into the To line of a new email.'
            );
          },
          function () {
            announce(
              'Your browser would not let us copy them. The addresses are ' +
                allRecipients() +
                '.'
            );
          }
        );
      });
    }

    /* ----- start again ----- */

    $('objection-restart').addEventListener('click', function () {
      form.reset();
      clearErrors(form);
      updateCounter();

      output.value = '';
      result.hidden = true;
      mailNote.hidden = true;
      if (lengthWarning) lengthWarning.hidden = true;
      announce('');

      form.scrollIntoView({ block: 'start' });
      $('objection-name').focus();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
