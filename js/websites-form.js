// Submits the Built by Thi intake form via fetch instead of a full-page
// redirect to Formspree, matching contact-form.js's pattern so a visitor
// clicking "Go back" from the Formspree thanks page never sees stale
// filled-in values.
(function () {
  var oForm = document.getElementById('websitesForm');
  var oStatus = document.getElementById('websitesFormStatus');

  if (!oForm || !oStatus) {
    return;
  }

  var oSubmitBtn = oForm.querySelector('button[type="submit"]');
  var sSubmitLabel = oSubmitBtn.textContent;
  var aRequiredFields = oForm.querySelectorAll('[required]');

  function updateSubmitState() {
    var bValid = oForm.checkValidity();
    oSubmitBtn.disabled = !bValid;
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
        showStatus("Thanks! I'll follow up with a free mockup within 1–2 business days.", false);
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
