const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Portfolio = require("../models/Portfolio");
const Transaction = require("../models/Transaction");

// SIGNUP
const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secretkey", { expiresIn: "7d" });
    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const totalTrades = await Transaction.countDocuments({ user: req.user.id });
    const buyCount = await Transaction.countDocuments({ user: req.user.id, type: "buy" });
    const sellCount = await Transaction.countDocuments({ user: req.user.id, type: "sell" });
    const holdings = await Portfolio.countDocuments({ user: req.user.id });
    const totalInvested = await Transaction.aggregate([
      { $match: { user: user._id, type: "buy" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    res.json({
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      stats: {
        totalTrades,
        buyCount,
        sellCount,
        holdings,
        totalInvested: totalInvested[0]?.total || 0,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PASSWORD
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
    if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signupUser, loginUser, getProfile, updatePassword };