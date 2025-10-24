const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const { validateSignup, validateLogin } = require("../middleware/validateUser.js");
const { protect, authorize } = require('../middleware/authMiddleware'); // Add this

const router = express.Router();


//Signup
router.post("/signup", validateSignup, async (req, res) => {
  try {
    console.log("Signup request body:", req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    console.log("Existing user:", existingUser);
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    //Create new user
    const user = await User.create({
      username,
      email: email.toLowerCase().trim(),
      password,
    });

    console.log("Created user:", user);

    //Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//Login
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    //Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    //Compare password using schema method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    //Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

