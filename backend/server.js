
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.send('Employee Management Backend is running!');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM employees ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Add a new employee
app.post('/api/employees', async (req, res) => {
  try {
    const { name, email, department, salary } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Name and email are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO employees (name, email, department, salary)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, department || null, salary || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    res.status(500).json({ error: 'Failed to add employee' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});