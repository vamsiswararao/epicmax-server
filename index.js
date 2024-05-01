// server.js

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const cors =require("cors");
const { Database } = require('sqlite3');


const app = express();
const port = 9090;

app.use(cors());
app.use(bodyParser.json());

// SQLite database setup
const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Create tasks table if not exists
    db.run(
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY,
        taskName TEXT,
        description TEXT,
        dueDate TEXT,
        assignee TEXT,
        status TEXT DEFAULT 'pending'
      )`
    );
  }
});

// Endpoint to create a new task
app.post('/tasks', async(req, res) => {
    const { taskName, description, dueDate, assignee, status } = req.body;
    db.run(
      `INSERT INTO tasks (taskName, description, dueDate, assignee, status) VALUES (?, ?, ?, ?, ?)`,
      [taskName, description, dueDate, assignee, status || 'pending'],
      function (err) {
        if (err) {
          console.error('Error creating task', err);
          res.status(500).json({ error: 'Failed to create task' });
        } else {
          res.status(201).json({ id: this.lastID, taskName, description, dueDate, assignee, status });
        }
      }
    );
});

// Endpoint to get all tasks

app.get('/', async(req, res) => {
    res.status(200).json("HELLO World");
  });

app.get('/tasks',(req, res) => {
    db.all(`SELECT * FROM tasks`, (err, rows) => {
        if (err) {
          console.error('Error getting tasks', err);
          res.status(500).json({ error: 'Failed to get tasks' });
        } else {
            console.log(rows)
          res.json(rows);
        }
})
});

app.get('/tasks/:assignee',(req, res) => {
    const { assignee } = req.params;
    db.all(`SELECT * FROM tasks where assignee="${assignee}"`, (err, rows) => {
        if (err) {
          console.error('Error getting tasks', err);
          res.status(500).json({ error: 'Failed to get tasks' });
        } else {
          console.log(rows)
          res.json(rows);
        }
})
})

  
  // Update task status
  app.put('/tasks/:id/status', async(req, res) => {
    const { id } = req.params;
  const { status } = req.body;
  db.run(`UPDATE tasks SET status = ? WHERE id = ?`, [status, id], (err) => {
    if (err) {
      console.error('Error updating task status', err);
      res.status(500).json({ error: 'Failed to update task status' });
    } else {
      res.json({ message: 'Task status updated successfully' });
    }
  });
  });
  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
