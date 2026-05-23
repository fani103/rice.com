/**
 * frontend/js/checkout.js
 * Razorpay-fixed version
 */

const CHECKOUT_API_BASE = "http://localhost:5000/api";
const SHOP_PHONE = "919999999999";
const CHECKOUT_CART_KEY = "faneesh_cart";

// ─────────────────────────────────────────
// CART
// ─────────────────────────────────────────

function _getCart() {
  try {
    return JSON.parse(localStorage.getItem(CHECKOUT_CART_KEY)) || [];
  } catch {
    return [];
  }
}

function _clearCart() {
  localStorage.removeItem(CHECKOUT_CART_KEY);
}

// ─────────────────────────────────────────
// PAYMENT SELECT
// ─────────────────────────────────────────

function selectPayment(element, method) {
  document.querySelectorAll(".payment-option").forEach(el => {
    el.classList.remove("selected");
  });
  element.classList.add("selected");
  document.getElementById("selectedPayment").value = method;
}

// ─────────────────────────────────────────
// RENDER SUMMARY
// ─────────────────────────────────────────

function renderCheckoutSummary() {
  const cart = _getCart();
  const container = document.getElementById("checkoutItems");
  if (!container) return;

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <h3>🛒 Cart is Empty</h3>
      </div>
    `;
    updateTotals(0);
    return;
  }

  let subtotal = 0;

  container.innerHTML = cart.map(item => {
    const qty   = Number(item.quantity   || 1);
    const price = Number(item.pricePerKg || item.price || 0);
    const lineTotal = qty * price;
    subtotal += lineTotal;

    return `
      <div class="checkout-item">
        <img src="${item.image}" alt="${item.name}" class="checkout-item-image" />
        <div class="checkout-item-info">
          <h4>${item.name}</h4>
          <p>${qty} kg × ₹${price}</p>
        </div>
        <div class="checkout-item-price">₹${lineTotal}</div>
      </div>
    `;
  }).join("");

  updateTotals(subtotal);
}

// ─────────────────────────────────────────
// TOTALS
// ─────────────────────────────────────────

function updateTotals(subtotal) {
  const delivery = subtotal >= 500 ? 0 : 50;
  const total    = subtotal + delivery;

  document.getElementById("summarySubtotal").textContent = `₹${subtotal}`;
  document.getElementById("summaryDelivery").textContent = delivery === 0 ? "FREE" : `₹${delivery}`;
  document.getElementById("summaryTotal").textContent    = `₹${total}`;

  const note = document.getElementById("freeDeliveryNote");
  if (note) {
    note.innerHTML = delivery === 0
      ? "🎉 Free Delivery Applied"
      : `Add ₹${500 - subtotal} more for free delivery`;
  }
}

// ─────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────

function validateForm() {
  const name    = document.getElementById("custName").value.trim();
  const phone   = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();

  if (!name)            { _showToast("Enter your name", "error");    return false; }
  if (!phone)           { _showToast("Enter phone number", "error"); return false; }
  if (!address)         { _showToast("Enter address", "error");      return false; }
  if (!_getCart().length) { _showToast("Cart is empty", "error");   return false; }

  return true;
}

// ─────────────────────────────────────────
// PLACE ORDER
// ─────────────────────────────────────────

async function placeOrder() {
  if (!validateForm()) return;

  const method = document.getElementById("selectedPayment").value || "COD";
  const cart   = _getCart();

  let subtotal = 0;
  const items  = cart.map(item => {
    const qty   = Number(item.quantity   || 1);
    const price = Number(item.pricePerKg || item.price || 0);
    subtotal   += qty * price;
    return {
      productId:  item._id || item.id || "",
      name:       item.name,
      quantity:   qty,
      pricePerKg: price,
      image:      item.image || ""
    };
  });

  const deliveryFee = subtotal >= 500 ? 0 : 50;
  const total       = subtotal + deliveryFee;

  const orderData = {
    customer: {
      name:    document.getElementById("custName").value.trim(),
      phone:   document.getElementById("custPhone").value.trim(),
      email:   document.getElementById("custEmail").value.trim(),
      address: document.getElementById("custAddress").value.trim()
    },
    items,
    subtotal,
    deliveryFee,
    total,
    paymentMethod:  method,
    paymentStatus:  "PENDING",
    notes:          document.getElementById("custNotes").value.trim()
  };

  if (method === "WHATSAPP") { sendWhatsAppOrder(); return; }
  if (method === "RAZORPAY") { await startRazorpayPayment(orderData); return; }

  // COD
  try {
    const response = await fetch(`${CHECKOUT_API_BASE}/orders`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(orderData)
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Order failed");

    localStorage.setItem("lastOrder", JSON.stringify(data.data));
    _clearCart();
    _showToast("🎉 Order placed successfully!", "success");
    setTimeout(() => { window.location.href = "../success.html"; }, 1500);

  } catch (error) {
    console.error(error);
    _showToast(error.message, "error");
  }
}

// ─────────────────────────────────────────
// RAZORPAY  ← fixed
// ─────────────────────────────────────────

async function startRazorpayPayment(orderData) {

  // 1. Guard: make sure the SDK is loaded
  if (typeof Razorpay === "undefined") {
    _showToast("Razorpay SDK not loaded. Check your internet connection.", "error");
    console.error("Razorpay is not defined – add the SDK script to your HTML:\n<script src=\"https://checkout.razorpay.com/v1/checkout.js\"></script>");
    return;
  }

  try {
    // 2. Create order on your backend
    const response = await fetch(`${CHECKOUT_API_BASE}/payment/create-order`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      // Send amount in RUPEES – backend must convert to paise (* 100)
      body:    JSON.stringify({ amount: orderData.total })
    });

    const data = await response.json();
    console.log("Razorpay create-order response:", data); // helpful debug log

    if (!data.success) throw new Error(data.message || "Unable to create payment");

    // 3. Validate expected shape from backend
    if (!data.key || !data.order?.id) {
      throw new Error("Invalid response from payment server. Expected { key, order: { id, amount } }");
    }

    // 4. Open Razorpay checkout
    const options = {
      key:         data.key,             // rzp_test_xxx  or  rzp_live_xxx
      amount:      data.order.amount,    // in paise, as returned by Razorpay API
      currency:    "INR",
      name:        "Faneesh Rice Shop",
      description: "Rice Order Payment",
      order_id:    data.order.id,        // Razorpay order id

      handler: async function (paymentResponse) {
        // Called after successful payment on Razorpay's end
        try {
          const verifyResponse = await fetch(`${CHECKOUT_API_BASE}/payment/verify`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              razorpay_order_id:   paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature:  paymentResponse.razorpay_signature,
              orderPayload:        orderData
            })
          });

          const verifyData = await verifyResponse.json();
          if (!verifyData.success) throw new Error("Payment verification failed");

          localStorage.setItem("lastOrder", JSON.stringify(verifyData.data));
          _clearCart();
          _showToast("🎉 Payment Successful!", "success");
          setTimeout(() => { window.location.href = "../success.html"; }, 1500);

        } catch (error) {
          console.error("Verify error:", error);
          _showToast(error.message, "error");
        }
      },

      prefill: {
        name:    orderData.customer.name,
        email:   orderData.customer.email,
        contact: orderData.customer.phone
      },

      theme: { color: "#FF6B00" },

      modal: {
        ondismiss: function () {
          _showToast("Payment cancelled", "info");
        }
      }
    };

    const rzp = new Razorpay(options);

    // Catch payment errors (e.g. card declined)
    rzp.on("payment.failed", function (response) {
      console.error("Payment failed:", response.error);
      _showToast(`Payment failed: ${response.error.description}`, "error");
    });

    rzp.open();

  } catch (error) {
    console.error("Razorpay error:", error);
    _showToast(error.message, "error");
  }
}

// ─────────────────────────────────────────
// WHATSAPP
// ─────────────────────────────────────────

function sendWhatsAppOrder() {
  const cart = _getCart();
  let total  = 0;

  const itemsText = cart.map(item => {
    const qty   = item.quantity || 1;
    const price = item.pricePerKg || item.price;
    total += qty * price;
    return `• ${item.name} (${qty}kg) - ₹${qty * price}`;
  }).join("\n");

  const message = `
🌾 *Faneesh Rice Shop Order*

${itemsText}

💰 Total: ₹${total}

👤 Name:
${document.getElementById("custName").value}

📞 Phone:
${document.getElementById("custPhone").value}

📍 Address:
${document.getElementById("custAddress").value}
  `.trim();

  window.open(
    `https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

// ─────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────

function _showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");

  if (!container) { alert(message); return; }

  const toast       = document.createElement("div");
  toast.className   = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => { toast.remove(); }, 3000);
}

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  renderCheckoutSummary();
});