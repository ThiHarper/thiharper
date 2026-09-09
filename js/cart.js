// Site-wide shopping cart for the flat-fee Keepsakes & Gifts products.
// Fully self-injecting: this script builds the header cart button and the
// cart drawer itself and appends them to the page, so every page only
// needs a single <script src="js/cart.js"> tag — no HTML duplication.
//
// Online payment (Stripe) isn't wired up yet. Until STRIPE_ENABLED is
// flipped on, "Checkout" hands the cart off to the existing contact form
// as a pre-filled order message instead of leaving visitors at a dead
// end — see GoToCheckout().
(function () {
  var STRIPE_ENABLED = false;
  var STORAGE_KEY = 'thiharper_cart';
  var PENDING_ORDER_KEY = 'thiharper_pending_order';
  var SHIPPING_FEE = 6;
  var FREE_SHIPPING_THRESHOLD = 75;

  var oHeaderContainer = document.querySelector('.site-header .container');
  var oNavToggle = document.querySelector('.nav-toggle');

  if (!oHeaderContainer) {
    return;
  }

  // ---- Cart storage ----

  function GetCart() {
    try {
      var sRaw = localStorage.getItem(STORAGE_KEY);
      return sRaw ? JSON.parse(sRaw) : [];
    } catch (e) {
      return [];
    }
  }

  function SaveCart(aCart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(aCart));
    } catch (e) {
      // Storage unavailable (private browsing, etc.) — cart just won't persist.
    }
  }

  function GetCartCount(aCart) {
    return aCart.reduce(function (nSum, oItem) { return nSum + oItem.qty; }, 0);
  }

  function GetCartSubtotal(aCart) {
    return aCart.reduce(function (nSum, oItem) { return nSum + oItem.unitPrice * oItem.qty; }, 0);
  }

  function GetShippingInfo(aCart) {
    var bHasPickupOnly = aCart.some(function (oItem) { return oItem.pickupOnly; });
    var nSubtotal = GetCartSubtotal(aCart);

    if (aCart.length === 0) {
      return { label: '', fee: 0 };
    }
    if (bHasPickupOnly) {
      return { label: 'Local pickup required', fee: 0 };
    }
    if (nSubtotal >= FREE_SHIPPING_THRESHOLD) {
      return { label: 'Free', fee: 0 };
    }
    return { label: FormatPrice(SHIPPING_FEE), fee: SHIPPING_FEE };
  }

  function FormatPrice(nAmount) {
    return '$' + nAmount.toFixed(2);
  }

  // ---- Header cart button ----

  var oCartToggle = document.createElement('button');
  oCartToggle.type = 'button';
  oCartToggle.className = 'cart-toggle';
  oCartToggle.setAttribute('aria-label', 'View cart');
  oCartToggle.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="9" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle>' +
    '<path d="M2.5 3h2l2.68 12.39a2 2 0 0 0 2 1.61h8.64a2 2 0 0 0 2-1.61L21.5 8H6"></path>' +
    '</svg><span class="cart-badge" hidden></span>';

  if (oNavToggle) {
    oHeaderContainer.insertBefore(oCartToggle, oNavToggle);
  } else {
    oHeaderContainer.appendChild(oCartToggle);
  }

  var oBadge = oCartToggle.querySelector('.cart-badge');

  function RenderBadge() {
    var nCount = GetCartCount(GetCart());
    if (nCount > 0) {
      oBadge.textContent = String(nCount);
      oBadge.hidden = false;
    } else {
      oBadge.hidden = true;
    }
  }

  // ---- Cart drawer ----

  var oDrawer = document.createElement('div');
  oDrawer.className = 'cart-drawer';
  oDrawer.id = 'cartDrawer';
  oDrawer.setAttribute('role', 'dialog');
  oDrawer.setAttribute('aria-modal', 'true');
  oDrawer.setAttribute('aria-label', 'Your cart');
  oDrawer.innerHTML =
    '<div class="cart-drawer-panel">' +
    '<div class="cart-drawer-header"><h2>Your Cart</h2><button type="button" class="cart-close" aria-label="Close cart">&times;</button></div>' +
    '<div class="cart-items"></div>' +
    '</div>';
  document.body.appendChild(oDrawer);

  var oCartItemsEl = oDrawer.querySelector('.cart-items');
  var oCloseBtn = oDrawer.querySelector('.cart-close');
  var oLastFocused = null;

  function OpenDrawer() {
    RenderDrawer();
    oDrawer.classList.add('is-open');
    oLastFocused = document.activeElement;
    oCloseBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function CloseDrawer() {
    oDrawer.classList.remove('is-open');
    document.body.style.overflow = '';
    if (oLastFocused) {
      oLastFocused.focus();
    }
  }

  oCartToggle.addEventListener('click', OpenDrawer);
  oCloseBtn.addEventListener('click', CloseDrawer);
  oDrawer.addEventListener('click', function (oEvent) {
    if (oEvent.target === oDrawer) {
      CloseDrawer();
    }
  });
  document.addEventListener('keydown', function (oEvent) {
    if (oEvent.key === 'Escape' && oDrawer.classList.contains('is-open')) {
      CloseDrawer();
    }
  });

  function RenderDrawer() {
    var aCart = GetCart();

    if (aCart.length === 0) {
      oCartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
      return;
    }

    var oShipping = GetShippingInfo(aCart);
    var nSubtotal = GetCartSubtotal(aCart);
    var nTotal = nSubtotal + oShipping.fee;

    var sHtml = '';
    aCart.forEach(function (oItem, nIndex) {
      sHtml +=
        '<div class="cart-item" data-index="' + nIndex + '">' +
        '<div class="cart-item-info">' +
        '<p class="cart-item-name">' + EscapeHtml(oItem.name) + '</p>' +
        (oItem.personalization ? '<p class="cart-item-note">"' + EscapeHtml(oItem.personalization) + '"</p>' : '') +
        '<div class="cart-item-controls">' +
        '<div class="qty-stepper">' +
        '<button type="button" class="cart-qty-decrease" aria-label="Decrease quantity">&minus;</button>' +
        '<input type="number" class="qty-input cart-qty-input" value="' + oItem.qty + '" min="1" max="20" aria-label="Quantity">' +
        '<button type="button" class="cart-qty-increase" aria-label="Increase quantity">+</button>' +
        '</div>' +
        '<button type="button" class="cart-item-remove">Remove</button>' +
        '</div>' +
        '</div>' +
        '<p class="cart-item-price">' + FormatPrice(oItem.unitPrice * oItem.qty) + '</p>' +
        '</div>';
    });

    sHtml +=
      '<div class="cart-summary">' +
      '<div class="cart-summary-row"><span>Subtotal</span><span>' + FormatPrice(nSubtotal) + '</span></div>' +
      '<div class="cart-summary-row"><span>Shipping</span><span>' + oShipping.label + '</span></div>' +
      '<div class="cart-summary-row cart-total"><span>Total</span><span>' + FormatPrice(nTotal) + '</span></div>' +
      '</div>' +
      '<p class="cart-note">' +
      (STRIPE_ENABLED
        ? "You'll enter payment details on the next step."
        : "Online payment is almost ready! For now, checkout sends your order details straight to Thi, who'll follow up to confirm and collect payment.") +
      '</p>' +
      '<button type="button" class="btn cart-checkout-btn" id="cartCheckoutBtn">Checkout</button>';

    oCartItemsEl.innerHTML = sHtml;
    WireItemControls();

    var oCheckoutBtn = document.getElementById('cartCheckoutBtn');
    oCheckoutBtn.addEventListener('click', GoToCheckout);
  }

  function WireItemControls() {
    Array.prototype.forEach.call(oCartItemsEl.querySelectorAll('.cart-item'), function (oRow) {
      var nIndex = Number(oRow.getAttribute('data-index'));

      oRow.querySelector('.cart-qty-decrease').addEventListener('click', function () {
        ChangeQty(nIndex, -1);
      });
      oRow.querySelector('.cart-qty-increase').addEventListener('click', function () {
        ChangeQty(nIndex, 1);
      });
      oRow.querySelector('.cart-qty-input').addEventListener('change', function (oEvent) {
        SetQty(nIndex, Number(oEvent.target.value));
      });
      oRow.querySelector('.cart-item-remove').addEventListener('click', function () {
        var aCart = GetCart();
        aCart.splice(nIndex, 1);
        SaveCart(aCart);
        RenderBadge();
        RenderDrawer();
      });
    });
  }

  function ChangeQty(nIndex, nDelta) {
    var aCart = GetCart();
    if (!aCart[nIndex]) {
      return;
    }
    SetQty(nIndex, aCart[nIndex].qty + nDelta);
  }

  function SetQty(nIndex, nNewQty) {
    var aCart = GetCart();
    if (!aCart[nIndex]) {
      return;
    }
    aCart[nIndex].qty = Math.max(1, Math.min(20, Math.round(nNewQty) || 1));
    SaveCart(aCart);
    RenderBadge();
    RenderDrawer();
  }

  function EscapeHtml(sText) {
    var oDiv = document.createElement('div');
    oDiv.textContent = sText;
    return oDiv.innerHTML;
  }

  // ---- Checkout handoff (pre-Stripe) ----

  function GoToCheckout() {
    var aCart = GetCart();
    if (aCart.length === 0) {
      return;
    }

    if (STRIPE_ENABLED) {
      // TODO: create a Stripe Checkout Session and redirect to it.
      return;
    }

    var oShipping = GetShippingInfo(aCart);
    var nSubtotal = GetCartSubtotal(aCart);
    var nTotal = nSubtotal + oShipping.fee;

    var sSummary = "Here's my order:\n\n";
    aCart.forEach(function (oItem) {
      sSummary += '- ' + oItem.qty + 'x ' + oItem.name;
      if (oItem.personalization) {
        sSummary += ' — "' + oItem.personalization + '"';
      }
      sSummary += ' (' + FormatPrice(oItem.unitPrice * oItem.qty) + ')\n';
    });
    sSummary += '\nSubtotal: ' + FormatPrice(nSubtotal);
    sSummary += '\nShipping: ' + oShipping.label;
    sSummary += '\nTotal: ' + FormatPrice(nTotal);

    try {
      sessionStorage.setItem(PENDING_ORDER_KEY, sSummary);
    } catch (e) {
      // Ignore — contact form just won't be pre-filled.
    }

    window.location.href = 'contact.html?cart=1';
  }

  // ---- Add-to-cart controls on product cards (services.html) ----

  Array.prototype.forEach.call(document.querySelectorAll('.add-to-cart'), function (oCard) {
    var sId = oCard.getAttribute('data-product-id');
    var sName = oCard.getAttribute('data-product-name');
    var nBasePrice = Number(oCard.getAttribute('data-product-price'));
    var bPickupOnly = oCard.getAttribute('data-pickup-only') === 'true';

    var oQtyInput = oCard.querySelector('.qty-input');
    var oDecreaseBtn = oCard.querySelector('.qty-decrease');
    var oIncreaseBtn = oCard.querySelector('.qty-increase');
    var oPersonalizeInput = oCard.querySelector('.personalize-input');
    var oAddonInput = oCard.querySelector('.addon-input');
    var oAddBtn = oCard.querySelector('.add-to-cart-btn');

    oDecreaseBtn.addEventListener('click', function () {
      oQtyInput.value = Math.max(1, Number(oQtyInput.value) - 1);
    });
    oIncreaseBtn.addEventListener('click', function () {
      oQtyInput.value = Math.min(20, Number(oQtyInput.value) + 1);
    });

    oAddBtn.addEventListener('click', function () {
      var nQty = Math.max(1, Math.min(20, Number(oQtyInput.value) || 1));
      var sPersonalization = oPersonalizeInput ? oPersonalizeInput.value.trim() : '';
      var bAddonSelected = oAddonInput ? oAddonInput.checked : false;
      var nAddonPrice = bAddonSelected ? Number(oAddonInput.getAttribute('data-addon-price')) : 0;
      var sAddonLabel = bAddonSelected ? oAddonInput.getAttribute('data-addon-name') : '';

      var oNewItem = {
        id: sId,
        name: sName + (sAddonLabel ? ' (' + sAddonLabel + ')' : ''),
        unitPrice: nBasePrice + nAddonPrice,
        qty: nQty,
        pickupOnly: bPickupOnly,
        personalization: sPersonalization
      };

      var aCart = GetCart();
      var oExisting = aCart.find(function (oItem) {
        return oItem.id === oNewItem.id &&
          oItem.personalization === oNewItem.personalization &&
          oItem.unitPrice === oNewItem.unitPrice;
      });

      if (oExisting) {
        oExisting.qty = Math.min(20, oExisting.qty + nQty);
      } else {
        aCart.push(oNewItem);
      }

      SaveCart(aCart);
      RenderBadge();

      oQtyInput.value = 1;
      if (oPersonalizeInput) {
        oPersonalizeInput.value = '';
      }
      if (oAddonInput) {
        oAddonInput.checked = false;
      }

      OpenDrawer();
    });
  });

  RenderBadge();
})();
