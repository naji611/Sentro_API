const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
const server = app.listen(3001, () =>
  console.log("Server is running on port 3001")
);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const socketEvents = require("./socketEvents");

const homeRoute = require("./routes/chatting");
const AuthRoute = require("./routes/auth");
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,PATCH,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,body,x-requested-with,origin"
  );
  next();
});

app.use(homeRoute);
app.use(AuthRoute);
socketEvents(io);
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error ):";
  const data = err.data || {};

  res.status(status).json({ message: message, data: data });
});
mongoose.connect(
  "mongodb+srv://najiassi13:oVSGpv77BtlcXgDs@sentro.dj8jbni.mongodb.net/?retryWrites=true&w=majority&appName=Sentro"
);
