// Reusable passcode gate, shared by every client mockup under /mockups/.
// Each mockup page sets its OWN expected hash via data-passcode-hash on
// <body>, so this one file works unchanged for every client — never edit
// this script per client, only the page's data attribute.
//
// To set a passcode for a new client: pick a value, compute its SHA-256
// hex digest (ask Claude, or in a browser console:
// crypto.subtle.digest('SHA-256', new TextEncoder().encode('newcode')) then
// hex-encode the result), and put that hash in data-passcode-hash on that
// client's <body>. Never put the plain passcode in any file.
//
// This is a soft deterrent, not real security — the protected markup still
// ships in the page's HTML. Combined with noindex + robots.txt disallow and
// no public link to the folder, it's enough to keep a mockup private while
// staying easy for Thi and the client to open from any device.
(function () {
  var oBody = document.body;
  var sExpectedHash = oBody.dataset.passcodeHash;
  var sStorageKey = 'mock_unlocked:' + location.pathname;

  var oGateSection = document.getElementById('mockGate');
  var oProtected = document.getElementById('mockProtected');
  var oForm = document.getElementById('mockGateForm');
  var oInput = document.getElementById('mock_passcode');
  var oError = document.getElementById('mockGateError');

  if (!sExpectedHash || !oGateSection || !oProtected || !oForm || !oInput) {
    return;
  }

  function reveal() {
    oGateSection.hidden = true;
    oProtected.hidden = false;
  }

  function isUnlocked() {
    try {
      return localStorage.getItem(sStorageKey) === '1';
    } catch (e) {
      return false;
    }
  }

  function rememberUnlocked() {
    try {
      localStorage.setItem(sStorageKey, '1');
    } catch (e) {
      // Private browsing or blocked storage — they'll just re-enter it next visit.
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
      if (sHash === sExpectedHash) {
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
