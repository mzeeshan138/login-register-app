require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test initial connection and log result
pool.getConnection((err, connection) => {
  if (err) {
    console.error(' Error connecting to database:', err.message);
    return;
  }
  console.log(' Successfully connected to the database');
  connection.release();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// SIGN UP endpoint
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ success: false, message: 'All fields are required.' });
  }

  try {
    // Hash password
    const hash = await bcrypt.hash(password, 10);
    pool.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hash],
      (err) => {
        if (err) {
          console.error(' Error during signup query:', err.message);
          return res.json({ success: false, message: 'Username taken.' });
        }
        res.json({ success: true, message: 'Registration successful!' });
      }
    );
  } catch (hashErr) {
    console.error(' Error hashing password:', hashErr.message);
    res.json({ success: false, message: 'Server error. Please try again.' });
  }
});

// LOGIN endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  pool.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, results) => {
      if (err) {
        console.error(' Error during login query:', err.message);
        return res.json({ success: false, message: 'Invalid credentials.' });
      }
      if (results.length === 0) {
        return res.json({ success: false, message: 'Invalid credentials.' });
      }
      const user = results[0];
      try {
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return res.json({ success: false, message: 'Invalid credentials.' });
        }
        res.json({ success: true, message: 'Login successful!' });
      } catch (compareErr) {
        console.error(' Error comparing passwords:', compareErr.message);
        res.json({
          success: false,
          message: 'Server error. Please try again.',
        });
      }
    }
  );
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
