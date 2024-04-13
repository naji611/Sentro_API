const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const messageSchema = new Schema(
  {
    senderId: {
      ref: "User",
      type: Schema.Types.ObjectId,
    },
    content: {
      type: String,
      required: true,
    },
   
    conversationId: {
      ref: "Conversation",
      type: Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      required: true,
    },
  },

  { timestamps: true }
);
module.exports = mongoose.model("Message", messageSchema);
