const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },
  type: { type: String, enum: ["buy", "sell"], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);