/**
 * emailService.js
 * Centralised Nodemailer helper + email templates.
 * All templates are functions returning { subject, html }.
 */

const nodemailer = require("nodemailer");

// ── Transporter ──────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",                     // change to your SMTP if needed
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,       // use App Password for Gmail
  },
});

/**
 * Send an email.
 * @param {string} to      - recipient email
 * @param {string} subject - email subject
 * @param {string} html    - HTML body
 */
async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: `"Library Management System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
}

// ── Email Templates ──────────────────────────────────────────────────────────

/** Called when a book is approved with a due date */
function bookApprovedTemplate({ userName, bookTitle, dueDate }) {
  return {
    subject: `📚 Book Issued: ${bookTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
        <div style="background:#2563eb;padding:20px;text-align:center">
          <h2 style="color:#fff;margin:0">Library Management System</h2>
        </div>
        <div style="padding:24px">
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Your book request has been <span style="color:#16a34a;font-weight:bold">approved</span>.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr style="background:#f3f4f6">
              <td style="padding:10px;font-weight:bold;border:1px solid #e5e7eb">Book Title</td>
              <td style="padding:10px;border:1px solid #e5e7eb">${bookTitle}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:bold;border:1px solid #e5e7eb">Due Date</td>
              <td style="padding:10px;border:1px solid #e5e7eb;color:#dc2626"><strong>${new Date(dueDate).toDateString()}</strong></td>
            </tr>
          </table>
          <p style="color:#6b7280;font-size:14px">Please return the book on or before the due date to avoid fines.</p>
        </div>
        <div style="background:#f9fafb;padding:12px;text-align:center;font-size:12px;color:#9ca3af">
          Library Management System &bull; Automated Notification
        </div>
      </div>`,
  };
}

/** Called when a book request is rejected */
function bookRejectedTemplate({ userName, bookTitle, reason }) {
  return {
    subject: `Book Request Rejected: ${bookTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
        <div style="background:#dc2626;padding:20px;text-align:center">
          <h2 style="color:#fff;margin:0">Library Management System</h2>
        </div>
        <div style="padding:24px">
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Unfortunately your request for <strong>"${bookTitle}"</strong> has been <span style="color:#dc2626;font-weight:bold">rejected</span>.</p>
          <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;margin:16px 0;border-radius:4px">
            <strong>Reason:</strong> ${reason || "No reason provided."}
          </div>
          <p style="color:#6b7280;font-size:14px">You may contact the librarian for more information or try requesting another book.</p>
        </div>
        <div style="background:#f9fafb;padding:12px;text-align:center;font-size:12px;color:#9ca3af">
          Library Management System &bull; Automated Notification
        </div>
      </div>`,
  };
}

/** Called by cron job when book is overdue (day 1+) */
function overdueWarningTemplate({ userName, bookTitle, dueDate, overdueDays, fineAmount }) {
  return {
    subject: `⚠️ Overdue Book: ${bookTitle} — Fine Started`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
        <div style="background:#f59e0b;padding:20px;text-align:center">
          <h2 style="color:#fff;margin:0">⚠️ Overdue Notice</h2>
        </div>
        <div style="padding:24px">
          <p>Dear <strong>${userName}</strong>,</p>
          <p>The following book is <strong style="color:#dc2626">overdue</strong> and a fine has started accumulating.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr style="background:#f3f4f6">
              <td style="padding:10px;font-weight:bold;border:1px solid #e5e7eb">Book Title</td>
              <td style="padding:10px;border:1px solid #e5e7eb">${bookTitle}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:bold;border:1px solid #e5e7eb">Due Date</td>
              <td style="padding:10px;border:1px solid #e5e7eb">${new Date(dueDate).toDateString()}</td>
            </tr>
            <tr style="background:#fef2f2">
              <td style="padding:10px;font-weight:bold;border:1px solid #e5e7eb">Overdue Days</td>
              <td style="padding:10px;border:1px solid #e5e7eb;color:#dc2626"><strong>${overdueDays} day(s)</strong></td>
            </tr>
            <tr style="background:#fef2f2">
              <td style="padding:10px;font-weight:bold;border:1px solid #e5e7eb">Current Fine</td>
              <td style="padding:10px;border:1px solid #e5e7eb;color:#dc2626"><strong>₹${fineAmount}</strong></td>
            </tr>
          </table>
          <p>Please return the book <strong>immediately</strong> to stop the fine from increasing.</p>
        </div>
        <div style="background:#f9fafb;padding:12px;text-align:center;font-size:12px;color:#9ca3af">
          Library Management System &bull; Automated Notification
        </div>
      </div>`,
  };
}

/** Called by cron job when book is 10+ days overdue (escalation) */
function escalationWarningTemplate({ userName, bookTitle, dueDate, overdueDays, fineAmount }) {
  return {
    subject: `🚨 URGENT: ${overdueDays}-Day Overdue — Notice Board Warning`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
        <div style="background:#dc2626;padding:20px;text-align:center">
          <h2 style="color:#fff;margin:0">🚨 ESCALATION NOTICE</h2>
        </div>
        <div style="padding:24px">
          <p>Dear <strong>${userName}</strong>,</p>
          <div style="background:#fef2f2;border:2px solid #dc2626;padding:16px;border-radius:6px;margin:16px 0">
            <p style="margin:0;color:#dc2626;font-weight:bold;font-size:16px">
              ⚠️ Your name may appear on the NOTICE BOARD with the fine amount if the book is not returned immediately.
            </p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr style="background:#f3f4f6">
              <td style="padding:10px;font-weight:bold;border:1px solid #e5e7eb">Book Title</td>
              <td style="padding:10px;border:1px solid #e5e7eb">${bookTitle}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:bold;border:1px solid #e5e7eb">Due Date</td>
              <td style="padding:10px;border:1px solid #e5e7eb">${new Date(dueDate).toDateString()}</td>
            </tr>
            <tr style="background:#fef2f2">
              <td style="padding:10px;font-weight:bold;border:1px solid #e5e7eb">Days Overdue</td>
              <td style="padding:10px;border:1px solid #e5e7eb;color:#dc2626"><strong>${overdueDays} day(s)</strong></td>
            </tr>
            <tr style="background:#fef2f2">
              <td style="padding:10px;font-weight:bold;border:1px solid #e5e7eb">Total Fine</td>
              <td style="padding:10px;border:1px solid #e5e7eb;color:#dc2626"><strong>₹${fineAmount}</strong></td>
            </tr>
          </table>
          <p>Contact the library <strong>today</strong> to return the book and settle your fine.</p>
        </div>
        <div style="background:#f9fafb;padding:12px;text-align:center;font-size:12px;color:#9ca3af">
          Library Management System &bull; Automated Notification
        </div>
      </div>`,
  };
}

/** Called when account is nearing expiry */
function accountExpiryWarningTemplate({ userName, endDate }) {
  return {
    subject: `📅 Library Account Expiring Soon`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
        <div style="background:#7c3aed;padding:20px;text-align:center">
          <h2 style="color:#fff;margin:0">Account Expiry Notice</h2>
        </div>
        <div style="padding:24px">
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Your library account will <strong style="color:#dc2626">expire on ${new Date(endDate).toDateString()}</strong>.</p>
          <p>Please ensure all borrowed books are returned before the expiry date.</p>
          <p>Contact the library to renew your membership.</p>
        </div>
        <div style="background:#f9fafb;padding:12px;text-align:center;font-size:12px;color:#9ca3af">
          Library Management System &bull; Automated Notification
        </div>
      </div>`,
  };
}

module.exports = {
  sendEmail,
  bookApprovedTemplate,
  bookRejectedTemplate,
  overdueWarningTemplate,
  escalationWarningTemplate,
  accountExpiryWarningTemplate,
};
