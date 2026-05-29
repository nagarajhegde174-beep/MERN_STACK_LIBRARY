const { UserModel }       = require("../model/UserModel");
const { FineConfigModel } = require("../model/FineConfigModel");
const { BorrowModel }     = require("../model/BorrowModel");
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");

const adminController = {};


adminController.login = async (req, res) => {
  try {
    const email    = String(req.body?.email    || "").trim().toLowerCase();
    const password = String(req.body?.password || "").trim();
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const envEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const envPass  = (process.env.ADMIN_PASSWORD || "").trim();
    if (envEmail && envPass && email === envEmail && password === envPass) {
      // Always fetch from DB so we get the real _id for addedBy references
      const envAdmin = await UserModel.findOne({ email: { $regex: `^${email}$`, $options: "i" } });
      const adminId  = envAdmin ? envAdmin._id : null;
      const adminName = envAdmin ? envAdmin.name : "Admin";
      if (!adminId) {
        // Admin exists in .env but NOT in DB yet — guide them to run seedAdmin.js
        return res.status(500).json({ message: "Admin user not found in database. Please run: node seedAdmin.js" });
      }
      const token = jwt.sign(
        { id: adminId, email, role: "admin", name: adminName },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      return res.json({ message: "Login successful", token, user: { name: adminName, email, role: "admin" } });
    }

    const user = await UserModel.findOne({ email: { $regex: `^${email}$`, $options: "i" } });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });
    if (!["admin","librarian"].includes(user.role))
      return res.status(403).json({ message: "Access denied." });
    if (user.status === "Inactive")
      return res.status(403).json({ message: "Account deactivated. Contact admin." });

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET, { expiresIn: "24h" }
    );
    return res.json({ message: "Login successful", token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

adminController.addLibrarian = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normEmail = String(email || "").trim().toLowerCase();
    const existing = await UserModel.findOne({
      email: { $regex: `^${normEmail}$`, $options: "i" },
    });
    if (existing) return res.status(400).json({ message: "Email already exists" });
    const hashedPassword = await bcrypt.hash(String(password || ""), 10);
    
    let profilePicture = "";
    let cloudinaryId = "";
    if (req.file) {
      profilePicture = req.file.path;
      cloudinaryId = req.file.filename;
    }

    const user = new UserModel({ name, email: normEmail, password: hashedPassword, role, profilePicture, cloudinaryId });
    await user.save();
    res.status(201).json({ message: "Librarian added successfully" });
  } catch (error) {
    console.error("ADD LIBRARIAN ERROR:", error);
    res.status(500).json({ message: "Internal Server Error: " + error.message });
  }
};

adminController.getLibrarians = async (req, res) => {
  try {
    const librarians = await UserModel.find({ role: "librarian" }, "-password").sort({ createdAt: -1 });
    res.status(200).json({ error: false, librarians, total: librarians.length });
  } catch (err) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

adminController.deleteLibrarian = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user || user.role !== "librarian")
      return res.status(404).json({ message: "Librarian not found" });
    await UserModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Librarian deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

adminController.getMembers = async (req, res) => {
  try {
    const members = await UserModel.find({ role: "user" }, "-password").sort({ createdAt: -1 });
    res.status(200).json({ error: false, members, total: members.length });
  } catch (err) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

adminController.toggleUserStatus = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Cannot change admin status" });
    user.status = user.status === "Active" ? "Inactive" : "Active";
    await user.save();
    res.status(200).json({ message: `User ${user.status === "Active" ? "activated" : "deactivated"} successfully`, status: user.status });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

adminController.getMemberBorrowHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await BorrowModel.find({ userId: id })
      .populate("bookId", "title author isbn coverImage")
      .sort({ issueDate: -1 });
    const member = await UserModel.findById(id, "-password");
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.status(200).json({ error: false, member, history });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

adminController.getFineConfig = async (req, res) => {
  try {
    let config = await FineConfigModel.findOne();
    if (!config) config = await FineConfigModel.create({});
    res.status(200).json({ error: false, config });
  } catch (err) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

adminController.updateFineConfig = async (req, res) => {
  try {
    const { ratePerDay, maxFineCap, gracePeriod } = req.body;
    let config = await FineConfigModel.findOne();
    if (!config) config = new FineConfigModel();
    if (ratePerDay  !== undefined) config.ratePerDay  = ratePerDay;
    if (maxFineCap  !== undefined) config.maxFineCap  = maxFineCap;
    if (gracePeriod !== undefined) config.gracePeriod = gracePeriod;
    config.updatedBy = req.userInfo.id;
    await config.save();
    res.status(200).json({ error: false, message: "Fine configuration updated.", config });
  } catch (err) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ── NEW: Set Account Validity (start + end date) ─────────────────────────────
adminController.setAccountValidity = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountStartDate, accountEndDate } = req.body;

    if (!accountEndDate)
      return res.status(400).json({ message: "Account end date is required" });

    const endDate = new Date(accountEndDate);
    if (isNaN(endDate.getTime()))
      return res.status(400).json({ message: "Invalid end date" });

    const startDate = accountStartDate ? new Date(accountStartDate) : new Date();
    if (accountStartDate && startDate >= endDate)
      return res.status(400).json({ message: "Start date must be before end date" });

    const user = await UserModel.findById(id);
    if (!user || user.role !== "user")
      return res.status(404).json({ message: "Member not found" });

    user.accountStartDate = startDate;
    user.accountEndDate   = endDate;
    user.accountExpired   = false;           // reset expired flag
    user.status           = "Active";        // re-activate if was expired
    await user.save();

    res.status(200).json({ message: "Account validity updated", user });
  } catch (err) {
    console.error("setAccountValidity ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── NEW: Dashboard Stats for admin panel ─────────────────────────────────────
adminController.dashboardStats = async (req, res) => {
  try {
    const { FineModel } = require("../model/FineModel");
    const { ReservationModel } = require("../model/ReservationModel");
    const { UserModel } = require("../model/UserModel");

    const now = new Date();

    const overdueBooks = await BorrowModel.countDocuments({
      status: { $in: ["Issued", "Requested Return"] },
      dueDate: { $lt: now },
    });

    const unpaidFines = await FineModel.countDocuments({ paidStatus: false });

    const pendingReturns = await BorrowModel.countDocuments({
      status: "Requested Return",
    });

    let pendingReservations = 0;
    try {
      pendingReservations = await ReservationModel.countDocuments({
        status: "Pending",
      });
    } catch (_) {}

    // --- Dynamic Chart Data Calculations ---

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const last6MonthsLabels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6MonthsLabels.push(monthNames[d.getMonth()]);
    }

    const getMonthIndex = (date) => {
      const d = new Date(date);
      const monthsDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      return 5 - monthsDiff;
    };

    // 1. Borrow Activity
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const recentBorrows = await BorrowModel.find({ createdAt: { $gte: sixMonthsAgo } });
    const monthlyBorrows = [0, 0, 0, 0, 0, 0];
    recentBorrows.forEach(b => {
      const idx = getMonthIndex(b.createdAt);
      if (idx >= 0 && idx < 6) monthlyBorrows[idx]++;
    });

    // 2. Members Growth
    const recentMembers = await UserModel.find({ createdAt: { $gte: sixMonthsAgo }, role: "user" });
    const initialMembers = await UserModel.countDocuments({ createdAt: { $lt: sixMonthsAgo }, role: "user" });
    let currentTotal = initialMembers;
    const membersByMonth = [0, 0, 0, 0, 0, 0];
    recentMembers.forEach(m => {
      const idx = getMonthIndex(m.createdAt);
      if (idx >= 0 && idx < 6) membersByMonth[idx]++;
    });
    const monthlyMembers = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 6; i++) {
      currentTotal += membersByMonth[i];
      monthlyMembers[i] = currentTotal;
    }

    // 3. Fine Analytics (Last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(now.getDate() - 28);
    const recentFines = await FineModel.find({ date: { $gte: fourWeeksAgo } });
    const weeklyFines = [0, 0, 0, 0];
    recentFines.forEach(f => {
      const daysDiff = Math.floor((now - new Date(f.date)) / (1000 * 60 * 60 * 24));
      const weekIdx = 3 - Math.floor(daysDiff / 7);
      if (weekIdx >= 0 && weekIdx < 4) weeklyFines[weekIdx] += f.amount;
    });

    // 4. Reservations (Mon-Fri)
    const tempNow = new Date();
    const dayOfWeek = tempNow.getDay();
    const diffToMon = tempNow.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(tempNow.setDate(diffToMon));
    startOfWeek.setHours(0, 0, 0, 0);
    const weekReservations = await ReservationModel.find({ reservationDate: { $gte: startOfWeek } });
    const resActive = [0, 0, 0, 0, 0];
    const resCompleted = [0, 0, 0, 0, 0];
    weekReservations.forEach(r => {
      const dayIdx = new Date(r.reservationDate).getDay() - 1; // Mon=0
      if (dayIdx >= 0 && dayIdx < 5) {
        if (["Pending", "Notified"].includes(r.status)) resActive[dayIdx]++;
        else if (r.status === "Fulfilled") resCompleted[dayIdx]++;
      }
    });

    res.status(200).json({
      error: false,
      overdueBooks,
      unpaidFines,
      pendingReturns,
      pendingReservations,
      charts: {
        last6MonthsLabels,
        monthlyBorrows,
        monthlyMembers,
        weeklyFines,
        resActive,
        resCompleted
      }
    });
  } catch (err) {
    console.error("dashboardStats ERROR:", err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ── NEW: Waive / remove a fine ───────────────────────────────────────────────
adminController.waiveFine = async (req, res) => {
  try {
    const { FineModel } = require("../model/FineModel");
    const fine = await FineModel.findById(req.params.id);
    if (!fine) return res.status(404).json({ error: true, message: "Fine not found" });
    await FineModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ error: false, message: "Fine waived successfully." });
  } catch (err) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

module.exports = { adminController };
