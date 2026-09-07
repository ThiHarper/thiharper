// Filters the gallery grid by category. Each figure's data-category holds
// one or more space-separated category slugs; a filter button's
// data-filter must match one of them (or be "all") to stay visible.
(function () {
  var oFilterNav = document.querySelector('.gallery-filters');
  var aFigures = document.querySelectorAll('.gallery-grid figure');

  if (!oFilterNav || !aFigures.length) {
    return;
  }

  function applyFilter(sFilter) {
    Array.prototype.forEach.call(aFigures, function (oFigure) {
      var aCategories = (oFigure.getAttribute('data-category') || '').split(' ');
      oFigure.hidden = sFilter !== 'all' && aCategories.indexOf(sFilter) === -1;
    });
  }

  oFilterNav.addEventListener('click', function (oEvent) {
    var oButton = oEvent.target.closest('button');
    if (!oButton) {
      return;
    }

    var aButtons = oFilterNav.querySelectorAll('button');
    Array.prototype.forEach.call(aButtons, function (oBtn) {
      var bIsChosen = oBtn === oButton;
      oBtn.classList.toggle('is-active', bIsChosen);
      oBtn.setAttribute('aria-pressed', bIsChosen ? 'true' : 'false');
    });

    applyFilter(oButton.getAttribute('data-filter'));
  });
})();
