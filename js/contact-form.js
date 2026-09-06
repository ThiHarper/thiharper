// Adapts the shared contact form to the selected service: swaps the hero
// heading and date label, hides the guest-count row, and shows a
// service-specific message hint when it applies (e.g. a pumpkin order has
// no guest count, but does need a quantity/text hint). Also reads a
// ?service= URL param so a CTA can land here with the right service
// preselected — see aServiceParams below to add another CTA's mapping.
(function () {
  var oServiceSelect = document.getElementById('service');
  var oHeroHeading = document.getElementById('heroHeading');
  var oDateLabel = document.getElementById('dateLabel');
  var oGuestRow = document.getElementById('guestCountRow');
  var oMessageHint = document.getElementById('messageHint');

  if (!oServiceSelect || !oHeroHeading || !oDateLabel || !oGuestRow || !oMessageHint) {
    return;
  }

  // Per-service config — every field is explicit per service rather than
  // derived, so adding a new service can't accidentally inherit the wrong
  // heading/date label from a generic "is this an event" guess.
  var oDefaultConfig = {
    heading: "Let's talk about your project",
    dateLabel: 'Date',
    hideGuestCount: false,
    messageHint: ''
  };
  var oServiceConfig = {
    'Escort Cards': {
      heading: "Let's talk about your event",
      dateLabel: 'Event date'
    },
    'Custom Pumpkin': {
      heading: "Let's talk about your pumpkin order",
      dateLabel: 'Pickup date',
      hideGuestCount: true,
      messageHint: "Let me know how many pumpkins you'd like and what text or design you'd like on each (e.g. a family name, a phrase, or your own idea)."
    }
  };

  // Maps a short ?service= URL value to the <select> option's real value.
  var aServiceParams = { pumpkin: 'Custom Pumpkin' };

  function applyServiceFields() {
    var oConfig = Object.assign({}, oDefaultConfig, oServiceConfig[oServiceSelect.value]);
    oHeroHeading.textContent = oConfig.heading;
    oDateLabel.textContent = oConfig.dateLabel;
    oGuestRow.hidden = oConfig.hideGuestCount;
    oMessageHint.hidden = !oConfig.messageHint;
    oMessageHint.textContent = oConfig.messageHint;
  }

  oServiceSelect.addEventListener('change', applyServiceFields);

  var oParams = new URLSearchParams(window.location.search);
  var sMappedService = aServiceParams[oParams.get('service')];
  if (sMappedService) {
    oServiceSelect.value = sMappedService;
  }

  applyServiceFields();
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
