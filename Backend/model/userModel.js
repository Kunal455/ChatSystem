const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true, enum: ['male','female'] },
  password: { type: String, required: true, minlength: 6 },
  profilepic: {
    type: String, 
    default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
