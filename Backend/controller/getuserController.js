const User = require("../model/userModel");
const Conversation = require("../model/conversationModel");

// Search
const getUser = async (req, res) => {
  try {
    const search = req.query.search || "";
    const currentId = req.user._id;

    const users = await User.find({
      $and: [
        { $or: [{ username: { $regex: search, $options: "i" } }, { fullname: { $regex: search, $options: "i" } }] },
        { _id: { $ne: currentId } }
      ]
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Current talkio
const getcurrenttalkio = async (req, res) => {
  try {
    const currentId = req.user._id;
    const conversations = await Conversation.find({ participants: currentId }).sort({ updatedAt: -1 });

    const participantIds = conversations.flatMap(c => c.participants.filter(id => id.toString() !== currentId.toString()));
    const users = await User.find({ _id: { $in: participantIds } }).select("-password -email");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current logged-in user (verify token)
const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by isLogin middleware
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUser, getcurrenttalkio, getUserById, getCurrentUser };
