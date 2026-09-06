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

  oForm.addEventListener('submit', function (oEvent) {
    oEvent.preventDefault();

    oSubmitBtn.disabled = true;
    oStatus.hidden = true;
    oStatus.classList.remove('form-status-error');

    fetch(oForm.action, {
      method: 'POST',
      body: new FormData(oForm),
      headers: { Accept: 'application/json' }
    }).then(function (oResponse) {
      if (oResponse.ok) {
        oForm.reset();
        oStatus.textContent = "Thanks! Your message has been sent — I'll be in touch within 1–2 business days.";
        oStatus.hidden = false;
      } else {
        oStatus.textContent = 'Something went wrong sending your message. Please try again or email me directly.';
        oStatus.classList.add('form-status-error');
        oStatus.hidden = false;
      }
    }).catch(function () {
      oStatus.textContent = 'Something went wrong sending your message. Please try again or email me directly.';
      oStatus.classList.add('form-status-error');
      oStatus.hidden = false;
    }).finally(function () {
      oSubmitBtn.disabled = false;
    });
  });
})();
