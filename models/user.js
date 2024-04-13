const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  friends: [
    {
      friendId: { type: Schema.Types.ObjectId, ref: "User" },
      notifications: {
        type: Number,
        default: 0,
      },
    },
  ],
  friendRequestsSent: [{ type: Schema.Types.ObjectId, ref: "User" }],
  friendRequestsReceived: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("User", userSchema);
