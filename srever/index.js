const express = require('express');
const mysql = require('mysql');
const cors = require('cors'); // ✅ Import CORS

const app = express();
app.use(cors()); // ✅ Allow all origins
app.use(express.json());

const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "123456",
    database: "split_test",
    port: 3306,
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.get('/USER', (req, res) => {
    db.query("SELECT * FROM `USER`", (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results);
    });
});

app.get('/RATE', (req, res) => {
    db.query("SELECT * FROM `RATE`", (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results);
    });
});

app.listen(3002, () => {
    console.log('OK, server is running on port 3002');
});