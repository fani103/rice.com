/**
 * FANEESH RICE SHOP — orderEmailTemplate utility
 * backend/utils/orderEmailTemplate.js
 *
 * Returns a single beautiful HTML email body used for:
 *  - Customer confirmation
 *  - Shop owner notification
 */

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const statusLabel = {
  PLACED: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const payLabel = (method) => {
  if (method === 'RAZORPAY') return '💳 Online (Razorpay)';
  if (method === 'WHATSAPP') return '📱 WhatsApp COD';
  return '💵 Cash on Delivery';
};

function buildItemRows(items) {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0ebe0;font-size:14px;color:#3d2e1a;">${item.name}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0ebe0;font-size:14px;color:#7a6245;text-align:center;">${item.quantity} kg</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0ebe0;font-size:14px;color:#7a6245;text-align:center;">${formatINR(item.pricePerKg)}/kg</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0ebe0;font-size:14px;color:#3d2e1a;font-weight:700;text-align:right;">${formatINR(item.pricePerKg * item.quantity)}</td>
      </tr>`
    )
    .join('');
}

const orderEmailTemplate = (order) => {
  const shop = process.env.SHOP_NAME || 'Faneesh Rice Shop';
  const shopPhone = process.env.SHOP_PHONE || '919999999999';
  const itemRows = buildItemRows(order.items || []);
  const isPaid = order.paymentStatus === 'PAID';
  const isRazorpay = order.paymentMethod === 'RAZORPAY';

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
      <td align="center" style="padding:36px 24px 28px;">
        <div style="font-size:34px;margin-bottom:6px;">🌾</div>
        <div style="font-family:'Georgia',serif;font-size:24px;color:#f5dfa0;letter-spacing:2px;font-weight:700;">${shop}</div>
        <div style="font-size:11px;color:#c8a96a;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Premium Rice Delivered Fresh</div>
      </td>
    </tr>
  </table>

  <!-- Banner -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#c8922a;">
    <tr>
      <td align="center" style="padding:24px;">
        <div style="font-size:28px;margin-bottom:8px;">🎉</div>
        <div style="font-size:20px;color:#fff;font-weight:700;margin-bottom:4px;">Order Confirmed!</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.85);">Thank you, ${order.customer?.name}! We're preparing your order.</div>
      </td>
    </tr>
  </table>

  <!-- Body -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Order ID -->
          <tr>
            <td style="background:#fff;border-radius:12px;padding:20px 24px;box-shadow:0 2px 12px rgba(61,46,26,0.08);border:1px solid #ede8dd;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:11px;color:#9a8468;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Order Reference</div>
                    <div style="font-size:20px;font-weight:700;color:#c8922a;font-family:monospace;">${order.orderId || order._id}</div>
                  </td>
                  <td align="right">
                    <div style="background:#f0f9f4;border:1.5px solid #40916c;border-radius:20px;padding:6px 14px;display:inline-block;">
                      <span style="color:#2d6a4f;font-size:12px;font-weight:600;">✅ ${statusLabel[order.status] || order.status}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:10px;font-size:12px;color:#9a8468;">
                    Placed on ${new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td height="14"></td></tr>

          <!-- Items Table -->
          <tr>
            <td style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(61,46,26,0.08);border:1px solid #ede8dd;">
              <div style="background:#f7f2e8;padding:14px 20px;border-bottom:1px solid #ede8dd;">
                <span style="font-size:13px;font-weight:700;color:#3d2e1a;">🛒 Order Items</span>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr style="background:#faf6ef;">
                    <th style="padding:10px 16px;font-size:11px;color:#9a8468;text-align:left;text-transform:uppercase;letter-spacing:1px;">Item</th>
                    <th style="padding:10px 16px;font-size:11px;color:#9a8468;text-align:center;text-transform:uppercase;letter-spacing:1px;">Qty</th>
                    <th style="padding:10px 16px;font-size:11px;color:#9a8468;text-align:center;text-transform:uppercase;letter-spacing:1px;">Rate</th>
                    <th style="padding:10px 16px;font-size:11px;color:#9a8468;text-align:right;text-transform:uppercase;letter-spacing:1px;">Amount</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>

              <!-- Bill -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #f0ebe0;">
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#7a6245;">Subtotal</td>
                  <td style="padding:10px 16px;font-size:13px;color:#7a6245;text-align:right;">${formatINR(order.subtotal || order.total)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#7a6245;">Delivery Fee</td>
                  <td style="padding:10px 16px;font-size:13px;text-align:right;color:${order.deliveryFee === 0 ? '#2d6a4f' : '#7a6245'};font-weight:${order.deliveryFee === 0 ? '700' : '400'};">
                    ${order.deliveryFee === 0 ? '🎉 FREE' : formatINR(order.deliveryFee)}
                  </td>
                </tr>
                <tr style="background:#fdf8ef;">
                  <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#3d2e1a;border-top:2px solid #ede8dd;">Total</td>
                  <td style="padding:14px 16px;font-size:18px;font-weight:700;color:#c8922a;text-align:right;border-top:2px solid #ede8dd;">${formatINR(order.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td height="14"></td></tr>

          <!-- Delivery + Payment side by side -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 2px 12px rgba(61,46,26,0.08);border:1px solid #ede8dd;vertical-align:top;">
                    <div style="font-size:11px;color:#9a8468;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">📍 Delivery Address</div>
                    <div style="font-size:14px;font-weight:600;color:#3d2e1a;margin-bottom:4px;">${order.customer?.name}</div>
                    <div style="font-size:13px;color:#7a6245;line-height:1.6;">${order.customer?.address}</div>
                    <div style="font-size:13px;color:#7a6245;margin-top:6px;">📞 ${order.customer?.phone}</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 2px 12px rgba(61,46,26,0.08);border:1px solid #ede8dd;vertical-align:top;">
                    <div style="font-size:11px;color:#9a8468;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">💳 Payment</div>
                    <div style="font-size:13px;font-weight:600;color:#3d2e1a;margin-bottom:6px;">${payLabel(order.paymentMethod)}</div>
                    <div style="font-size:13px;color:${isPaid ? '#2d6a4f' : '#c8922a'};font-weight:600;">
                      ${isPaid ? '✅ Payment Received' : '⏳ Pay on Delivery'}
                    </div>
                    ${order.razorpayPaymentId ? `<div style="font-size:11px;color:#9a8468;margin-top:6px;font-family:monospace;">Txn: ${order.razorpayPaymentId}</div>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${order.notes ? `
          <tr><td height="14"></td></tr>
          <tr>
            <td style="background:#fffbf0;border:1.5px solid #f5dfa0;border-radius:12px;padding:14px 18px;">
              <div style="font-size:11px;color:#9a8468;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">📝 Notes</div>
              <div style="font-size:13px;color:#3d2e1a;">${order.notes}</div>
            </td>
          </tr>` : ''}

          <tr><td height="28"></td></tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 24px;background:#3d2e1a;border-radius:12px;">
              <div style="font-size:13px;color:#c8a96a;margin-bottom:10px;">Questions? Chat with us on WhatsApp</div>
              <a href="https://wa.me/${shopPhone}"
                style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 24px;border-radius:50px;font-size:13px;font-weight:700;">
                📱 WhatsApp Us
              </a>
              <div style="font-size:11px;color:#6b4c2a;margin-top:14px;">© ${new Date().getFullYear()} ${shop}. All rights reserved.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};

module.exports = orderEmailTemplate;