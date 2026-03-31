const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },
  targetPrice: { type: Number, required: true },
  condition: { type: String, enum: ["above", "below"], required: true },
  triggered: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Alert", alertSchema);