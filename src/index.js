const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const routes = require("./app/routes/index");
const fileUpload = require("express-fileupload");
const expressJwt = require("express-jwt");
const { authorize } = require("./app/auth/authMiddleware");
const {
  createAdminCredentialsFile
} = require("./app/auth/createAdminCredentialsFile");

const { port, jwtKey, dbUri } = require("./config");

app.use(cors());

app.listen(port, () => {
  console.log("Server running on port: " + port);
  createAdminCredentialsFile();
});

mongoose.connect(dbUri, { useNewUrlParser: true }, err => {
  if (err) {
    console.log("Error connecting to mongo");
  } else {
    console.log("Connected to mongo");
  }
});

app.use(
  fileUpload({
    createParentPath: true
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(expressJwt({ secret: jwtKey }).unless({ path: "/login" }));
app.use(authorize);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(routes);

module.exports = app;
