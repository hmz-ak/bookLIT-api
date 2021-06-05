const mongoose = require("mongoose");

var novelSchema = mongoose.Schema({
  user_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  name: String,
  genre: String,
  theme: String,
  paid: Boolean,
  price: {
    type: Number,
    default: 0,
  },
  date: { type: Date, default: Date.now },
  image: {
    type: String,
    default: "placeholder.jpg",
  },
  cloudinary_id: String,
});

var novelModel = mongoose.model("Novel", novelSchema);

module.exports = novelModel;
