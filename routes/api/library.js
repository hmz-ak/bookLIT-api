const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Novel = require("../../models/novels");
const Library = require("../../models/library");

router.get("/", auth, async (req, res) => {
  var library = await Library.find({ user_id: req.user._id });
  var novel = [];
  for (var i = 0; i < library.length; i++) {
    novel[i] = await Novel.findById(library[i].novel_id.toString());
  }
  console.log(novel);

  var user = req.user;
  res.send({ library, novel });
});

router.post("/", auth, async (req, res) => {
  var library = new Library();
  library.novel_id = req.body._id;
  library.user_id = req.user._id;
  await library.save();
  res.send(library);
});

router.delete("/delete/:id", auth, async (req, res) => {
  console.log("im here!");
  var lib = await Library.find({ novel_id: req.params.id });
  console.log(lib);
  await Library.findByIdAndDelete(lib[0]._id);
  res.send(lib);
});

module.exports = router;
