const express = require("express");
const router = express.Router();
const { User, validateUser } = require("../Database/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authMiddleware = require("./authMiddleware");

router.post("/signup", async (req, res) => {
  try { 
    // Check if request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Empty request body" });
    }

    // Validate user data using Joi
    const { error } = validateUser(req.body);
    if (error) {
      console.log(error.details[0].context);
      return res.status(400).json({
        message: "Validation Error",
        field: error.details[0].context.label, // Return the exact field that failed validation
      });
    } 

    // Extract user details
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    // Generate a token
    const token = jwt.sign({ username }, process.env.JwtSecret, {
      expiresIn: "7d",
    });

    // Send response with token
    return res
      .cookie("token", token, {
        httpOnly: true,
      })
      .status(201)
      .json({ message: "Signup successful", loggedInUser: newUser }); // Ensure loggedInUser contains username
  } catch (error) {
    console.error("Signup Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username: user.username }, process.env.JwtSecret, {
      expiresIn: "7d",
    });

    return res
      .cookie("token", token, { httpOnly: true, sameSite: "lax" })
      .status(201)
      .json({ message: "Login successful", loggedInUser: user }); // Ensure loggedInUser contains username
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  return res
    .clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
    })
    .status(200)
    .json({ message: "Logout successful" });
});

router.get("/protected", authMiddleware, (req, res) => {
  res
    .status(201)
    .json({ message: "Protected data accessed", loggedInUser: req.user }); // Ensure loggedInUser contains username
});

module.exports = router;
