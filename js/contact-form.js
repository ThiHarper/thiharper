// Adapts the shared contact form to the selected service: swaps the hero
// heading and date label, shows the guest/card-count row only for services
// that involve counting cards, hides the date row for services with no
// fixed date to give, and shows a service-specific message hint when it
// applies (e.g. a pumpkin order has no guest count, but does need a
// quantity/text hint). Also reads a ?service= URL param (general inquiry
// CTAs, see aServiceParams) or a ?item= URL param (product "Order" buttons
// on services.html, see aItemParams) so a CTA can land here with the right
// service preselected — add an entry to the matching map for a new CTA.
(function () {
  var oServiceSelect = document.getElementById('service');
  var oHeroHeading = document.getElementById('heroHeading');
  var oDateRow = document.getElementById('dateRow');
  var oDateLabel = document.getElementById('dateLabel');
  var oGuestRow = document.getElementById('guestCountRow');
  var oMessageHint = document.getElementById('messageHint');

  if (!oServiceSelect || !oHeroHeading || !oDateRow || !oDateLabel || !oGuestRow || !oMessageHint) {
    return;
  }

  // Per-service config — every field is explicit per service rather than
  // derived, so adding a new service can't accidentally inherit the wrong
  // heading/date label from a generic "is this an event" guess. The guest
  // /card-count row defaults to hidden — only services that involve
  // counting cards (place cards, escort cards) turn it back on. The date
  // row defaults to shown — only services with no fixed date to give
  // (ready-made keepsakes, or "not sure yet") hide it.
  var oDefaultConfig = {
    heading: "Let's talk about your project",
    dateLabel: 'Date',
    hideGuestCount: true,
    hideDate: false,
    messageHint: ''
  };
  var oServiceConfig = {
    'Escort Cards': {
      heading: "Let's talk about your event",
      dateLabel: 'Event date',
      hideGuestCount: false
    },
    'Custom Pumpkin': {
      heading: "Let's talk about your pumpkin order",
      dateLabel: 'Pickup date',
      messageHint: "Let me know how many pumpkins you'd like and what text or design you'd like on each (e.g. a family name, a phrase, or your own idea)"
    },
    'Place Cards': {
      heading: "Let's talk about your event",
      dateLabel: 'Event date',
      hideGuestCount: false
    },
    'Clear Round Acrylic Ornament': { heading: 'Order Your Custom Keepsake', hideDate: true },
    'Teacher Jute Bag': { heading: 'Order Your Custom Keepsake', hideDate: true },
    'White Ball Ornament': { heading: 'Order Your Custom Keepsake', hideDate: true },
    'Not sure yet': { hideDate: true }
  };

  // Maps a short ?service= URL value to the <select> option's real value.
  // Add an entry here whenever a new general-inquiry CTA links in with
  // ?service=<slug>.
  var aServiceParams = {
    pumpkin: 'Custom Pumpkin',
    'escort-cards': 'Escort Cards',
    'place-cards': 'Place Cards'
  };

  // Maps a short ?item= URL value (from a product "Order" button on
  // services.html) to the <select> option's real value. Landing via ?item=
  // always shows the "Order Your Custom Keepsake" heading (see below),
  // even when the mapped value is shared with a ?service= entry point
  // (e.g. fall-pumpkin reuses the "Custom Pumpkin" option) that has its
  // own, different heading for a general inquiry.
  var aItemParams = {
    'fall-pumpkin': 'Custom Pumpkin',
    'white-ball-ornament': 'White Ball Ornament',
    'acrylic-ornament': 'Clear Round Acrylic Ornament',
    'teacher-bag': 'Teacher Jute Bag'
  };

  function applyServiceFields() {
    var oConfig = Object.assign({}, oDefaultConfig, oServiceConfig[oServiceSelect.value]);
    oHeroHeading.textContent = oConfig.heading;
    oDateLabel.textContent = oConfig.dateLabel;
    oDateRow.hidden = oConfig.hideDate;
    oGuestRow.hidden = oConfig.hideGuestCount;
    oMessageHint.hidden = !oConfig.messageHint;
    oMessageHint.textContent = oConfig.messageHint;
  }

  oServiceSelect.addEventListener('change', applyServiceFields);

  var oParams = new URLSearchParams(window.location.search);
  var sMappedItem = aItemParams[oParams.get('item')];
  var sMappedService = aServiceParams[oParams.get('service')];
  if (sMappedItem) {
    oServiceSelect.value = sMappedItem;
  } else if (sMappedService) {
    oServiceSelect.value = sMappedService;
  }

  applyServiceFields();

  if (sMappedItem) {
    oHeroHeading.textContent = 'Order Your Custom Keepsake';
  }
})();

// Submits the contact form via fetch instead of a full-page redirect to
// Formspree. This avoids the back-forward cache leaving stale filled-in
// values when a visitor clicks "Go back" from the Formspree thanks page.
(function () {
  var oForm = document.getElementById('contactForm');
  var oStatus = document.getElementById('formStatus');

  if (!oForm || !oStatus) {
    return;
  }

  var oSubmitBtn = oForm.querySelector('button[type="submit"]');
  var sSubmitLabel = oSubmitBtn.textContent;
  var aRequiredFields = oForm.querySelectorAll('[required]');

  function updateSubmitState() {
    oSubmitBtn.disabled = !oForm.checkValidity();
  }

  Array.prototype.forEach.call(aRequiredFields, function (oField) {
    oField.addEventListener('input', updateSubmitState);
    oField.addEventListener('change', updateSubmitState);
  });

  updateSubmitState();

  function showStatus(sMessage, bIsError) {
    oStatus.textContent = sMessage;
    oStatus.classList.toggle('form-status-error', bIsError);
    oStatus.hidden = false;
    oStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    oStatus.focus();
  }

  oForm.addEventListener('submit', function (oEvent) {
    oEvent.preventDefault();

    oSubmitBtn.disabled = true;
    oSubmitBtn.textContent = 'Sending…';
    oStatus.hidden = true;

    fetch(oForm.action, {
      method: 'POST',
      body: new FormData(oForm),
      headers: { Accept: 'application/json' }
    }).then(function (oResponse) {
      if (oResponse.ok) {
        oForm.reset();
        showStatus("Thanks! Your message has been sent — I'll be in touch within 1–2 business days.", false);
      } else {
        showStatus('Something went wrong sending your message. Please try again or email me directly.', true);
      }
    }).catch(function () {
      showStatus('Something went wrong sending your message. Please try again or email me directly.', true);
    }).finally(function () {
      oSubmitBtn.textContent = sSubmitLabel;
      updateSubmitState();
    });
  });
})();
