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

app.post('/createRate', (req, res) => {
    const { JPY, NTD, user_id } = req.body;
    
    if (!JPY || !NTD || !user_id || JPY.trim() === "" || NTD.trim() === "") {
        return res.status(400).json({ error: "JPY, NTD rates and user_id cannot be empty" });
    }

    db.query(
        "INSERT INTO YOUR_RATE (JPY, NTD, user_id) VALUES (?, ?, ?)",
        [JPY, NTD, user_id],
        (err, result) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "Rate inserted successfully", result });
        }
    );
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

app.post('/createGroup', (req, res) => {
    const name = req.body.name;
    
    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "group_name cannot be empty" });
    }

    db.query(
        "INSERT INTO GROUP_TABLE (group_name) VALUES (?)",
        [name],
        (err, result) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "Group inserted successfully", result });
        }
    );
});

app.post('/addGroupUser', (req, res) => {
    const { group_id, user_id } = req.body;

    if (!group_id || !user_id) {
        return res.status(400).json({ error: "group_id and user_id are required" });
    }

    db.query(
        "SELECT * FROM GROUP_USER WHERE group_id = ? AND user_id = ?",
        [group_id, user_id],
        (err, results) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            if (results.length > 0) {
                return res.status(400).json({ error: "User already in group" });
            }

            db.query(
                "INSERT INTO GROUP_USER (group_id, user_id) VALUES (?, ?)",
                [group_id, user_id],
                (err, result) => {
                    if (err) {
                        console.error("MySQL Error:", err);
                        return res.status(500).json({ error: "Database error" });
                    }
                    res.json({ message: "User added to group successfully", result });
                }
            );
        }
    );
});

app.get('/GROUP', (req, res) => {
    db.query("SELECT * FROM `GROUP_TABLE`", (err, results) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.json(results);
        }
    });
});

app.get('/RATE', (req, res) => {
    db.query("SELECT * FROM `RATE` ORDER BY rate_id DESC LIMIT 1", (err, results) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.json(results);
        }
    });
});

app.get('/YOUR_RATE', (req, res) => {
    const user_id = req.query.user_id;

    if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
    }

    db.query(
        "SELECT * FROM `YOUR_RATE` WHERE user_id = ? ORDER BY your_rate_id DESC LIMIT 1",
        [user_id],
        (err, results) => {
            if (err) {
                res.status(500).json({ error: err });
            } else {
                res.json(results);
            }
        }
    );
});

app.post('/createBill', (req, res) => {
    const { bill_name, amount, user_id, group_id, method, note, create_time, rate_id, credit_card, your_rate_id } = req.body;

    if (!bill_name || !amount || !user_id || !group_id || !method || !create_time) {
        return res.status(400).json({ error: "All fields are required" });
    }

    db.query(
        "INSERT INTO BILL_RECORD (bill_name, amount, user_id, group_id, method, note, create_time, rate_id, credit_card, your_rate_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [bill_name, amount, user_id, group_id, method, note, create_time, rate_id, credit_card, your_rate_id],
        (err, result) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "Bill added successfully", result });
        }
    );
});

app.get('/getUsersByGroupId', (req, res) => {
    const group_id = req.query.group_id;

    if (!group_id) {
        return res.status(400).json({ error: "group_id is required" });
    }

    db.query(
        "SELECT u.user_id, u.user_name FROM GROUP_USER gu JOIN USER u ON gu.user_id = u.user_id WHERE gu.group_id = ?",
        [group_id],
        (err, results) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json(results);
        }
    );
});

// 新增分帳比例記錄
app.post('/createSplitRecord', (req, res) => {
    const { bill_id, percentages } = req.body;

    if (!bill_id || !percentages || Object.keys(percentages).length === 0) {
        return res.status(400).json({ error: "帳單ID和分帳比例都是必需的" });
    }

    // 檢查百分比總和是否為 100%
    const totalPercentage = Object.values(percentages).reduce(
        (sum, value) => sum + parseFloat(value), 
        0
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
        return res.status(400).json({ error: "分帳比例總和必須等於 100%" });
    }

    // 準備批量插入的數據
    const values = Object.entries(percentages).map(([user_id, percentage]) => [
        bill_id,
        parseInt(user_id),
        parseFloat(percentage)
    ]);

    // 執行批量插入
    db.query(
        "INSERT INTO SPLIT_RECORD (bill_id, user_id, percentage) VALUES ?",
        [values],
        (err, result) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ error: "資料庫錯誤" });
            }
            res.json({ 
                message: "分帳比例記錄已成功新增", 
                result 
            });
        }
    );
});

// 查詢特定帳單的分帳比例
app.get('/getSplitRecord', (req, res) => {
    const { bill_id } = req.query;

    if (!bill_id) {
        return res.status(400).json({ error: "需要提供帳單ID" });
    }

    db.query(
        `SELECT sr.*, u.user_name 
         FROM SPLIT_RECORD sr 
         JOIN USER u ON sr.user_id = u.user_id 
         WHERE sr.bill_id = ?`,
        [bill_id],
        (err, results) => {
            if (err) {
                res.status(500).json({ error: err });
            } else {
                res.json(results);
            }
        }
    );
});

app.listen(3002, () => {
    console.log('OK, server is running on port 3002');
});