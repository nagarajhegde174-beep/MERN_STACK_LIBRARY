const { FineModel }       = require("../model/FineModel");
const { FineConfigModel } = require("../model/FineConfigModel");
const { BorrowModel }     = require("../model/BorrowModel");
const calculateFine       = require("../utils/fineCalculator");

const fineController = {};

fineController.getFineConfig = async (req, res) => {
  try {
    let config = await FineConfigModel.findOne();
    if (!config) config = await FineConfigModel.create({});
    res.status(200).json({ error: false, config });
  } catch (err) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

fineController.updateFineConfig = async (req, res) => {
  try {
    const { ratePerDay, maxFineCap, gracePeriod } = req.body;
    let config = await FineConfigModel.findOne();
    if (!config) config = new FineConfigModel();
    if (ratePerDay  !== undefined) config.ratePerDay  = ratePerDay;
    if (maxFineCap  !== undefined) config.maxFineCap  = maxFineCap;
    if (gracePeriod !== undefined) config.gracePeriod = gracePeriod;
    config.updatedBy = req.userInfo.id;
    await config.save();
    res.status(200).json({ error: false, message: "Fine config updated.", config });
  } catch (err) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

fineController.generateFine = async (req, res) => {
  try {
    const borrow = await BorrowModel.findById(req.params.borrowId);
    if (!borrow) return res.status(404).json({ error: true, message: "Borrow record not found" });
    if (borrow.status !== "Returned")
      return res.status(400).json({ error: true, message: "Book has not been returned yet." });
    const config = (await FineConfigModel.findOne()) || { ratePerDay: 10, maxFineCap: 500, gracePeriod: 0 };
    const amount = calculateFine(borrow.dueDate, borrow.returnDate, config.ratePerDay, config.maxFineCap, config.gracePeriod);
    if (amount === 0) return res.status(200).json({ error: false, message: "No fine applicable.", amount: 0 });
    const existing = await FineModel.findOne({ borrowId: borrow._id });
    if (existing) return res.status(200).json({ error: false, message: "Fine already recorded.", fine: existing });
    const daysOverdue = Math.max(0, Math.ceil((new Date(borrow.returnDate) - new Date(borrow.dueDate)) / (1000*60*60*24)));
    const fine = new FineModel({ memberId: borrow.userId, borrowId: borrow._id, bookId: borrow.bookId, amount, daysOverdue, ratePerDay: config.ratePerDay });
    await fine.save();
    res.status(201).json({ error: false, message: "Fine generated.", fine });
  } catch (err) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

fineController.getAllFines = async (req, res) => {
  try {
    const fines = await FineModel.find()
      .populate("memberId", "name email membershipId")
      .populate("bookId",   "title author isbn")
      .populate("borrowId", "issueDate dueDate returnDate")
      .sort({ createdAt: -1 });
      
    const { BorrowModel } = require("../model/BorrowModel");
    const { FineConfigModel } = require("../model/FineConfigModel");
    const config = (await FineConfigModel.findOne()) || { ratePerDay: 10, maxFineCap: 500, gracePeriod: 0 };
    
    const activeBorrows = await BorrowModel.find({
      status: { $in: ["Issued", "Requested Return"] },
      dueDate: { $lt: new Date() }
    })
      .populate("userId", "name email membershipId")
      .populate("bookId", "title author isbn");

    const activeFines = activeBorrows.map(b => {
      const daysOverdue = Math.max(0, Math.ceil((new Date() - new Date(b.dueDate)) / (1000*60*60*24)) - config.gracePeriod);
      const amount = calculateFine(b.dueDate, null, config.ratePerDay, config.maxFineCap, config.gracePeriod);
      return {
        _id: "active_" + b._id,
        memberId: b.userId,
        borrowId: b,
        bookId: b.bookId,
        amount,
        paidStatus: false,
        daysOverdue,
        isActive: true
      };
    }).filter(f => f.amount > 0);

    const allFines = [...activeFines, ...fines];
    const totalAmount    = allFines.reduce((s,f) => s+f.amount, 0);
    const totalCollected = allFines.filter(f=>f.paidStatus).reduce((s,f) => s+f.amount, 0);
    const totalPending   = totalAmount - totalCollected;
    res.status(200).json({ error: false, fines: allFines, totalAmount, totalCollected, totalPending });
  } catch (err) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

fineController.getMyFines = async (req, res) => {
  try {
    const fines = await FineModel.find({ memberId: req.userInfo.id })
      .populate("bookId",   "title author coverImage isbn")
      .populate("borrowId", "issueDate dueDate returnDate")
      .sort({ createdAt: -1 });

    const { BorrowModel } = require("../model/BorrowModel");
    const { FineConfigModel } = require("../model/FineConfigModel");
    const config = (await FineConfigModel.findOne()) || { ratePerDay: 10, maxFineCap: 500, gracePeriod: 0 };
    
    const activeBorrows = await BorrowModel.find({
      userId: req.userInfo.id,
      status: { $in: ["Issued", "Requested Return"] },
      dueDate: { $lt: new Date() }
    }).populate("bookId", "title author coverImage isbn");

    const activeFines = activeBorrows.map(b => {
      const daysOverdue = Math.max(0, Math.ceil((new Date() - new Date(b.dueDate)) / (1000*60*60*24)) - config.gracePeriod);
      const amount = calculateFine(b.dueDate, null, config.ratePerDay, config.maxFineCap, config.gracePeriod);
      return {
        _id: "active_" + b._id,
        memberId: b.userId,
        borrowId: b,
        bookId: b.bookId,
        amount,
        paidStatus: false,
        daysOverdue,
        isActive: true
      };
    }).filter(f => f.amount > 0);

    const allFines = [...activeFines, ...fines];
    const totalDue = allFines.filter(f=>!f.paidStatus).reduce((s,f)=>s+f.amount,0);
    res.status(200).json({ error: false, fines: allFines, totalDue });
  } catch (err) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

fineController.markFinePaid = async (req, res) => {
  try {
    const fine = await FineModel.findById(req.params.id);
    if (!fine) return res.status(404).json({ error: true, message: "Fine not found" });
    if (fine.paidStatus) return res.status(400).json({ error: true, message: "Fine already paid." });
    fine.paidStatus = true;
    fine.paidAt = new Date();
    await fine.save();
    res.status(200).json({ error: false, message: "Fine marked as paid.", fine });
  } catch (err) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

module.exports = { fineController };