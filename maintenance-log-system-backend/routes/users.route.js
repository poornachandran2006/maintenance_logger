const express = require("express");
const router = express.Router();
const Users = require("../models/user.model");

// GET all users
router.get("/get", async (req, res) => {
  try {
    const users = await Users.find().lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

module.exports = router;
