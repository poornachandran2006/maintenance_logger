const mongoose = require("mongoose");
const User = require("../models/user.model");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.create({
    name: "Test Worker",
    email: "worker@example.com"
  });

  console.log("Test user created!");
  process.exit(0);
});
