// Mobile nav toggle. Single-use, kept inline per project convention
// (only extract helpers that are reused across the codebase).
(function () {
  var oToggle = document.querySelector('.nav-toggle');
  var oNav = document.querySelector('.site-nav');

  if (!oToggle || !oNav) {
    return;
  }

  oToggle.addEventListener('click', function () {
    var bIsOpen = oNav.classList.toggle('is-open');
    oToggle.setAttribute('aria-expanded', bIsOpen ? 'true' : 'false');
  });
})();
