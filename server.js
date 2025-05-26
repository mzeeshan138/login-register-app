const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// MySQL connection (XAMPP default user/password)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'usersdb',
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

  // Hash password
  const hash = await bcrypt.hash(password, 10);
  pool.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hash],
    (err) => {
      if (err) return res.json({ success: false, message: 'Username taken.' });
      res.json({ success: true, message: 'Registration successful!' });
    }
  );
});

// LOGIN endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  pool.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, results) => {
      if (err || results.length === 0) {
        return res.json({ success: false, message: 'Invalid credentials.' });
      }
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.json({ success: false, message: 'Invalid credentials.' });
      }
      res.json({ success: true, message: 'Login successful!' });
    }
  );
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
