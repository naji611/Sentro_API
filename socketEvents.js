const Message = require("./models/message");
const User = require("./models/user");
const conversationController = require("./controllers/conversation");

let connectedUsers = {};
module.exports = async function (io) {
  io.on("connection", (socket) => {
    console.log("socket connected");

    socket.on("sent-message", async (data) => {
      // console.log(data);

      const conversation =
        await conversationController.createOrRetrieveConversation(
          data.senderId,
          data.receiverId
        );
      const user = await User.findById(data.receiverId);

      const receiverId = data.receiverId;
      const date = data.date;
      const senderId = data.senderId;
      const message = data.message;

      const friendIndex = user.friends.findIndex((friend) => {
        return friend.friendId.toString() === senderId;
      });
      if (friendIndex !== -1) {
        user.friends[friendIndex].notifications += 1;
        await user.save();
      } else {
        console.error("Friend not found.");
      }
      const receiverSocketId = connectedUsers[receiverId];
      io.to(receiverSocketId).emit("new-message", {
        content: message,
        createdAt: date,
        senderId: senderId,
      });
      const ms = new Message({
        content: message,
        senderId: senderId,
        conversationId: conversation._id,
        isRead: false,
      });
      await ms.save();
      const newMessage = {
        messageId: ms._id,
        timestamp: new Date(),
        senderId: data.senderId,
      };

      await conversationController.addMessageToConversation(
        conversation._id,
        newMessage
      );
    });
    socket.on("user-connected", (data) => {
      console.log(`User ${data.userId} connected`);

      connectedUsers[data.userId] = socket.id;

      socket.broadcast.emit("user-online", {
        userId: data.userId,
      });
    });
    //disconnect
    socket.on("user-disconnected", (data) => {
      delete connectedUsers[data.userId];
      console.log("user disconnected " + data.userId);
      socket.broadcast.emit("user-offline", { userId: data.userId });
    });

    socket.on("typing", (data) => {
      const receiverSocketId = connectedUsers[data.receiverId];
      console.log(receiverSocketId);
      io.to(receiverSocketId).emit("user-typing", {
        typing: data.typing,
      });
    });
    socket.on("accept-friend", async (data) => {
      const receiverSocketId = connectedUsers[data.receiverId];
      io.to(receiverSocketId).emit("new-friend-request", {
        requesterId: data.requesterId,
      });
    });
  });
};
