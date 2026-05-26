const express   = require("express");
const cors      = require("cors");
const mongoose  = require("mongoose");
const dotenv    = require("dotenv");
const path      = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

const users       = require("./routes/user.js");
const books       = require("./routes/books.js");
const admin       = require("./routes/admin.js");
const librarian   = require("./routes/librarian.js");
const home        = require("./routes/home.js");
const reservation = require("./routes/reservation.js");
const fine        = require("./routes/fine.js");
const report      = require("./routes/report.js");

const allowedOrigins = [
  "http://localhost:5173",
  "https://library-management-app-karan.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());

app.use("/users",        users);
app.use("/books",        books);
app.use("/admin",        admin);
app.use("/librarian",    librarian);
app.use("/home",         home);
app.use("/reservations", reservation);
app.use("/fines",        fine);
app.use("/reports",      report);

app.get("/", (_req, res) => res.send("Library Management API is running..."));

app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({ error: true, message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
const uri  = process.env.MONGO_URI;

(async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, { dbName: process.env.DB_NAME || "library" });
    console.log("Connected DB:", mongoose.connection.db.databaseName);

    // ── Start cron jobs AFTER DB is ready ────────────────────────────────
    const { startAllCronJobs } = require("./utils/cronJobs");
    startAllCronJobs();

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Mongo connection error:", err.message);
    process.exit(1);
  }
})();
