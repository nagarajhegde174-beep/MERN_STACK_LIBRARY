const { Schema } = require("mongoose");

const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  isbn: { type: String, unique: true, required: true },
  description: { type: String, required: true },
  publisher: { type: String, default: "" },
  publicationYear: { type: Number, default: null },
  availableCopies: { type: Number, required: true },
  totalCopies: { type: Number, required: true },
  addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  coverImage: { type: String },
  cloudinaryId: { type: String, default: "" },
  price: { type: Number },
  views: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = { BookSchema };
