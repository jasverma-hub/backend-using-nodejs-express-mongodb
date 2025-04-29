// db.js
const mongoose = require('mongoose');

const dbURI = 'mongodb://127.0.0.1:27017/appice'; // Replace with your MongoDB URI

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
