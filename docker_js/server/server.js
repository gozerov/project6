const retry = require('retry');
const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

let db;

const operation = retry.operation({ retries: 5, factor: 2, minTimeout: 1000 });

operation.attempt((currentAttempt) => {
  console.log(`Attempt ${currentAttempt} to connect to MySQL`);

  db = mysql.createConnection({
    host: 'mysql-db',
    user: 'user',
    password: 'password',
    database: 'app_db',
  });

  db.connect((err) => {
    if (err) {
      console.error('Failed to connect to MySQL:', err.message);
      if (operation.retry(err)) return;
      console.error('Could not connect to MySQL after retries');
      process.exit(1);
    } else {
      console.log('Connected to MySQL');
    }
  });
});

app.post('/data', (req, res) => {
  const { data } = req.body;

  if (!db) {
    return res.status(500).json({ error: 'Database connection not established' });
  }

  db.query('INSERT INTO records (data) VALUES (?)', [data], (err) => {
    if (err) {
      console.error('Failed to insert data:', err.message);
      return res.status(500).json({ error: 'Failed to insert data' });
    }
    res.status(201).json({ status: 'data inserted' });
  });
});

app.get('/data', (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database connection not established' });
  }

  db.query('SELECT * FROM records', (err, results) => {
    if (err) {
      console.error('Failed to fetch data:', err.message);
      return res.status(500).json({ error: 'Failed to fetch data' });
    }
    res.status(200).json(results);
  });
});

app.listen(5001, () => console.log('Node.js server running on port 5001'));
