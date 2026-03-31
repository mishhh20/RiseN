const express = require("express");
const router = express.Router();
const { signupUser, loginUser, getProfile, updatePassword } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.put("/profile/password", protect, updatePassword);

module.exports = router;