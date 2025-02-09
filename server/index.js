const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

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
            res.status(500).json({ error: err });
        } else {
            res.json(results);
        }
    });
});

app.post('/createUser', (req, res) => {
    const name = req.body.name;
    
    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "user_name cannot be empty" });
    }

    db.query(
        "INSERT INTO USER (user_name) VALUES (?)",
        [name],
        (err, result) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "User inserted successfully", result });
        }
    );
});

app.get('/RATE', (req, res) => {
    db.query("SELECT * FROM `RATE`", (err, results) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.json(results);
        }
    });
});
app.listen(3002, () => {
    console.log('OK, server is running on port 3002');
});