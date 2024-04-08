const User = require("../models/user");
const Conversation = require("../models/conversation");
const mongoose = require("mongoose");
const mongodb = require("mongodb");

exports.getConversation = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const friendId = req.body.friendId;

    // Validate userId and friendId
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(friendId)
    ) {
      return res.status(400).json({ error: "Invalid userId or friendId" });
    }

    // Find conversation between user and friend in Conversation model
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, friendId] },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    return res.status(200).json({ conversation });
  } catch (err) {
    console.error("Error fetching conversation:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
