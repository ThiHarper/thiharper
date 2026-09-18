// Shared across every mockup: intercepts clicks on anything marked
// .mock-inert (a button/link with nowhere real to go yet) and submits on
// any form marked .mock-inert-form, showing a small toast instead of doing
// nothing or silently reloading the page with a blank GET request.
(function () {
  var oToast = null;

  function ensureToast() {
    if (oToast) return oToast;
    oToast = document.createElement('div');
    oToast.className = 'mock-toast';
    document.body.appendChild(oToast);
    return oToast;
  }

  function showToast(sMessage) {
    var oEl = ensureToast();
    oEl.textContent = sMessage;
    oEl.classList.add('is-visible');
    clearTimeout(oEl._hideTimer);
    oEl._hideTimer = setTimeout(function () {
      oEl.classList.remove('is-visible');
    }, 2600);
  }

  document.addEventListener('click', function (oEvent) {
    var oTarget = oEvent.target.closest ? oEvent.target.closest('.mock-inert') : null;
    if (!oTarget) return;
    oEvent.preventDefault();
    showToast(oTarget.dataset.mockMessage || 'This becomes live when we launch!');
  });

  document.addEventListener('submit', function (oEvent) {
    var oForm = oEvent.target;
    if (oForm.matches && oForm.matches('.mock-inert-form')) {
      oEvent.preventDefault();
      showToast(oForm.dataset.mockMessage || 'This becomes live when we launch!');
    }
  });
})();
