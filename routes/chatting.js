const express = require("express");
const isAuth = require("../middleware/isAuth");

const homeController = require("../controllers/home");
const userController = require("../controllers/user");
const router = express.Router();
router.get("/", homeController.homePage);
router.post("/friends", isAuth, homeController.getFriends);
router.post("/find", isAuth, homeController.findFriend);
router.post("/addFriend", isAuth, homeController.addFriend);
router.post("/acceptFriend/:friendId", isAuth, homeController.acceptFriend);
router.post("/getConversation", isAuth, homeController.getConversation);
module.exports = router;
