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

// Re-scroll to a #hash target after full load (images, web fonts) settles.
// Without this, a page arriving with a hash (e.g. a "Explore Keepsakes"
// link) can scroll to the target before fonts finish loading, then the
// resulting reflow leaves the target in the wrong spot with no retry.
(function () {
  if (!window.location.hash) {
    return;
  }

  window.addEventListener('load', function () {
    var oTarget = document.getElementById(window.location.hash.slice(1));
    if (oTarget) {
      oTarget.scrollIntoView();
    }
  });
})();
