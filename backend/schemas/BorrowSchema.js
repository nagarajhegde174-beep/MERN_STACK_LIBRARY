const { Schema } = require("mongoose");

const BorrowSchema = new Schema(
  {
    bookId:     { type: Schema.Types.ObjectId, ref: "Book", required: true },
    userId:     { type: Schema.Types.ObjectId, ref: "User", required: true },
    issueDate:  { type: Date, default: Date.now },
    dueDate:    { type: Date, required: true },
    returnDate: { type: Date, default: null },
    fineAmount: { type: Number, default: 0 },
    status: {
      type: String,
      // Updated: added specific rejected statuses
      enum: ["Requested", "Issued", "Rejected", "Requested Return", "Returned", "borrow_rejected", "return_rejected", "renewal_rejected"],
      default: "Requested",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

    // ── NEW: Rejection fields ─────────────────────────────────────────────
    rejectedBy:      { type: Schema.Types.ObjectId, ref: "User", default: null },
    rejectionReason: { type: String, default: "" },

    // ── NEW: Overdue email tracking (prevent duplicate sends) ─────────────
    overduEmailSentAt:     { type: Date, default: null },  // first overdue email
    escalationEmailSentAt: { type: Date, default: null },  // 10-day escalation email

    // ── NEW: Mark forced-pending returns (account expired) ────────────────
    forcedReturnPending: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = { BorrowSchema };
