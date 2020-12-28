var express = require("express");
var router = express.Router();
var { User } = require("../models/user");
var bcrypt = require("bcryptjs");
var _ = require("lodash");
var jwt = require("jsonwebtoken");
var config = require("config");

router.post("/register", async (req, res) => {
  var email = req.body.email;
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).send("User with this email already exist");
  }
  user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  await user.generatePasswordHash();
  await user.save();

  var token = jwt.sign(
    { _id: user._id, name: user.name, role: user.role },
    config.get("jwtPrivateKey")
  );
  var dataToReturn = {
    id: user._id,
    name: user.name,
    email: user.email,
    token,
  };
  res.send(dataToReturn);
});

router.post("/login", async (req, res) => {
  console.log("here");
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(401).send("This email is not registered");
  const isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(401).send("Password incorrect");
  var token = jwt.sign(
    { _id: user._id, name: user.name, role: user.role },
    config.get("jwtPrivateKey")
  );

  res.send(token);

  // let options = {
  //   maxAge: 1000 * 60 * 60 * 24, // would expire after 24 hours
  //   httpOnly: true, // The cookie only accessible by the web server
  //   signed: false, // Indicates if the cookie should be signed
  // };

  // // Set cookie
  // res.cookie("authorization", token, options); // options is optional
});

router.get("/not_login", (req, res) => {
  var errorr = "You Need To Log In";
  res.render("error", { errorr });
});

// router.get("/logout", (req, res) => {
//   req.user = null;
//   user = req.user;
//   res.clearCookie("authorization");
//   var errorr = "You Need To Log In";
//   console.log("logoutt");
//   res.render("error", { errorr, user });
// });

module.exports = router;
