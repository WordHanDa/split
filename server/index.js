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

app.get('/YOUR_RATE/latest', (req, res) => {
    const query = `
        SELECT yr.*, u.user_name 
        FROM YOUR_RATE yr
        JOIN USER u ON yr.user_id = u.user_id
        WHERE yr.your_rate_id IN (
            SELECT MAX(your_rate_id)
            FROM YOUR_RATE
            GROUP BY user_id
        )
        ORDER BY yr.your_rate_id DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching latest rates:", err);
            res.status(500).json({ error: "Error fetching latest rates" });
        } else {
            res.json(results);
        }
    });
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
                console.error("Error creating bill:", err);
                res.status(500).json({ 
                    success: false, 
                    message: "Error creating bill" 
                });
            } else {
                res.json({ 
                    success: true,
                    message: "Bill added successfully", 
                    result: result 
                });
            }
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

// Update the createItem endpoint to handle multiple items
app.post('/createItem', async (req, res) => {
    const { bill_id, items } = req.body;

    if (!bill_id || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
            success: false,
            message: "Bill ID and items array are required" 
        });
    }

    try {
        // Delete any existing items for this bill
        await new Promise((resolve, reject) => {
            db.query(
                "DELETE FROM ITEM_DETAIL WHERE bill_id = ?",
                [bill_id],
                (err) => err ? reject(err) : resolve()
            );
        });

        // Insert all new items
        for (const item of items) {
            await new Promise((resolve, reject) => {
                db.query(
                    "INSERT INTO ITEM_DETAIL (item_amount, bill_id, user_id, item_name) VALUES (?, ?, ?, ?)",
                    [item.item_amount, bill_id, item.user_id, item.item_name],
                    (err) => err ? reject(err) : resolve()
                );
            });
        }

        res.json({ 
            success: true,
            message: "Items added successfully"
        });

    } catch (error) {
        console.error("Error creating items:", error);
        res.status(500).json({ 
            success: false,
            message: "Error creating items" 
        });
    }
});

// 修改現有的 createSplitRecord 端點：
app.post('/createSplitRecord', (req, res) => {
    const { bill_id, percentages } = req.body;

    if (!bill_id || !percentages || Object.keys(percentages).length === 0) {
        return res.status(400).json({ 
            success: false,
            message: "Bill ID and percentages are required" 
        });
    }

    try {
        let totalPercentage = 0;

        // First pass: validate and sum percentages
        for (const [userId, percentage] of Object.entries(percentages)) {
            const parsedValue = parseInt(percentage, 10);
            
            if (isNaN(parsedValue) || parsedValue < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid percentage value for user ${userId}`
                });
            }

            totalPercentage += parsedValue;
        }

        // Check if total equals 100
        if (totalPercentage !== 10000) {
            console.error(`Total percentage is not 100%: ${totalPercentage/100}%`);
            return res.status(400).json({ 
                success: false,
                message: `Total percentage must be 100%, current total is: ${totalPercentage}%` 
            });
        }

        // Delete existing records
        db.query(
            "DELETE FROM SPLIT_RECORD WHERE bill_id = ?",
            [bill_id],
            async (deleteErr) => {
                if (deleteErr) {
                    console.error("Error deleting old records:", deleteErr);
                    return res.status(500).json({ 
                        success: false,
                        message: "Error deleting old records" 
                    });
                }

                try {
                    // Insert new records with original percentages
                    for (const [user_id, percentage] of Object.entries(percentages)) {
                        await new Promise((resolve, reject) => {
                            db.query(
                                "INSERT INTO SPLIT_RECORD (bill_id, user_id, percentage) VALUES (?, ?, ?)",
                                [bill_id, parseInt(user_id), parseInt(percentage)],
                                (err, result) => {
                                    if (err) reject(err);
                                    else resolve(result);
                                }
                            );
                        });
                    }

                    res.json({
                        success: true,
                        message: "Split records added successfully",
                        splitDetails: Object.entries(percentages).map(([user_id, percentage]) => ({
                            user_id,
                            percentage: parseInt(percentage)
                        }))
                    });

                } catch (insertError) {
                    console.error("Error inserting records:", insertError);
                    res.status(500).json({ 
                        success: false,
                        message: "Error creating split records" 
                    });
                }
            }
        );

    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ 
            success: false,
            message: "Error processing request" 
        });
    }
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