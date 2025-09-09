const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  console.log("Protect middleware triggered");

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded:", decoded);

      req.user = await User.findById(decoded.id).select("-password");
      console.log("User found:", req.user ? req.user._id : "No user");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next(); // ✅ must call next
    } catch (err) {
      console.log("JWT or DB error:", err.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.log("No token sent in headers");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
