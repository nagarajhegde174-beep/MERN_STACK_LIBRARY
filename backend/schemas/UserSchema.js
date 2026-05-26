const { Schema } = require("mongoose");

function generateMembershipId() {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LIB-${ymd}-${rand}`;
}

const UserSchema = new Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  role:         { type: String, enum: ["admin","librarian","user"], default: "user" },
  status:       { type: String, enum: ["Active","Inactive"], default: "Active" },
  membershipId: { type: String, unique: true, sparse: true },
  stream:       { type: String, required: function(){ return this.role === "user"; } },
  year:         { type: Number, required: function(){ return this.role === "user"; } },
  profilePicture: { type: String, default: "" },
  cloudinaryId:   { type: String, default: "" },

  // ── NEW: Account Validity ──────────────────────────────────────────────────
  accountStartDate: { type: Date, default: null },   // set by admin when creating/editing
  accountEndDate:   { type: Date, default: null },   // after this date account becomes inactive
  accountExpired:   { type: Boolean, default: false },// flag set by cron job

  // ── NEW: Overdue Restriction ───────────────────────────────────────────────
  isRestricted:     { type: Boolean, default: false },// true = blocked from new requests/issues
  restrictionReason:{ type: String,  default: "" },   // e.g. "Overdue: Book Title"

  // ── NEW: Email Escalation Tracking ────────────────────────────────────────
  // Stored per-borrow in BorrowSchema, but user-level flag to avoid spam
  lastOverdueEmailAt:    { type: Date, default: null },
  lastEscalationEmailAt: { type: Date, default: null },

}, { timestamps: true });

UserSchema.pre("save", async function() {
  if (this.role === "user" && !this.membershipId) {
    this.membershipId = generateMembershipId();
  }
});

module.exports = { UserSchema };
