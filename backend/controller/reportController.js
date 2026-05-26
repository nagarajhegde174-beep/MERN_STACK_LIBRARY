/**
 * reportController.js
 * Generates a PDF report of users with books overdue > 10 days.
 * Uses PDFKit for clean table-style output.
 */

const PDFDocument = require("pdfkit");
const { BorrowModel } = require("../model/BorrowModel");
const { FineConfigModel } = require("../model/FineConfigModel");
const calculateFine = require("../utils/fineCalculator");

const reportController = {};

reportController.generateOverdueReport = async (req, res) => {
  try {
    const now = new Date();
    const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000);

    // Get config for fine rate
    let config = await FineConfigModel.findOne();
    const ratePerDay  = config?.ratePerDay  || 10;
    const maxFineCap  = config?.maxFineCap  || 500;
    const gracePeriod = config?.gracePeriod || 0;

    // Find all issued books overdue by more than 10 days
    const overdueRecords = await BorrowModel.find({
      status:  "Issued",
      dueDate: { $lt: tenDaysAgo },
    })
      .populate("userId", "name email year stream")
      .populate("bookId", "title author")
      .sort({ dueDate: 1 });

    // Build report rows
    const rows = overdueRecords.map((record) => {
      const overdueDays = Math.floor((now - new Date(record.dueDate)) / (1000 * 60 * 60 * 24));
      const fineAmount  = calculateFine(record.dueDate, null, ratePerDay, maxFineCap, gracePeriod);
      return {
        name:       record.userId?.name       || "N/A",
        email:      record.userId?.email      || "N/A",
        year:       record.userId?.year       || "N/A",
        stream:     record.userId?.stream     || "N/A",
        bookTitle:  record.bookId?.title      || "N/A",
        author:     record.bookId?.author     || "N/A",
        dueDate:    new Date(record.dueDate).toDateString(),
        overdueDays,
        fineAmount: `Rs.${fineAmount}`,
      };
    });

    if (rows.length === 0) {
      // Return a "no data" PDF
      return generateEmptyReport(res, now);
    }

    // ── Build PDF ──────────────────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="overdue-report-${now.toISOString().slice(0,10)}.pdf"`);
    doc.pipe(res);

    // Title
    doc.fontSize(18).font("Helvetica-Bold")
       .text("Library Management System", { align: "center" });
    doc.fontSize(13).font("Helvetica")
       .text("Overdue Books Report (10+ Days)", { align: "center" });
    doc.fontSize(10)
       .text(`Generated on: ${now.toLocaleString()}`, { align: "center" });
    doc.moveDown(1.5);

    // Table headers
    const cols = [
      { label: "Student Name",  width: 110 },
      { label: "Year/Stream",   width: 80  },
      { label: "Book Title",    width: 140 },
      { label: "Author",        width: 100 },
      { label: "Due Date",      width: 90  },
      { label: "Overdue Days",  width: 75  },
      { label: "Fine Amount",   width: 70  },
    ];
    const tableTop  = doc.y;
    const rowHeight = 22;
    const startX    = 30;

    // Draw header row
    doc.rect(startX, tableTop, cols.reduce((a,c) => a + c.width, 0), rowHeight)
       .fill("#1e3a5f");

    let cx = startX;
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff");
    for (const col of cols) {
      doc.text(col.label, cx + 4, tableTop + 6, { width: col.width - 8, lineBreak: false });
      cx += col.width;
    }

    // Draw data rows
    rows.forEach((row, i) => {
      const y = tableTop + rowHeight + i * rowHeight;
      const bg = i % 2 === 0 ? "#f8fafc" : "#ffffff";
      doc.rect(startX, y, cols.reduce((a,c) => a + c.width, 0), rowHeight).fill(bg);

      const cells = [
        row.name,
        `${row.year} / ${row.stream}`,
        row.bookTitle,
        row.author,
        row.dueDate,
        `${row.overdueDays} days`,
        row.fineAmount,
      ];

      cx = startX;
      doc.font("Helvetica").fontSize(8).fillColor(row.overdueDays > 20 ? "#dc2626" : "#1f2937");
      cells.forEach((cell, j) => {
        doc.text(String(cell), cx + 4, y + 6, { width: cols[j].width - 8, lineBreak: false });
        cx += cols[j].width;
      });
    });

    // Border around full table
    const tableHeight = rowHeight + rows.length * rowHeight;
    doc.rect(startX, tableTop, cols.reduce((a,c) => a + c.width, 0), tableHeight)
       .stroke("#94a3b8");

    // Summary
    doc.moveDown(2);
    const totalFine = overdueRecords.reduce((sum, r) =>
      sum + calculateFine(r.dueDate, null, ratePerDay, maxFineCap, gracePeriod), 0);
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#1f2937")
       .text(`Total Records: ${rows.length}   |   Total Fine Amount: Rs.${totalFine}`, { align: "right" });

    doc.end();
  } catch (err) {
    console.error("generateOverdueReport ERROR:", err);
    if (!res.headersSent) res.status(500).json({ message: "Failed to generate report" });
  }
};

function generateEmptyReport(res, now) {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="overdue-report-${now.toISOString().slice(0,10)}.pdf"`);
  doc.pipe(res);
  doc.fontSize(18).text("Library Management System", { align: "center" });
  doc.fontSize(13).text("Overdue Books Report (10+ Days)", { align: "center" });
  doc.fontSize(10).text(`Generated on: ${now.toLocaleString()}`, { align: "center" });
  doc.moveDown(2);
  doc.fontSize(14).fillColor("#16a34a").text("✓ No records found. No books are overdue by more than 10 days.", { align: "center" });
  doc.end();
}

module.exports = { reportController };
