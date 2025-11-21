const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully".cyan.bold);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`.red);
    process.exit(1);
  }
};

module.exports = connectDB;
