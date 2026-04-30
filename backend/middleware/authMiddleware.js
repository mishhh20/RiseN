const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    console.log("HEADERS:", req.headers.authorization); // debug

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token" });
    }

    if (!authHeader.startsWith("Bearer")) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = protect;