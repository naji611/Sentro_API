const User = require("../models/user");
const Conversation = require("../models/conversation");
const mongoose = require("mongoose");
const mongodb = require("mongodb");

exports.getUserDetails = async (req, res, next) => {
  try {
    let userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: "No such user found" });
  } catch (error) {}
};
