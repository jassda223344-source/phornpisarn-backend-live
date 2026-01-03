// ===============================
// Phornpisarn Backend (READY FOR RENDER)
// ใช้ได้ทันที แก้ error multer + Node 22 แล้ว
// ===============================

// วิธีใช้สั้นๆ
// 1) สร้าง repo ใหม่
// 2) วางไฟล์ 2 ไฟล์นี้: server.js + package.json
// 3) Deploy บน Render (Node / npm install / npm start)

// ---------- server.js ----------
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = 'PHORNPISARN_SECRET_KEY';
const PORT = process.env.PORT || 3000;

// ---------- Database ----------
const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
});

// ---------- Seed Users ----------
(async () => {
  const users = [
    ['JOY2', '08314025547788'],
    ['Yanisa', '06602070517788'],
    ['Pisarn', '08333855287788'],
    ['Ouee1', '0838926475']
  ];

  for (const [u, p] of users) {
    const hash = await bcrypt.hash(p, 10);
    db.run(
      'INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)',
      [u, hash]
    );
  }
})();

// ---------- Login API ----------
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (!user) return res.status(401).json({ message: 'User not found' });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: 'Wrong password' });

      const token = jwt.sign({ username }, SECRET);
      res.json({ token });
    }
  );
});

// ---------- Health Check ----------
app.get('/', (req, res) => {
  res.send('Phornpisarn Backend is running');
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});

// ---------- package.json ----------
/*
{
  "name": "phornpisarn-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5"
  }
}
*/
