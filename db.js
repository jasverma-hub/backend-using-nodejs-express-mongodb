// db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const dbURI = process.env.MONGO_URI; // Replace with your MongoDB URI

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
