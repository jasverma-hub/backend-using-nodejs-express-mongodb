// index.js
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./db'); // Import the DB connection function
const User = require('./models/User'); // Import the User model
const app = express();
const PORT = process.env.PORT || 3000;
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

app.use(express.json()); // middleware to parse JSON

// Connect to MongoDB
connectDB();

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use(limiter);

// GET all users
app.get('/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  try {
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(limit);
    
    const totalUsers = await User.countDocuments();
    res.json({
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// GET a user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // Fetch user by ID from MongoDB
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user' });
  }
});

// POST a new user
app.post('/users', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('name').notEmpty().withMessage('Name is required'),
], async (req, res) => {
  // Check if there are validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email } = req.body;

  // Create a new user
  const newUser = new User({ name, email });

  try {
    // Save the user to MongoDB
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: 'Error saving user' });
  }
});

// PUT update user
app.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email } = req.body;
    user.name = name || user.name;
    user.email = email || user.email;

    const updatedUser = await user.save(); // Save updated user to MongoDB
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

// DELETE a user
app.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id); // Delete user from MongoDB
    res.status(204).send(); // No content
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
