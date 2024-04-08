// Conversation Controller
const { json } = require("body-parser");
const Conversation = require("../models/conversation");
const mongoose = require("mongoose");
const conversation = require("../models/conversation");

// Function to create a new conversation
exports.createOrRetrieveConversation = async (
  participant1Id,
  participant2Id
) => {
  try {
    const existingConversation = await Conversation.findOne({
      participants: {
        $all: [
          new mongoose.Types.ObjectId(participant1Id),
          new mongoose.Types.ObjectId(participant2Id),
        ],
      },
    });

    if (existingConversation) {
      return existingConversation;
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create or retrieve conversation");
  }
};

// Function to add a message to a conversation
exports.addMessageToConversation = async (conversationId, message) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    conversation.messages.push(message);

    return await conversation.save();
  } catch (error) {
    console.error("Error creating or retrieving conversation:", error);
    throw new Error("Failed to create or retrieve conversation");
  }
};
