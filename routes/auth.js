const authController = require("../controllers/auth");
const express = require("express");

const router = express.Router();
router.put("/signup", authController.signup);
router.post("/login", authController.login);
module.exports = router;
