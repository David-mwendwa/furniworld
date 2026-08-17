import { formatKes } from './money.js';

const shell = (body) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#2A1B13;line-height:1.6">
    ${body}
    <hr style="border:none;border-top:1px solid #E5D3C2;margin:32px 0 16px" />
    <p style="color:#8A5A3B;font-size:12px">
      Furniworld · Mombasa Road, Nairobi · hello@furniworld.ke
    </p>
  </div>
`;

const itemRows = (order) =>
  order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:6px 0">${item.name} × ${item.quantity}</td>
        <td style="padding:6px 0;text-align:right">${formatKes(item.lineTotal)}</td>
      </tr>`
    )
    .join('');

export const paymentConfirmedEmail = ({ order, amount, reference }) => ({
  subject: `Payment received for ${order.orderNumber}`,
  html: shell(`
    <h2 style="font-weight:600;margin:0 0 16px">Payment received</h2>
    <p>Hi ${order.shippingAddress.fullName.split(' ')[0]},</p>
    <p>
      We've matched your payment of <strong>${formatKes(amount)}</strong> against
      order <strong>${order.orderNumber}</strong> and it is now being prepared.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0">
      ${itemRows(order)}
      <tr>
        <td style="padding:10px 0 0;border-top:1px solid #E5D3C2"><strong>Total</strong></td>
        <td style="padding:10px 0 0;border-top:1px solid #E5D3C2;text-align:right"><strong>${formatKes(order.total)}</strong></td>
      </tr>
    </table>
    <p style="font-size:14px;color:#6F4830">
      Reference on file: <span style="font-family:monospace">${reference}</span>
    </p>
    <p>We'll be in touch on ${order.shippingAddress.phone} before the driver sets off.</p>
  `),
});

/** Goes to whoever actually subscribed — the account that's signed in, or
 * the address they typed, never a fixed staff inbox. */
export const subscriptionConfirmedEmail = ({ email }) => ({
  subject: "You're on the list",
  html: shell(`
    <h2 style="font-weight:600;margin:0 0 16px">You're on the list</h2>
    <p>Hi,</p>
    <p>
      <strong>${email}</strong> is now subscribed to new arrivals and the sales
      worth knowing about. One email a month, nothing else.
    </p>
    <p style="font-size:14px;color:#6F4830">
      Signed in? You can turn this off any time from your account.
    </p>
  `),
});

export const paymentRejectedEmail = ({ order, reason }) => ({
  subject: `We couldn't match your payment for ${order.orderNumber}`,
  html: shell(`
    <h2 style="font-weight:600;margin:0 0 16px">We couldn't match that payment</h2>
    <p>Hi ${order.shippingAddress.fullName.split(' ')[0]},</p>
    <p>
      We looked for your payment against order
      <strong>${order.orderNumber}</strong> and could not find it. Here is what
      our team noted:
    </p>
    <blockquote style="margin:16px 0;padding:12px 16px;background:#FAF6F2;border-left:3px solid #A5734F;font-size:14px">
      ${reason}
    </blockquote>
    <p>
      Your order is still reserved — nothing has been cancelled. If you have the
      correct transaction code, send it to us from your order page and we'll check
      again.
    </p>
    <p style="font-size:14px;color:#6F4830">
      Amount outstanding: <strong>${formatKes(order.total)}</strong>
    </p>
  `),
});
