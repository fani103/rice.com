/**
 * FANEESH RICE SHOP — cart-page.js
 * Handles rendering logic for cart.html only
 */

window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 50);
});

function toggleNav() {
  document.getElementById('navLinks')?.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', renderCart);

function renderCart() {
  const layout = document.getElementById('cartLayout');
  const cart   = getCart();

  if (!cart.length) {
    layout.innerHTML = `
      <div style="grid-column:1/-1;display:flex;justify-content:center;padding:60px 24px">
        <div class="empty-cart">
          <div class="empty-cart-img">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added any rice yet.</p>
          <a href="../index.html#products" class="btn-primary" style="display:inline-flex;margin-top:8px">🌾 Browse Products</a>
        </div>
      </div>`;
    return;
  }

  const subtotal  = getCartSubtotal();
  const delivery  = getDeliveryFee(subtotal);
  const total     = subtotal + delivery;
  const itemCount = getCartCount();

  layout.innerHTML = `
    <div class="cart-items-panel">
      <div class="cart-panel-header">
        <h3>🛒 Cart Items (${itemCount} ${itemCount === 1 ? 'item' : 'items'})</h3>
        <button class="clear-cart-btn" onclick="handleClearCart()">🗑️ Clear All</button>
      </div>
      <div id="cartItemsList">
        ${cart.map(item => renderCartItem(item)).join('')}
      </div>
    </div>

    <div class="cart-summary" id="cartSummary">
      <div class="summary-title">📋 Order Summary</div>
      <div class="summary-row">
        <span>Subtotal (${itemCount} items)</span>
        <span class="val">₹${subtotal}</span>
      </div>
      <div class="summary-row">
        <span>Delivery Fee</span>
        <span class="val" style="color:${delivery === 0 ? 'var(--forest-mid)' : 'inherit'}">
          ${delivery === 0 ? '🎉 FREE' : '₹' + delivery}
        </span>
      </div>
      <div class="summary-free-delivery">
        ${delivery > 0 ? `Add ₹${500 - subtotal} more for FREE delivery!` : '🎉 Free delivery unlocked!'}
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span class="val">₹${total}</span>
      </div>
      <a href="checkout.html" class="checkout-btn">Proceed to Checkout →</a>
      <a href="../index.html#products" class="continue-shopping-btn">← Continue Shopping</a>
    </div>`;
}

function renderCartItem(item) {
  return `
    <div class="cart-item" id="item-${item._id}">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}"
           onerror="this.src='https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200'"/>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price-unit">₹${item.pricePerKg} per kg</div>
        <div class="cart-item-total">₹${item.pricePerKg * item.quantity}</div>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty('${item._id}',-1)">−</button>
        <span class="qty-value" id="qty-${item._id}">${item.quantity}</span>
        <button class="qty-btn" onclick="changeQty('${item._id}',1)">+</button>
      </div>
      <button class="remove-item-btn" onclick="handleRemoveItem('${item._id}')" title="Remove">✕</button>
    </div>`;
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i._id === id);
  if (!item) return;
  const newQty = item.quantity + delta;
  if (newQty < 1) { handleRemoveItem(id); return; }
  setQuantity(id, newQty);
  const qtyEl = document.getElementById(`qty-${id}`);
  if (qtyEl) qtyEl.textContent = newQty;
  const itemEl = document.getElementById(`item-${id}`);
  if (itemEl) {
    const totalEl = itemEl.querySelector('.cart-item-total');
    if (totalEl) totalEl.textContent = `₹${item.pricePerKg * newQty}`;
  }
  renderCart(); // re-render summary
}

function handleRemoveItem(id) {
  const itemEl = document.getElementById(`item-${id}`);
  if (itemEl) {
    itemEl.style.opacity = '0';
    itemEl.style.transform = 'translateX(20px)';
    itemEl.style.transition = 'all 0.3s ease';
    setTimeout(() => { removeFromCart(id); renderCart(); showToast('Item removed', 'info'); }, 300);
  }
}

function handleClearCart() {
  if (!confirm('Clear all items from your cart?')) return;
  clearCart();
  renderCart();
  showToast('Cart cleared', 'info');
}