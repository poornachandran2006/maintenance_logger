// backend/routes/users.route.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const Users = require("../models/user.model");

// GET all users (protected)
router.get("/get", auth, async (req, res) => {
  try {
    const users = await Users.find().lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

module.exports = router;
