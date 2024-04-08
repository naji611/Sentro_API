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
    // messageStatus: {
    //   type: Boolean,
    //   required: true,
    //   default: false, //false means the message is not read yet
    //  },
    conversationId: {
      ref: "Conversation",
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Message", messageSchema);
