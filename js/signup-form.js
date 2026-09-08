// Submits the "get notified" email signup on services.html via fetch
// instead of a full-page redirect to Formspree, matching contact-form.js's
// submit behavior.
(function () {
  var oForm = document.getElementById('signupForm');
  var oStatus = document.getElementById('signupStatus');

  if (!oForm || !oStatus) {
    return;
  }

  var oSubmitBtn = oForm.querySelector('button[type="submit"]');
  var sSubmitLabel = oSubmitBtn.textContent;

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
    oSubmitBtn.textContent = 'Signing up…';
    oStatus.hidden = true;

    fetch(oForm.action, {
      method: 'POST',
      body: new FormData(oForm),
      headers: { Accept: 'application/json' }
    }).then(function (oResponse) {
      if (oResponse.ok) {
        oForm.reset();
        showStatus("Thanks for signing up! I'll keep you posted on new services.", false);
      } else {
        showStatus('Something went wrong signing you up. Please try again.', true);
      }
    }).catch(function () {
      showStatus('Something went wrong signing you up. Please try again.', true);
    }).finally(function () {
      oSubmitBtn.textContent = sSubmitLabel;
      oSubmitBtn.disabled = false;
    });
  });
})();
