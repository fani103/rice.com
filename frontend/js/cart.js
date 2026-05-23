/**
 * FANEESH RICE SHOP — cart.js
 * Shared cart utilities. Load on every page.
 */

const CART_KEY = 'faneesh_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product) {
  const cart     = getCart();
  const existing = cart.find(i => i._id === product._id);
  if (existing) { existing.quantity += 1; }
  else { cart.push({ ...product, quantity: 1 }); }
  saveCart(cart);
  showToast(`✅ ${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
  saveCart(getCart().filter(i => i._id !== productId));
}

function setQuantity(productId, qty) {
  const cart = getCart();
  const item = cart.find(i => i._id === productId);
  if (!item) return;
  if (qty < 1) { removeFromCart(productId); return; }
  item.quantity = qty;
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

function getCartCount()    { return getCart().reduce((s, i) => s + i.quantity, 0); }
function getCartSubtotal() { return getCart().reduce((s, i) => s + (i.pricePerKg * i.quantity), 0); }
function getDeliveryFee(subtotal) { return subtotal >= 500 ? 0 : 50; }
function getCartTotal()    { const s = getCartSubtotal(); return s + getDeliveryFee(s); }

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons  = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast  = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('toast-exit'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// Navbar scroll + toggle (used on all pages)
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 50);
});

function toggleNav() {
  document.getElementById('navLinks')?.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', updateCartBadge);