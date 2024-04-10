const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
exports.signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password, 10);
    const exist = await User.findOne({ email: email });
    if (exist) {
      const error = new Error("Email is already exist");
      error.statusCode = 401;
      res.status(406).json({ message: error.message });
      throw error;
    }
    const user = new User({
      name: name,
      email: email,
      password: hashedPass,
    });
    const result = await user.save();
    if (!result) res.status(500).json({ message: error.message });
    else res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error("the email cant be found.");
      error.statusCode = 404;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong Password!");
      error.statusCode = 401;
      res.status(400).json({ message: error.message });
      throw error;
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "somesupersecret",
      { expiresIn: "5h" }
    );
    res
      .status(200)
      .json({ token: token, id: user._id.toString(), name: user.name });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
