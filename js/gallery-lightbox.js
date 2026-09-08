// Opens a full-viewport lightbox when a gallery photo is clicked, showing
// it at its original aspect ratio (object-fit: contain, never cropped) —
// unlike the grid thumbnails, which are cropped to a fixed box via cover.
(function () {
  var oGrid = document.querySelector('.gallery-grid');
  var oLightbox = document.getElementById('lightbox');
  var oLightboxImage = document.getElementById('lightboxImage');
  var oCloseBtn = document.querySelector('.lightbox-close');

  if (!oGrid || !oLightbox || !oLightboxImage || !oCloseBtn) {
    return;
  }

  var oLastFocused = null;

  function openLightbox(oImg) {
    oLightboxImage.src = oImg.src;
    oLightboxImage.alt = oImg.alt;
    oLightbox.classList.add('is-open');
    oLastFocused = document.activeElement;
    oCloseBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    oLightbox.classList.remove('is-open');
    oLightboxImage.src = '';
    document.body.style.overflow = '';
    if (oLastFocused) {
      oLastFocused.focus();
    }
  }

  oGrid.addEventListener('click', function (oEvent) {
    var oImg = oEvent.target.closest('figure img');
    if (!oImg) {
      return;
    }
    openLightbox(oImg);
  });

  oCloseBtn.addEventListener('click', closeLightbox);

  oLightbox.addEventListener('click', function (oEvent) {
    if (oEvent.target === oLightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (oEvent) {
    if (oEvent.key === 'Escape' && oLightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
})();
