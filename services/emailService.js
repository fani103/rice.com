/**
 * FANEESH RICE SHOP — Email Service
 * Sends order confirmation to customer + notification to shop owner
 * Uses Nodemailer with Gmail App Password
 */

const nodemailer = require('nodemailer');

// ── Transporter ─────────────────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,   // Gmail App Password (16 chars)
    },
  });

// ── Shared Helpers ───────────────────────────────────────────
const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const statusLabel = {
  PLACED: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

// ── Item rows for both templates ─────────────────────────────
function buildItemRows(items) {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 16px; border-bottom:1px solid #f0ebe0; font-size:14px; color:#3d2e1a;">${item.name}</td>
        <td style="padding:12px 16px; border-bottom:1px solid #f0ebe0; font-size:14px; color:#7a6245; text-align:center;">${item.quantity} kg</td>
        <td style="padding:12px 16px; border-bottom:1px solid #f0ebe0; font-size:14px; color:#7a6245; text-align:center;">${formatINR(item.pricePerKg)}/kg</td>
        <td style="padding:12px 16px; border-bottom:1px solid #f0ebe0; font-size:14px; color:#3d2e1a; font-weight:700; text-align:right;">${formatINR(item.pricePerKg * item.quantity)}</td>
      </tr>`
    )
    .join('');
}

// ── CUSTOMER Confirmation Email ──────────────────────────────
function buildCustomerHTML(order) {
  const shop = process.env.SHOP_NAME || 'Faneesh Rice Shop';
  const itemRows = buildItemRows(order.items);
  const payLabel =
    order.paymentMethod === 'RAZORPAY'
      ? '💳 Online (Razorpay)'
      : order.paymentMethod === 'WHATSAPP'
      ? '📱 WhatsApp COD'
      : '💵 Cash on Delivery';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Order Confirmed — ${shop}</title>
</head>
<body style="margin:0;padding:0;background:#faf6ef;font-family:'Georgia',serif;">

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#3d2e1a 0%,#6b4c2a 100%);">
    <tr>
      <td align="center" style="padding:40px 24px 32px;">
        <div style="font-size:36px;margin-bottom:6px;">🌾</div>
        <div style="font-family:'Georgia',serif;font-size:26px;color:#f5dfa0;letter-spacing:2px;font-weight:700;">${shop}</div>
        <div style="font-size:12px;color:#c8a96a;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Premium Rice Delivered Fresh</div>
      </td>
    </tr>
  </table>

  <!-- Hero Banner -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#c8922a;">
    <tr>
      <td align="center" style="padding:28px 24px;">
        <div style="font-size:30px;margin-bottom:8px;">🎉</div>
        <div style="font-size:22px;color:#fff;font-weight:700;margin-bottom:4px;">Order Confirmed!</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.85);">Thank you, ${order.customer.name}! Your order is on its way.</div>
      </td>
    </tr>
  </table>

  <!-- Main Content -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Order ID Card -->
          <tr>
            <td style="background:#fff;border-radius:12px;padding:24px;margin-bottom:20px;box-shadow:0 2px 12px rgba(61,46,26,0.08);border:1px solid #ede8dd;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:11px;color:#9a8468;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Order Reference</div>
                    <div style="font-size:22px;font-weight:700;color:#c8922a;font-family:monospace;letter-spacing:1px;">${order.orderId || order._id}</div>
                  </td>
                  <td align="right">
                    <div style="background:#f0f9f4;border:1.5px solid #40916c;border-radius:20px;padding:6px 16px;display:inline-block;">
                      <span style="color:#2d6a4f;font-size:13px;font-weight:600;">✅ ${statusLabel[order.status] || order.status}</span>
                    </div>
                  </td>
                </tr>
                <tr><td colspan="2" style="padding-top:12px;font-size:12px;color:#9a8468;">
                  Placed on ${new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
                </td></tr>
              </table>
            </td>
          </tr>

          <tr><td height="16"></td></tr>

          <!-- Items Table -->
          <tr>
            <td style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(61,46,26,0.08);border:1px solid #ede8dd;">
              <div style="background:#f7f2e8;padding:16px 20px;border-bottom:1px solid #ede8dd;">
                <span style="font-size:14px;font-weight:700;color:#3d2e1a;letter-spacing:0.5px;">🛒 Order Items</span>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr style="background:#faf6ef;">
                    <th style="padding:10px 16px;font-size:11px;color:#9a8468;text-align:left;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Item</th>
                    <th style="padding:10px 16px;font-size:11px;color:#9a8468;text-align:center;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Qty</th>
                    <th style="padding:10px 16px;font-size:11px;color:#9a8468;text-align:center;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Rate</th>
                    <th style="padding:10px 16px;font-size:11px;color:#9a8468;text-align:right;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Amount</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>

              <!-- Bill Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #f0ebe0;">
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#7a6245;">Subtotal</td>
                  <td style="padding:10px 16px;font-size:13px;color:#7a6245;text-align:right;">${formatINR(order.subtotal || order.total)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#7a6245;">Delivery Fee</td>
                  <td style="padding:10px 16px;font-size:13px;color:${order.deliveryFee === 0 ? '#2d6a4f' : '#7a6245'};text-align:right;font-weight:${order.deliveryFee === 0 ? '700' : '400'};">
                    ${order.deliveryFee === 0 ? '🎉 FREE' : formatINR(order.deliveryFee)}
                  </td>
                </tr>
                <tr style="background:#fdf8ef;">
                  <td style="padding:14px 16px;font-size:16px;font-weight:700;color:#3d2e1a;border-top:2px solid #ede8dd;">Total Paid</td>
                  <td style="padding:14px 16px;font-size:20px;font-weight:700;color:#c8922a;text-align:right;border-top:2px solid #ede8dd;">${formatINR(order.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td height="16"></td></tr>

          <!-- Delivery + Payment -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0;">
                <tr>
                  <!-- Delivery Address -->
                  <td width="48%" style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 12px rgba(61,46,26,0.08);border:1px solid #ede8dd;vertical-align:top;">
                    <div style="font-size:11px;color:#9a8468;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">📍 Delivery Address</div>
                    <div style="font-size:14px;font-weight:600;color:#3d2e1a;margin-bottom:4px;">${order.customer.name}</div>
                    <div style="font-size:13px;color:#7a6245;line-height:1.6;">${order.customer.address}</div>
                    <div style="font-size:13px;color:#7a6245;margin-top:6px;">📞 ${order.customer.phone}</div>
                  </td>
                  <td width="4%"></td>
                  <!-- Payment -->
                  <td width="48%" style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 12px rgba(61,46,26,0.08);border:1px solid #ede8dd;vertical-align:top;">
                    <div style="font-size:11px;color:#9a8468;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">💳 Payment</div>
                    <div style="font-size:14px;font-weight:600;color:#3d2e1a;margin-bottom:4px;">${payLabel}</div>
                    <div style="font-size:13px;color:${order.paymentStatus === 'PAID' ? '#2d6a4f' : '#c8922a'};font-weight:600;">
                      ${order.paymentStatus === 'PAID' ? '✅ Payment Received' : '⏳ Payment Pending'}
                    </div>
                    ${order.razorpayPaymentId ? `<div style="font-size:11px;color:#9a8468;margin-top:6px;font-family:monospace;">Txn: ${order.razorpayPaymentId}</div>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${order.notes ? `
          <tr><td height="16"></td></tr>
          <tr>
            <td style="background:#fffbf0;border:1.5px solid #f5dfa0;border-radius:12px;padding:16px 20px;">
              <span style="font-size:12px;color:#9a8468;letter-spacing:1px;text-transform:uppercase;">📝 Your Notes</span>
              <div style="font-size:14px;color:#3d2e1a;margin-top:6px;">${order.notes}</div>
            </td>
          </tr>` : ''}

          <tr><td height="32"></td></tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px;background:#3d2e1a;border-radius:12px;">
              <div style="font-size:13px;color:#c8a96a;margin-bottom:8px;">Questions? Reach us on WhatsApp</div>
              <a href="https://wa.me/${process.env.SHOP_PHONE || '919999999999'}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 24px;border-radius:50px;font-size:13px;font-weight:700;">
                📱 Chat on WhatsApp
              </a>
              <div style="font-size:11px;color:#6b4c2a;margin-top:16px;">© ${new Date().getFullYear()} ${shop}. All rights reserved.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ── OWNER Notification Email ─────────────────────────────────
function buildOwnerHTML(order) {
  const shop = process.env.SHOP_NAME || 'Faneesh Rice Shop';
  const itemRows = buildItemRows(order.items);
  const urgencyColor = order.paymentMethod === 'COD' ? '#e65100' : '#2d6a4f';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>New Order — ${shop} Admin</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a2e;">
    <tr>
      <td align="center" style="padding:28px 24px;">
        <div style="font-size:13px;color:#e94560;letter-spacing:3px;text-transform:uppercase;font-weight:700;">🔔 NEW ORDER ALERT</div>
        <div style="font-size:28px;color:#fff;font-weight:700;margin-top:6px;">${shop}</div>
        <div style="font-size:12px;color:#aaa;margin-top:4px;">Admin Notification System</div>
      </td>
    </tr>
  </table>

  <!-- Urgency Banner -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${urgencyColor};">
    <tr>
      <td align="center" style="padding:18px 24px;">
        <div style="font-size:16px;color:#fff;font-weight:700;">
          ${order.paymentMethod === 'RAZORPAY' ? '💳 ONLINE PAID ORDER — Ready to Process!' : '💵 COD ORDER — Confirm Before Dispatch'}
        </div>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table width="600" style="max-width:600px;width:100%;" cellpadding="0" cellspacing="0">

          <!-- Quick Stats Row -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="30%" style="background:#fff;border-radius:10px;padding:16px;text-align:center;border:1px solid #e0e0e0;">
                    <div style="font-size:22px;font-weight:800;color:#c8922a;">${formatINR(order.total)}</div>
                    <div style="font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">Order Value</div>
                  </td>
                  <td width="3%"></td>
                  <td width="30%" style="background:#fff;border-radius:10px;padding:16px;text-align:center;border:1px solid #e0e0e0;">
                    <div style="font-size:22px;font-weight:800;color:#1565c0;">${order.items.length}</div>
                    <div style="font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">Items</div>
                  </td>
                  <td width="3%"></td>
                  <td width="34%" style="background:${order.paymentStatus === 'PAID' ? '#e8f5e9' : '#fff3e0'};border-radius:10px;padding:16px;text-align:center;border:1.5px solid ${order.paymentStatus === 'PAID' ? '#81c784' : '#ffb74d'};">
                    <div style="font-size:14px;font-weight:800;color:${order.paymentStatus === 'PAID' ? '#2e7d32' : '#e65100'};">
                      ${order.paymentStatus === 'PAID' ? '✅ PAID' : '⏳ PENDING'}
                    </div>
                    <div style="font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">${order.paymentMethod}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td height="16"></td></tr>

          <!-- Order Info -->
          <tr>
            <td style="background:#fff;border-radius:10px;padding:20px;border:1px solid #e0e0e0;">
              <div style="font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;border-bottom:1px solid #f0f0f0;padding-bottom:10px;margin-bottom:14px;">ORDER DETAILS</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#555;width:120px;">Order ID</td>
                  <td style="padding:6px 0;font-size:13px;color:#222;font-weight:700;font-family:monospace;">${order.orderId || order._id}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#555;">Customer</td>
                  <td style="padding:6px 0;font-size:13px;color:#222;font-weight:600;">${order.customer.name}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#555;">Phone</td>
                  <td style="padding:6px 0;font-size:13px;color:#1565c0;font-weight:600;">${order.customer.phone}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#555;">Email</td>
                  <td style="padding:6px 0;font-size:13px;color:#555;">${order.customer.email || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#555;vertical-align:top;">Address</td>
                  <td style="padding:6px 0;font-size:13px;color:#222;">${order.customer.address}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#555;">Placed At</td>
                  <td style="padding:6px 0;font-size:13px;color:#555;">${new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</td>
                </tr>
                ${order.razorpayPaymentId ? `
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#555;">Razorpay ID</td>
                  <td style="padding:6px 0;font-size:12px;color:#555;font-family:monospace;">${order.razorpayPaymentId}</td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

          <tr><td height="16"></td></tr>

          <!-- Items -->
          <tr>
            <td style="background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e0e0e0;">
              <div style="background:#f7f7f7;padding:14px 20px;border-bottom:1px solid #e0e0e0;font-size:13px;font-weight:700;color:#222;">🛒 Items Ordered</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr style="background:#fafafa;">
                    <th style="padding:10px 16px;font-size:11px;color:#888;text-align:left;text-transform:uppercase;letter-spacing:1px;">Item</th>
                    <th style="padding:10px 16px;font-size:11px;color:#888;text-align:center;text-transform:uppercase;letter-spacing:1px;">Qty</th>
                    <th style="padding:10px 16px;font-size:11px;color:#888;text-align:center;text-transform:uppercase;letter-spacing:1px;">Rate</th>
                    <th style="padding:10px 16px;font-size:11px;color:#888;text-align:right;text-transform:uppercase;letter-spacing:1px;">Amount</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
                <tfoot>
                  <tr style="background:#f7f7f7;">
                    <td colspan="3" style="padding:14px 16px;font-size:15px;font-weight:700;color:#222;border-top:2px solid #e0e0e0;">TOTAL</td>
                    <td style="padding:14px 16px;font-size:18px;font-weight:800;color:#c8922a;text-align:right;border-top:2px solid #e0e0e0;">${formatINR(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>

          ${order.notes ? `
          <tr><td height="12"></td></tr>
          <tr>
            <td style="background:#fffde7;border:1.5px solid #ffe082;border-radius:10px;padding:14px 18px;">
              <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">📝 Customer Notes</span>
              <div style="font-size:14px;color:#333;margin-top:6px;">${order.notes}</div>
            </td>
          </tr>` : ''}

          <tr><td height="16"></td></tr>

          <!-- Action Buttons -->
          <tr>
            <td style="background:#1a1a2e;border-radius:10px;padding:20px;text-align:center;">
              <div style="font-size:13px;color:#aaa;margin-bottom:14px;">Take action on this order</div>
              <a href="https://wa.me/${(order.customer.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent('Hello ' + order.customer.name + ', your order ' + (order.orderId || '') + ' has been received by Faneesh Rice Shop. We will confirm it shortly!')}"
                style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 20px;border-radius:50px;font-size:13px;font-weight:700;margin:4px;">
                📱 WhatsApp Customer
              </a>
              <div style="font-size:11px;color:#555;margin-top:12px;">Log in to your admin dashboard to update the order status.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ── Public: sendOrderEmails ───────────────────────────────────
/**
 * Call this after successfully saving an order.
 * Sends to BOTH the customer (if email given) AND the shop owner.
 *
 * @param {Object} order  - The saved Mongoose order document (or plain object)
 */
async function sendOrderEmails(order) {
  // Validate env vars
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email not configured (EMAIL_USER / EMAIL_PASS missing). Skipping email.');
    return;
  }

  const transporter = createTransporter();
  const shop = process.env.SHOP_NAME || 'Faneesh Rice Shop';
  const promises = [];

  // 1️⃣  Customer email (only if they provided one)
  if (order.customer?.email) {
    promises.push(
      transporter.sendMail({
        from: `"${shop}" <${process.env.EMAIL_USER}>`,
        to: order.customer.email,
        subject: `🌾 Order Confirmed! ${order.orderId || ''} — ${shop}`,
        html: buildCustomerHTML(order),
      })
    );
  }

  // 2️⃣  Owner notification (always)
  if (process.env.SHOP_OWNER_EMAIL) {
    promises.push(
      transporter.sendMail({
        from: `"${shop} Alerts" <${process.env.EMAIL_USER}>`,
        to: process.env.SHOP_OWNER_EMAIL,
        subject: `🔔 New Order ${order.orderId || ''} — ${formatINR(order.total)} — ${order.paymentMethod}`,
        html: buildOwnerHTML(order),
      })
    );
  }

  if (!promises.length) return;

  const results = await Promise.allSettled(promises);
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      console.log(`✅ Email ${i + 1} sent: ${r.value.messageId}`);
    } else {
      console.error(`❌ Email ${i + 1} failed:`, r.reason?.message);
    }
  });
}

module.exports = { sendOrderEmails };