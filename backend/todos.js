const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./database');
const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY;

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('No token provided.');

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(500).send('Failed to authenticate token.');
    req.userId = decoded.id;
    next();
  });
}

// Create To-Do
router.post('/todos', verifyToken, (req, res) => {
  const { description, status } = req.body;
  const stmt = db.prepare('INSERT INTO todos (user_id, description, status) VALUES (?, ?, ?)');
  stmt.run(req.userId, description, status, function(err) {
    if (err) return res.status(500).send('Error creating to-do.');
    res.status(200).send({ id: this.lastID });
  });
});

router.get('/todos', verifyToken, (req, res) => {
  db.all('SELECT * FROM todos WHERE user_id = ?', [req.userId], (err, todos) => {
    if (err) return res.status(500).send('Error fetching to-dos.');
    res.status(200).send(todos);
  });
});

router.put('/todos/:id', verifyToken, (req, res) => {
  const { description, status } = req.body;
  const { id } = req.params;
  const stmt = db.prepare('UPDATE todos SET description = ?, status = ? WHERE id = ? AND user_id = ?');
  stmt.run(description, status, id, req.userId, function(err) {
    if (err) return res.status(500).send('Error updating to-do.');
    res.status(200).send({ changes: this.changes });
  });
});

router.delete('/todos/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?');
  stmt.run(id, req.userId, function(err) {
    if (err) return res.status(500).send('Error deleting to-do.');
    res.status(200).send({ changes: this.changes });
  });
});

module.exports = router;
