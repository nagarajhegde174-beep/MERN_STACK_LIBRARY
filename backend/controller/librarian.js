const mongoose = require("mongoose");
const { BorrowModel } = require("../model/BorrowModel");
const { BookModel }   = require("../model/BookModel");
const { UserModel }   = require("../model/UserModel");
const calculateFine   = require("../utils/fineCalculator");
const { clearCache }  = require("../utils/cache");
const {
  sendEmail,
  bookApprovedTemplate,
  bookRejectedTemplate,
} = require("../utils/emailService");

const librarianController = {};

// ── GET: All Issued Books ────────────────────────────────────────────────────
librarianController.bookIssued = async (req, res) => {
  try {
    const requests = await BorrowModel.find({ status: "Issued" })
      .populate("userId", "name email year stream")
      .populate("bookId", "title coverImage category")
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "Issued books fetched successfully", requests });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ── GET: Pending Issue Requests ──────────────────────────────────────────────
librarianController.issueRequest = async (req, res) => {
  try {
    const requests = await BorrowModel.find({ status: "Requested" })
      .populate("userId", "name email year stream isRestricted accountExpired")
      .populate("bookId", "title coverImage category")
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "Issue requests fetched successfully", requests });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ── PUT: APPROVE request — now requires dueDate in body ─────────────────────
librarianController.approveRequest = async (req, res) => {
  try {
    const borrowId = req.params.id;
    const { dueDate } = req.body; // ← REQUIRED from frontend

    if (!mongoose.Types.ObjectId.isValid(borrowId))
      return res.status(400).json({ message: "Invalid borrow id" });

    // Validate dueDate
    if (!dueDate)
      return res.status(400).json({ message: "Due date is required to approve a request" });

    const parsedDue = new Date(dueDate);
    if (isNaN(parsedDue.getTime()))
      return res.status(400).json({ message: "Invalid due date format" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDue <= today)
      return res.status(400).json({ message: "Due date must be a future date" });

    const borrow = await BorrowModel.findById(borrowId).populate("userId", "name email isRestricted");
    if (!borrow) return res.status(404).json({ message: "Borrow request not found" });
    if (borrow.status !== "Requested")
      return res.status(400).json({ message: `Cannot approve a request with status "${borrow.status}"` });

    // Block if user is restricted (overdue)
    if (borrow.userId?.isRestricted)
      return res.status(403).json({ message: "User is restricted due to overdue books. Cannot approve new request." });

    // Max 4 books per user
    const issuedCount = await BorrowModel.countDocuments({ userId: borrow.userId, status: "Issued" });
    if (issuedCount >= 4)
      return res.status(400).json({ message: "User already has 4 issued books" });

    const book = await BookModel.findById(borrow.bookId);
    if (!book || book.availableCopies < 1)
      return res.status(400).json({ message: "Book not available" });

    borrow.status    = "Issued";
    borrow.issueDate = new Date();
    borrow.dueDate   = parsedDue;               // ← manual due date
    borrow.approvedBy = req.userInfo?.id || null;
    await borrow.save();

    await BookModel.updateOne({ _id: book._id }, { $inc: { availableCopies: -1 } });
    clearCache("homeData");

    // Send approval email (non-blocking)
    try {
      const user = await UserModel.findById(borrow.userId);
      const tpl  = bookApprovedTemplate({ userName: user.name, bookTitle: book.title, dueDate: parsedDue });
      await sendEmail(user.email, tpl.subject, tpl.html);
    } catch (mailErr) {
      console.warn("Approval email failed:", mailErr.message);
    }

    res.status(200).json({ message: "Book issued successfully", borrow });
  } catch (err) {
    console.error("approveRequest ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── PUT: REJECT request — new endpoint ──────────────────────────────────────
librarianController.rejectRequest = async (req, res) => {
  try {
    const borrowId = req.params.id;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(borrowId))
      return res.status(400).json({ message: "Invalid borrow id" });

    if (!reason || String(reason).trim() === "")
      return res.status(400).json({ message: "Rejection reason is required" });

    const borrow = await BorrowModel.findById(borrowId).populate("userId", "name email");
    if (!borrow) return res.status(404).json({ message: "Borrow request not found" });
    if (borrow.status !== "Requested")
      return res.status(400).json({ message: `Cannot reject a request with status "${borrow.status}"` });

    borrow.status          = "borrow_rejected";
    borrow.rejectedBy      = req.userInfo?.id || null;
    borrow.rejectionReason = String(reason).trim();
    await borrow.save();

    // Send rejection email (non-blocking)
    try {
      const book = await BookModel.findById(borrow.bookId);
      const tpl  = bookRejectedTemplate({
        userName:  borrow.userId.name,
        bookTitle: book?.title || "Unknown",
        reason:    borrow.rejectionReason,
      });
      await sendEmail(borrow.userId.email, tpl.subject, tpl.html);
    } catch (mailErr) {
      console.warn("Rejection email failed:", mailErr.message);
    }

    res.status(200).json({ message: "Request rejected successfully" });
  } catch (err) {
    console.error("rejectRequest ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── GET: Pending Return Requests ─────────────────────────────────────────────
librarianController.returnRequest = async (req, res) => {
  try {
    const requests = await BorrowModel.find({ status: "Requested Return" })
      .populate("userId", "name email")
      .populate("bookId", "title coverImage category")
      .sort({ createdAt: -1 });

    const requestsWithFine = requests.map((item) => {
      const fine = calculateFine(item.dueDate, item.returnDate);
      return { ...item.toObject(), fine };
    });

    res.status(200).json({ message: "Return requests fetched successfully", requests: requestsWithFine });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ── PUT: APPROVE return request ──────────────────────────────────────────────
librarianController.approveReturnRequest = async (req, res) => {
  try {
    const borrowId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(borrowId))
      return res.status(400).json({ message: "Invalid borrow id" });

    const borrow = await BorrowModel.findById(borrowId).populate("userId");
    if (!borrow) return res.status(404).json({ message: "Borrow record not found" });
    if (borrow.status !== "Requested Return")
      return res.status(400).json({ message: "Book return not requested or already processed" });

    // Restore book copy
    const book = await BookModel.findById(borrow.bookId);
    if (book && book.availableCopies < book.totalCopies) {
      book.availableCopies += 1;
      await book.save();
    }

    borrow.status     = "Returned";
    borrow.returnDate = new Date();
    borrow.approvedBy = req.userInfo?.id || null;

    // Save final fine to FineModel if overdue
    const { FineModel } = require("../model/FineModel");
    const { FineConfigModel } = require("../model/FineConfigModel");
    const calculateFine = require("../utils/fineCalculator");
    
    const config = (await FineConfigModel.findOne()) || { ratePerDay: 10, maxFineCap: 500, gracePeriod: 0 };
    const finalFine = calculateFine(borrow.dueDate, borrow.returnDate, config.ratePerDay, config.maxFineCap, config.gracePeriod);
    borrow.fineAmount = finalFine;
    
    await borrow.save();

    if (finalFine > 0) {
      const daysOverdue = Math.max(0, Math.ceil((new Date(borrow.returnDate) - new Date(borrow.dueDate)) / (1000*60*60*24)) - config.gracePeriod);
      await FineModel.findOneAndUpdate(
        { borrowId: borrow._id },
        {
          memberId: borrow.userId,
          borrowId: borrow._id,
          bookId: borrow.bookId,
          amount: finalFine,
          daysOverdue,
          ratePerDay: config.ratePerDay
        },
        { upsert: true }
      );
    }

    // ── Auto-lift restriction if no more overdue books ────────────────────
    const user = await UserModel.findById(borrow.userId._id || borrow.userId);
    if (user && user.isRestricted) {
      const overdueCount = await BorrowModel.countDocuments({
        userId: user._id,
        status: "Issued",
        dueDate: { $lt: new Date() },
      });
      if (overdueCount === 0) {
        user.isRestricted     = false;
        user.restrictionReason = "";
        await user.save();
      }
    }

    clearCache("homeData");
    res.status(200).json({ message: "Book return approved successfully" });
  } catch (err) {
    console.error("approveReturnRequest ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── PUT: REJECT return request ──────────────────────────────────────────────
librarianController.rejectReturnRequest = async (req, res) => {
  try {
    const borrowId = req.params.id;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(borrowId))
      return res.status(400).json({ message: "Invalid borrow id" });

    if (!reason || String(reason).trim() === "")
      return res.status(400).json({ message: "Rejection reason is required" });

    const borrow = await BorrowModel.findById(borrowId).populate("userId", "name email");
    if (!borrow) return res.status(404).json({ message: "Borrow record not found" });
    if (borrow.status !== "Requested Return")
      return res.status(400).json({ message: "Book return not requested or already processed" });

    // Mark as return_rejected
    borrow.status          = "return_rejected";
    borrow.rejectedBy      = req.userInfo?.id || null;
    borrow.rejectionReason = String(reason).trim();
    await borrow.save();

    // Optionally send email notification (non-blocking)
    try {
      const book = await BookModel.findById(borrow.bookId);
      const tpl  = bookRejectedTemplate({
        userName:  borrow.userId.name,
        bookTitle: book?.title || "Unknown",
        reason:    borrow.rejectionReason,
      });
      await sendEmail(borrow.userId.email, "Return Request Rejected", tpl.html);
    } catch (mailErr) {
      console.warn("Rejection email failed:", mailErr.message);
    }

    res.status(200).json({ message: "Return request rejected successfully" });
  } catch (err) {
    console.error("rejectReturnRequest ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── PUT: DIRECT RETURN ───────────────────────────────────────────────────────
librarianController.directReturn = async (req, res) => {
  try {
    const borrowId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(borrowId))
      return res.status(400).json({ message: "Invalid borrow id" });

    const borrow = await BorrowModel.findById(borrowId).populate("userId");
    if (!borrow) return res.status(404).json({ message: "Borrow record not found" });
    
    if (borrow.status === "Returned")
      return res.status(400).json({ message: "This book has already been returned" });
    
    if (borrow.status !== "Issued")
      return res.status(400).json({ message: `Cannot return a book with status "${borrow.status}". It must be Issued.` });

    const book = await BookModel.findById(borrow.bookId);
    if (book && book.availableCopies < book.totalCopies) {
      book.availableCopies += 1;
      await book.save();
    }

    borrow.status     = "Returned";
    borrow.returnDate = new Date();
    borrow.approvedBy = req.userInfo?.id || null;

    // Calculate fine if overdue
    const { FineModel } = require("../model/FineModel");
    const { FineConfigModel } = require("../model/FineConfigModel");
    const calculateFine = require("../utils/fineCalculator");
    
    const config = (await FineConfigModel.findOne()) || { ratePerDay: 10, maxFineCap: 500, gracePeriod: 0 };
    const finalFine = calculateFine(borrow.dueDate, borrow.returnDate, config.ratePerDay, config.maxFineCap, config.gracePeriod);
    borrow.fineAmount = finalFine;
    
    await borrow.save();

    if (finalFine > 0) {
      const daysOverdue = Math.max(0, Math.ceil((new Date(borrow.returnDate) - new Date(borrow.dueDate)) / (1000*60*60*24)) - config.gracePeriod);
      await FineModel.findOneAndUpdate(
        { borrowId: borrow._id },
        {
          memberId: borrow.userId,
          borrowId: borrow._id,
          bookId: borrow.bookId,
          amount: finalFine,
          daysOverdue,
          ratePerDay: config.ratePerDay
        },
        { upsert: true }
      );
    }

    // Auto-lift restriction if no more overdue books
    const user = await UserModel.findById(borrow.userId._id || borrow.userId);
    if (user && user.isRestricted) {
      const overdueCount = await BorrowModel.countDocuments({
        userId: user._id,
        status: "Issued",
        dueDate: { $lt: new Date() },
      });
      if (overdueCount === 0) {
        user.isRestricted     = false;
        user.restrictionReason = "";
        await user.save();
      }
    }

    clearCache("homeData");
    res.status(200).json({ message: "Book forcefully returned successfully" });
  } catch (err) {
    console.error("directReturn ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { librarianController };
