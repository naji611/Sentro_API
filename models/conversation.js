const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const conversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  messages: [
    {
      messageId: { type: Schema.Types.ObjectId, ref: "Message" },
      timestamp: Date,
      senderId: { type: Schema.Types.ObjectId, ref: "User" },
    },
  ],
  // notifications: {
  //   type: Number,
  //   required: true,
  // },
});
module.exports = mongoose.model("Conversation", conversationSchema);
