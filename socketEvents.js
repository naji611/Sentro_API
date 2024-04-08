const Message = require("./models/message");
const User = require("./models/user");
const conversationController = require("./controllers/conversation");

let connectedUsers = {};
module.exports = async function (io) {
  io.on("connection", (socket) => {
    console.log("socket connected");

    socket.on("sent-message", async (data) => {
      // console.log(data);
      console.log(data);
      const conversation =
        await conversationController.createOrRetrieveConversation(
          data.senderId,
          data.receiverId
        );

      const receiverId = data.receiverId;
      const date = data.date;
      const senderId = data.senderId;
      const message = data.message;
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
      console.log(connectedUsers);
    });
    socket.on("typing", (data) => {
      io.to(receiverSocketId).emit("user-typing", {
        typing: data.typing,
      });
    });
  });
};
