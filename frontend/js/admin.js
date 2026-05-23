const API_BASE = "http://localhost:5000/api";

let allOrders = [];
let allProducts = [];
let currentTab = "orders";
let currentPage = 1;
const PAGE_SIZE = 10;

document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadOrders();
  startAutoRefresh();
});

function startAutoRefresh() {
  setInterval(() => {
    if (currentTab === "orders") loadOrders(false);
    loadStats();
  }, 30000);
}

function showTab(tab, el) {
  currentTab = tab;

  document.querySelectorAll(".admin-nav-item").forEach(item => {
    item.classList.remove("active");
  });

  if (el) el.classList.add("active");

  document.getElementById("ordersPanel").style.display = "none";
  document.getElementById("productsPanel").style.display = "none";
  document.getElementById("statsPanel").style.display = "none";

  document.getElementById(tab + "Panel").style.display = "block";

  const titles = {
    orders: "📦 Orders",
    products: "🌾 Products",
    stats: "📊 Analytics"
  };

  document.getElementById("adminTitle").textContent = titles[tab];

  if (tab === "products") loadProducts();
  if (tab === "stats") loadAnalytics();
}

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/orders?limit=200`);
    const data = await res.json();

    if (!data.success) return;

    const orders = data.data || [];

    const revenue = orders
      .filter(o => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    setEl("statTotal", orders.length);
    setEl("statRevenue", "₹" + revenue.toLocaleString("en-IN"));
    setEl("statPending", orders.filter(o => ["PLACED", "CONFIRMED"].includes(o.status)).length);
    setEl("statDelivered", orders.filter(o => o.status === "DELIVERED").length);
    setEl("statCancelled", orders.filter(o => o.status === "CANCELLED").length);

    const today = new Date().toDateString();
    setEl("statToday", orders.filter(o => new Date(o.createdAt).toDateString() === today).length);

  } catch (error) {
    console.error("Stats error:", error);
  }
}

async function loadOrders(showLoader = true) {
  const tbody = document.getElementById("ordersTableBody");

  if (showLoader) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:60px;">Loading orders...</td></tr>`;
  }

  try {
    const status = document.getElementById("statusFilter")?.value || "";
    const search = document.getElementById("orderSearch")?.value.toLowerCase() || "";

    const params = new URLSearchParams();
    params.set("limit", 100);
    if (status) params.set("status", status);

    const res = await fetch(`${API_BASE}/orders?${params.toString()}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    allOrders = data.data || [];

    let filtered = allOrders;

    if (search) {
      filtered = allOrders.filter(order =>
        order.customer?.name?.toLowerCase().includes(search) ||
        order.customer?.phone?.includes(search) ||
        order.customer?.email?.toLowerCase().includes(search) ||
        order.orderId?.toLowerCase().includes(search)
      );
    }

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    setEl("ordersCount", `${filtered.length} order(s)`);
    renderOrdersTable(paginated);
    renderPagination(totalPages);

  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:60px; color:red;">${error.message}</td></tr>`;
  }
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById("ordersTableBody");

  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:60px;">No orders found</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(order => {
    const date = new Date(order.createdAt).toLocaleString("en-IN");
    const items = order.items?.map(i => `${i.name} × ${i.quantity}kg`).join(", ") || "—";

    return `
      <tr>
        <td><strong>${order.orderId || order._id.slice(-8)}</strong></td>
        <td>
          <strong>${order.customer?.name || "—"}</strong><br>
          <small>${order.customer?.email || ""}</small>
        </td>
        <td>${order.customer?.phone || "—"}</td>
        <td title="${items}">${order.items?.length || 0} item(s)</td>
        <td><strong>₹${order.total}</strong></td>
        <td>${order.paymentMethod || "COD"}<br><small>${order.paymentStatus || "PENDING"}</small></td>
        <td><span class="status-badge ${getStatusClass(order.status)}">${order.status}</span></td>
        <td>${date}</td>
        <td>
          <button onclick="openOrderModal('${order._id}')">👁 View</button>
          <select onchange="updateOrderStatus('${order._id}', this.value, this)">
            <option value="">Update</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PACKED">Packed</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </td>
      </tr>
    `;
  }).join("");
}

async function updateOrderStatus(id, status, selectEl) {
  if (!status) return;

  try {
    selectEl.disabled = true;

    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    showToast("Status updated successfully", "success");
    loadOrders(false);
    loadStats();

  } catch (error) {
    showToast(error.message, "error");
  } finally {
    selectEl.disabled = false;
    selectEl.value = "";
  }
}

async function openOrderModal(id) {
  const modal = document.getElementById("orderModal");
  const content = document.getElementById("orderModalContent");

  modal.style.display = "flex";
  content.innerHTML = "Loading...";

  try {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    const order = data.data;

    content.innerHTML = `
      <h2>Order Details</h2>
      <p><b>Order ID:</b> ${order.orderId}</p>
      <p><b>Name:</b> ${order.customer.name}</p>
      <p><b>Phone:</b> ${order.customer.phone}</p>
      <p><b>Email:</b> ${order.customer.email || "Not provided"}</p>
      <p><b>Address:</b> ${order.customer.address}</p>
      <hr>
      <h3>Items</h3>
      ${order.items.map(item => `
        <p>${item.name} - ${item.quantity}kg × ₹${item.pricePerKg}</p>
      `).join("")}
      <hr>
      <p><b>Total:</b> ₹${order.total}</p>
      <p><b>Status:</b> ${order.status}</p>
      <p><b>Payment:</b> ${order.paymentMethod} - ${order.paymentStatus}</p>
    `;

  } catch (error) {
    content.innerHTML = `<p style="color:red;">${error.message}</p>`;
  }
}

function closeModal() {
  document.getElementById("orderModal").style.display = "none";
}

async function loadProducts() {
  const wrap = document.getElementById("productsTableWrap");
  wrap.innerHTML = `<div style="padding:40px;">Loading products...</div>`;

  try {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    allProducts = data.data || [];

    wrap.innerHTML = `
      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price/kg</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Tag</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            ${allProducts.map(p => `
              <tr>
                <td><img src="${p.image}" style="width:50px;height:50px;object-fit:cover;border-radius:10px;"></td>
                <td>${p.name}</td>
                <td>₹${p.pricePerKg}</td>
                <td>${p.stock}</td>
                <td>⭐ ${p.rating}</td>
                <td>${p.tag}</td>
                <td>${p.type}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;

  } catch (error) {
    wrap.innerHTML = `<p style="color:red; padding:24px;">${error.message}</p>`;
  }
}

async function seedProductsAPI() {
  try {
    const res = await fetch(`${API_BASE}/products/seed`);
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    showToast("Products seeded successfully", "success");

    if (currentTab === "products") loadProducts();

  } catch (error) {
    showToast(error.message, "error");
  }
}

function loadAnalytics() {
  const wrap = document.getElementById("analyticsWrap");

  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  wrap.innerHTML = `
    <h3>Total Orders: ${totalOrders}</h3>
    <h3>Total Revenue: ₹${totalRevenue}</h3>
    <p>More analytics can be added later.</p>
  `;
}

function renderPagination(totalPages) {
  const el = document.getElementById("ordersPagination");

  if (!el || totalPages <= 1) {
    el.innerHTML = "";
    return;
  }

  el.innerHTML = Array.from({ length: totalPages }, (_, i) => `
    <button onclick="goToPage(${i + 1})">${i + 1}</button>
  `).join("");
}

function goToPage(page) {
  currentPage = page;
  loadOrders();
}

function onOrderSearch() {
  currentPage = 1;
  loadOrders();
}

function exportOrdersCSV() {
  if (!allOrders.length) {
    showToast("No orders to export", "error");
    return;
  }

  const headers = ["Order ID", "Customer", "Phone", "Total", "Status", "Date"];

  const rows = allOrders.map(o => [
    o.orderId,
    o.customer?.name,
    o.customer?.phone,
    o.total,
    o.status,
    new Date(o.createdAt).toLocaleString("en-IN")
  ]);

  const csv = [headers, ...rows].map(row => row.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "faneesh-orders.csv";
  a.click();

  URL.revokeObjectURL(url);
}

function getStatusClass(status) {
  return {
    PLACED: "status-placed",
    CONFIRMED: "status-confirmed",
    PACKED: "status-packed",
    OUT_FOR_DELIVERY: "status-out-for-delivery",
    DELIVERED: "status-delivered",
    CANCELLED: "status-cancelled"
  }[status] || "status-placed";
}

function setEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}