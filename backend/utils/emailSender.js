const { Resend } = require('resend');
const EmailLog = require('../models/EmailLog');

// Initialize Resend with the API Key
// Make sure RESEND_API_KEY is present in your .env file
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

async function sendInvoiceEmail(order, pdfBuffer) {
  if (!order.email) {
    console.log(`No email provided for order ${order.orderId}, skipping email.`);
    return;
  }

  try {
    const fromEmail = 'noreply@vexnetwork.fun';
    const { data, error } = await resend.emails.send({
      from: `VexNetwork Store <${fromEmail}>`,
      to: [order.email],
      subject: `Your VexNetwork Receipt - ${order.orderId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #a855f7;">Thank you for your purchase!</h2>
          <p>Hi ${order.realName || order.username},</p>
          <p>Your payment of <strong>INR ${order.amount}</strong> was successful.</p>
          <p>We've attached your official receipt to this email.</p>
          <br/>
          <p>Your items will be delivered automatically to your Minecraft account: <strong>${order.username}</strong>.</p>
          <br/>
          <p>Need help? Join our <a href="https://discord.gg/d6q9ZvC55b">Discord Server</a>.</p>
          <p>Best,<br/>The VexNetwork Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `Receipt_${order.orderId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      await EmailLog.create({
        to: order.email,
        subject: `Your VexNetwork Receipt - ${order.orderId}`,
        orderId: order.orderId,
        status: 'failed',
        error: error.message || JSON.stringify(error)
      });
    } else {
      console.log('Invoice email sent successfully!', data);
      await EmailLog.create({
        to: order.email,
        subject: `Your VexNetwork Receipt - ${order.orderId}`,
        orderId: order.orderId,
        status: 'sent',
        resendId: data.id
      });
    }
  } catch (err) {
    console.error('Exception in emailSender:', err);
    try {
      await EmailLog.create({
        to: order.email,
        subject: `Your VexNetwork Receipt - ${order.orderId}`,
        orderId: order.orderId,
        status: 'failed',
        error: err.message || JSON.stringify(err)
      });
    } catch (dbErr) {
      console.error('Failed to save email log to DB:', dbErr);
    }
  }
}

module.exports = sendInvoiceEmail;
