const express = require("express");
const router = express.Router();
const Novel = require("../../models/novels");
const Genre = require("../../models/genre");
const Chapter = require("../../models/chapters");
const Library = require("../../models/library");
const { User } = require("../../models/user");
const auth = require("../../middleware/auth");
const upload = require("../../multer");
const cloudinary = require("../../cloudinary");

//routes

//get all the novels
router.get("/", async (req, res) => {
  var randomData = await Novel.find().skip(5).limit(10);
  var novels = await Novel.find().limit(10).sort({ date: "desc" });
  var header = await Novel.find().limit(6).sort({ date: "desc" });
  var completed = await Novel.find().limit(15);
  res.send({ novels, completed, randomData, header });
});
router.get("/new", auth, async (req, res) => {
  var genre = await Genre.find();
  var user = req.user;
  res.send(genre);
});
//Show all the stories specific to person
router.get("/mystories", auth, async (req, res) => {
  var novel = await Novel.find({ user_id: req.user._id }).sort({
    date: "desc",
  });
  console.log(novel);
  if (novel.length == 0) {
    novel = null;
  }
  var user = req.user;
  res.send(novel);
});

//get a single novel
router.get("/:id", async (req, res) => {
  console.log(req.params.id);
  var novel = await Novel.findById(req.params.id);
  var user_info = await User.findById(novel.user_id);
  var library = await Library.find({
    novel_id: req.params.id,
  });
  var chapters = await Chapter.find({ novel_id: req.params.id });

  res.send({
    novel,
    user_info,
    chapters,
    library,
  });
});

//create a new novel
router.post("/", auth, upload.single("image"), async (req, res) => {
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path);
    var novel = new Novel();
    novel.user_id = req.user._id;
    novel.name = req.body.name;
    novel.genre = req.body.genre;
    novel.theme = req.body.theme;
    novel.image = result.secure_url;
    novel.cloudinary_id = result.public_id;
    user = req.user;
  } else {
    var novel = new Novel();
    novel.user_id = req.user._id;
    novel.name = req.body.name;
    novel.genre = req.body.genre;
    novel.theme = req.body.theme;
    novel.image =
      "https://cel.ac/wp-content/uploads/2016/02/placeholder-img-1.jpg";
    user = req.user;
  }

  try {
    await novel.save();
    console.log("here");
    res.send({ novel });
  } catch (error) {
    console.log("errorrr");
    console.log(error);
  }
});

//delete

router.delete("/delete/:id", auth, async (req, res) => {
  console.log(req.params.id);
  console.log("here");
  try {
    var novel = await Novel.findById(req.params.id);
    console.log(novel);
    if (novel.cloudinary_id) {
      await cloudinary.uploader.destroy(novel.cloudinary_id);
    }
    await novel.remove();
  } catch (error) {
    console.log(err);
  }

  res.send(novel);
});

//update the story
router.get("/edit/:id", async (req, res) => {
  var novel = await Novel.findById(req.params.id);
  var genre = await Genre.find();

  res.send({ novel, genre });
});

//update the story
router.put("/update/:id", auth, upload.single("image"), async (req, res) => {
  var novel = await Novel.findById(req.params.id);
  novel.name = req.body.name;
  novel.genre = req.body.genre;
  novel.theme = req.body.theme;
  if (req.file) {
    if (novel.cloudinary_id) {
      await cloudinary.uploader.destroy(novel.cloudinary_id);
    }
    const result = await cloudinary.uploader.upload(req.file.path);

    novel.image = result.secure_url;
    novel.cloudinary_id = result.public_id;
  }
  await novel.save();
  res.send(novel);
});

module.exports = router;
