// Lightweight passcode gate for this preview-only page. This is NOT real
// security — it's a static site with no server, so the protected markup
// still ships in this page's HTML and anyone opening dev tools could find
// it. The point is only to keep the page from rendering for a casual
// visitor who stumbles onto the URL, while staying easy for Thi to unlock
// from any of her own devices. Combined with noindex + robots.txt and no
// nav link, that covers the actual threat model here.
//
// To change the passcode: pick a new value, compute its SHA-256 hex digest
// (e.g. in a browser console: crypto.subtle.digest('SHA-256', new
// TextEncoder().encode('newpasscode')) then hex-encode the result, or ask
// Claude to do it), and replace PASSCODE_HASH below. Never store the plain
// passcode in this file.
(function () {
  var PASSCODE_HASH = 'ee22d87e1b87ed9ff3f138c97417cbec205facda7085d51f6b0ee01d4a769252';
  var STORAGE_KEY = 'hw_gate_unlocked';

  var oGateSection = document.getElementById('hwGate');
  var oProtected = document.getElementById('hwProtected');
  var oForm = document.getElementById('hwGateForm');
  var oInput = document.getElementById('hw_passcode');
  var oError = document.getElementById('hwGateError');

  if (!oGateSection || !oProtected || !oForm || !oInput) {
    return;
  }

  function reveal() {
    oGateSection.hidden = true;
    oProtected.hidden = false;
  }

  function isUnlocked() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function rememberUnlocked() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {
      // Private browsing or blocked storage — she'll just re-enter it next visit.
    }
  }

  function sha256Hex(sText) {
    var aData = new TextEncoder().encode(sText);
    return crypto.subtle.digest('SHA-256', aData).then(function (oBuffer) {
      var aBytes = Array.from(new Uint8Array(oBuffer));
      return aBytes.map(function (nByte) {
        return nByte.toString(16).padStart(2, '0');
      }).join('');
    });
  }

  if (isUnlocked()) {
    reveal();
  }

  oForm.addEventListener('submit', function (oEvent) {
    oEvent.preventDefault();
    oError.hidden = true;

    sha256Hex(oInput.value).then(function (sHash) {
      if (sHash === PASSCODE_HASH) {
        rememberUnlocked();
        reveal();
      } else {
        oError.hidden = false;
        oInput.value = '';
        oInput.focus();
      }
    });
  });
})();
