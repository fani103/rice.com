/**
 * FANEESH RICE SHOP — main.js
 * Homepage: navbar, product fetch, filters, cart
 */

const API_BASE = 'http://localhost:5000/api';
let currentFilter = 'all';
let searchDebounceTimer;

window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 50);
});

function toggleNav() {
  document.getElementById('navLinks')?.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(fetchProducts, 400);
    });
  }
  fetchProducts();
});

function setFilter(btn, filterValue) {
  currentFilter = filterValue;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  fetchProducts();
}

async function fetchProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const searchVal = document.getElementById('searchInput')?.value?.trim() || '';
  const sortVal   = document.getElementById('sortSelect')?.value || '';
  const params    = new URLSearchParams();
  if (searchVal) params.set('search', searchVal);
  if (currentFilter !== 'all') params.set('type', currentFilter);
  if (sortVal) params.set('sort', sortVal);
  showSkeletons(grid);
  try {
    const res  = await fetch(`${API_BASE}/products?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.data.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 24px;color:var(--text-light)">
          <div style="font-size:3rem;margin-bottom:14px">🔍</div>
          <h3 style="font-family:var(--font-display);font-size:1.3rem;margin-bottom:8px;color:var(--text-dark)">No Products Found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>`;
      return;
    }
    renderProducts(data.data, grid);
  } catch (err) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 24px">
        <div style="font-size:3rem;margin-bottom:14px">⚠️</div>
        <h3 style="font-family:var(--font-display);font-size:1.3rem;margin-bottom:8px;color:var(--text-dark)">Could not load products</h3>
        <p style="color:var(--text-light);margin-bottom:20px">Make sure the backend server is running on port 5000.</p>
        <button onclick="fetchProducts()" style="padding:10px 24px;background:var(--forest);color:white;border:none;border-radius:50px;cursor:pointer;font-weight:600;font-family:var(--font-body)">🔄 Retry</button>
      </div>`;
  }
}

function renderProducts(products, grid) {
  grid.innerHTML = products.map(product => `
    <div class="product-card">
      <div class="product-img-wrap">
        <img src="${product.image}" alt="${product.name}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400'"/>
        ${getTagBadge(product.tag)}
        <div class="product-rating-badge">
          <span class="star">★</span> ${product.rating?.toFixed(1) || '4.5'}
          <span style="opacity:0.7;font-size:0.7em">(${formatCount(product.ratingCount)})</span>
        </div>
      </div>
      <div class="product-body">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-footer">
          <div class="product-price">
            <span class="product-price-main">₹${product.pricePerKg}</span>
            <span class="product-price-unit">per kg</span>
            <span class="product-stock">✓ ${product.stock} kg in stock</span>
          </div>
          <button class="add-to-cart-btn" onclick="handleAddToCart(this, ${JSON.stringify(product).replace(/"/g,'&quot;')})">
            🛒 Add
          </button>
        </div>
      </div>
    </div>`).join('');
}

function handleAddToCart(btn, product) {
  addToCart(product);
  const original = btn.innerHTML;
  btn.innerHTML = '✅ Added!';
  btn.style.background = 'linear-gradient(135deg, #2D6A4F, #40916C)';
  setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; }, 1500);
}

function getTagBadge(tag) {
  const map = {
    'Best Seller': 'tag-best-seller',
    'Premium':     'tag-premium',
    'Organic':     'tag-organic',
    'New Arrival': 'tag-new',
    'Budget Pick': 'tag-best-seller',
  };
  return `<span class="product-tag ${map[tag] || 'tag-best-seller'}">${tag || 'Popular'}</span>`;
}

function formatCount(n) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

function showSkeletons(grid, count = 6) {
  grid.innerHTML = Array(count).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text-sm"></div>
        <div class="skeleton-footer">
          <div class="skeleton skeleton-price"></div>
          <div class="skeleton skeleton-btn"></div>
        </div>
      </div>
    </div>`).join('');
}