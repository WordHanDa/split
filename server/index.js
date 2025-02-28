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
    const { bill_name, amount, method, note, group_id, user_id, credit_card } = req.body;
    
    // 輸入驗證
    if (!bill_name || !amount || !method || !group_id || !user_id) {
        return res.status(400).json({ error: "必填欄位不能為空" });
    }

    // 確保數值正確
    const values = [
        bill_name,
        parseFloat(amount),
        parseInt(method),
        note || '',
        parseInt(group_id),
        parseInt(user_id),
        credit_card ? 1 : 0
    ];
    
    db.query(
        "INSERT INTO BILL_RECORD (bill_name, amount, method, note, group_id, user_id, credit_card) VALUES (?, ?, ?, ?, ?, ?, ?)",
        values,
        (err, result) => {
            if (err) {
                console.error("MySQL Error:", {
                    code: err.code,
                    errno: err.errno,
                    sqlMessage: err.sqlMessage,
                    sql: err.sql
                });
                res.status(500).json({ 
                    error: "Database error",
                    details: err.sqlMessage 
                });
                return;
            }
            res.json({ 
                message: "Bill created successfully",
                insertId: result.insertId 
            });
        }
    );
});

app.post('/createSplit', (req, res) => {
    const { splits } = req.body;

    if (!splits || !Array.isArray(splits) || splits.length === 0) {
        console.error("Invalid input:", req.body);
        return res.status(400).json({ error: "splits array is required" });
    }

    // 驗證每個分帳記錄的資料
    for (const split of splits) {
        if (!split.bill_id || !split.user_id || !split.percentage) {
            console.error("Invalid split record:", split);
            return res.status(400).json({ 
                error: "每筆分帳記錄都必須包含 bill_id、user_id 和 percentage" 
            });
        }
    }

    const values = splits.map(split => [
        parseInt(split.bill_id),
        parseInt(split.user_id),
        parseInt(split.percentage)
    ]);

    console.log("新增分帳記錄:", values);

    db.query(
        "INSERT INTO SPLIT_RECORD (bill_id, user_id, percentage) VALUES ?",
        [values],
        (err, result) => {
            if (err) {
                console.error("MySQL Error:", {
                    code: err.code,
                    errno: err.errno,
                    sqlMessage: err.sqlMessage,
                    sql: err.sql
                });
                return res.status(500).json({ 
                    error: "資料庫錯誤",
                    details: err.sqlMessage 
                });
            }
            res.json({ 
                message: "分帳記錄新增成功", 
                result 
            });
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

app.listen(3002, () => {
    console.log('OK, server is running on port 3002');
});