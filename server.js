const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://demo:demo1234@rentdatabase.fy7kkkk.mongodb.net/?retryWrites=true&w=majority&appName=rentDatabase');

// Create User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String
});

const User = mongoose.model('User', UserSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// Routes
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.send(`<h1>Welcome back, ${req.session.username}!</h1><a href="/logout">Logout</a>`);
  } else {
    res.redirect('/index.html');
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = new User({ username, password: hashed });
    await user.save();
    res.redirect('/index.html');
  } catch (err) {
    res.send('User already exists or error occurred.');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.send('User not found');

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    req.session.userId = user._id;
    req.session.username = user.username;
    res.redirect('/');
  } else {
    res.send('Incorrect password');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login.html');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
