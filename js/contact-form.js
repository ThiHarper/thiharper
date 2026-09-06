// Adapts the shared contact form to the selected service: swaps the date
// field's label and hides the guest-count row when it doesn't apply
// (e.g. a pumpkin order has no guest count). Also reads ?service=pumpkin
// from the URL so a CTA can land here with the right service preselected.
(function () {
  var oServiceSelect = document.getElementById('service');
  var oDateLabel = document.getElementById('dateLabel');
  var oGuestRow = document.getElementById('guestCountRow');

  if (!oServiceSelect || !oDateLabel || !oGuestRow) {
    return;
  }

  var sPumpkinService = 'Custom Pumpkin';

  function applyServiceFields() {
    var bIsPumpkin = oServiceSelect.value === sPumpkinService;
    oDateLabel.textContent = bIsPumpkin ? 'Pickup date' : 'Event date';
    oGuestRow.hidden = bIsPumpkin;
  }

  oServiceSelect.addEventListener('change', applyServiceFields);

  var oParams = new URLSearchParams(window.location.search);
  if (oParams.get('service') === 'pumpkin') {
    oServiceSelect.value = sPumpkinService;
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
