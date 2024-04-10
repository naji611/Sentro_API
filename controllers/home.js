const { reject } = require("bcrypt/promises");
const User = require("../models/user");
const mongoose = require("mongoose");
const Message = require("../models/message");
const Conversation = require("../models/conversation");
exports.homePage = async (req, res, next) => {};

exports.getFriends = async (req, res, next) => {
  let userId = req.userId;
  try {
    const user = await User.findById(userId).populate({
      path: "friends",
      select: "name email _id", // Select the fields you want to retrieve
    });

    if (user) {
      // Map over the populated friends array to extract only necessary fields
      const friends = user.friends.map((friend) => ({
        name: friend.name,
        email: friend.email,
        id: friend._id,
      }));

      const user_R = await User.findById(userId).populate({
        path: "friendRequestsReceived",
        select: "name email _id", // Select the fields you want to retrieve
      });
      if (user_R) {
        // Map over the populated friendRequestsReceived array to extract only necessary fields
        const requests = user_R.friendRequestsReceived.map((request) => ({
          name: request.name,
          email: request.email,
          id: request._id,
        }));
        res.status(200).json({ friends: friends, requests: requests });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    }
  } catch (error) {
    // Handle any errors that might occur during the database query
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.findFriend = async (req, res, next) => {
  const name = req.body.name;

  if (!name) {
    return res.status(400).json({ message: "No name provided." });
  }

  try {
    // Find users by name
    const users = await User.find({
      name: { $regex: new RegExp(name, "i") },
    });

    // Check if any users were found
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // If everything is fine, return the found users
    const finalUsers = users
      .filter((user) => user.id !== req.userId)
      .slice(0, 10);

    return res.status(200).json(finalUsers);
  } catch (error) {
    console.error("Error finding friend:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.addFriend = async (req, res, next) => {
  const { friendId } = req.body;

  try {
    if (!friendId) {
      return res.status(400).json({ message: "No friendId provided" });
    }

    const user = await User.findById(req.userId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    // Check if the user is already friends with the friend
    const isAlreadyFriend = user.friends.includes(friendId);
    if (isAlreadyFriend) {
      return res
        .status(400)
        .json({ message: "You are already friends with this person" });
    }

    // Check if a friend request has already been sent to this person
    const hasSentRequest = user.friendRequestsSent.includes(friendId);
    if (hasSentRequest) {
      return res.status(400).json({
        message: "You have already sent a friend request to this person",
      });
    }

    // Add friend request to user's sent requests and to friend's received requests
    user.friendRequestsSent.push(friendId);
    friend.friendRequestsReceived.push(req.userId);

    await Promise.all([user.save(), friend.save()]);

    return res
      .status(201)
      .json({ message: `Friend request sent to ${friend.name}` });
  } catch (err) {
    console.error("Error in adding a friend:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.acceptFriend = async (req, res, next) => {
  const friendId = req.params.friendId;
  const user = await User.findById(req.userId);

  const index = user.friendRequestsReceived.indexOf(friendId);

  console.log(user.friendRequestsReceived);
  console.log(user.email);
  if (index == -1) {
    return res
      .status(400)
      .json({ message: "No friend requests from this user" });
  } else {
    user.friends.push(friendId);
    user.friendRequestsReceived.splice(index, 1);
    await user.save();
    const friend = await User.findById(friendId);
    friend.friends.push(req.userId);
    await friend.save();
    const newConversation = new Conversation({
      participants: [
        new mongoose.Types.ObjectId(req.userId),
        new mongoose.Types.ObjectId(friendId),
      ],
      messages: [],
    });
    await newConversation.save();
    //////******************** */
    const ind = friend.friendRequestsSent.indexOf(req.userId);
    if (ind == -1) {
      return res
        .status(400)
        .json({ message: "No friend requests from this user  were found." });
    }

    friend.friendRequestsSent.splice(ind, 1);
    await friend.save();
    res.status(200).json("Friendship Accepted!");
  }
};
exports.rejectFriend = async (req, res, next) => {
  const friendId = req.params.friendId;
  const user = await User.findById(req.userId);
  const friend = await User.findById(friendId);
  const index = user.friendRequestsReceived.indexOf(friendId);
  if (index === -1) {
    return res.status(400).json({ message: "Not a Friend Request" });
  } else {
    user.friendRequestsReceived.splice(index, 1);
    await user.save();
  }

  friend.friendRequestsSent.pull(req.userId);
  await friend.save();
  res.status(200).json("Rejection Sent");
};
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
    const conversationWithMessages = await Conversation.findById(
      conversation._id
    );
    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    return res.status(200).json({ messages: messages });
  } catch (err) {
    console.error("Error fetching conversation:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
