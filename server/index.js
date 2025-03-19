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

app.put('/updateUser', (req, res) => {
    const { user_id, name } = req.body;
    
    if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
    }
    
    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "user_name cannot be empty" });
    }

    db.query(
        "UPDATE USER SET user_name = ? WHERE user_id = ?",
        [name, user_id],
        (err, result) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "User not found" });
            }
            
            res.json({ 
                success: true,
                message: "User updated successfully", 
                result 
            });
        }
    );
});

app.delete('/deleteUser', (req, res) => {
    const { user_id } = req.body;
    
    if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
    }

    // First check if user exists
    db.query(
        "SELECT * FROM USER WHERE user_id = ?",
        [user_id],
        (err, results) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }
            
            // User exists, proceed with deletion
            db.query(
                "DELETE FROM USER WHERE user_id = ?",
                [user_id],
                (err, result) => {
                    if (err) {
                        console.error("MySQL Error:", err);
                        return res.status(500).json({ error: "Database error" });
                    }
                    
                    res.json({ 
                        success: true,
                        message: "User deleted successfully", 
                        result 
                    });
                }
            );
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
    const group_id = req.query.group_id;
    
    if (!group_id) {
        return res.status(400).json({ error: "group_id is required" });
    }
    
    const query = `
        SELECT yr.*, u.user_name 
        FROM YOUR_RATE yr
        JOIN USER u ON yr.user_id = u.user_id
        JOIN GROUP_USER gu ON yr.user_id = gu.user_id
        WHERE gu.group_id = ?
        AND yr.your_rate_id IN (
            SELECT MAX(your_rate_id)
            FROM YOUR_RATE
            WHERE user_id IN (
                SELECT user_id FROM GROUP_USER WHERE group_id = ?
            )
            GROUP BY user_id
        )
        ORDER BY yr.your_rate_id DESC
    `;
    
    db.query(query, [group_id, group_id], (err, results) => {
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

// Add this endpoint to calculate total amounts for users in a group using pure SQL
app.get('/getGroupTotals', (req, res) => {
    const { group_id } = req.query;

    if (!group_id) {
        return res.status(400).json({ 
            success: false, 
            message: "Group ID is required" 
        });
    }

    // Get all users in the group first
    const usersQuery = `
        SELECT u.user_id, u.user_name 
        FROM GROUP_USER gu 
        JOIN USER u ON gu.user_id = u.user_id 
        WHERE gu.group_id = ?
    `;

    db.query(usersQuery, [group_id], (err, users) => {
        if (err) {
            console.error("Error fetching users:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error fetching users" 
            });
        }

        if (users.length === 0) {
            return res.json({
                success: true,
                message: "No users found in this group",
                userTotals: []
            });
        }

        // Complex SQL query that handles all calculations in the database
        const query = `
            -- Common Table Expression (CTE) for bills with their exchange rates
            WITH BillsWithRates AS (
                SELECT 
                    b.bill_id,
                    b.bill_name,
                    b.amount,
                    b.user_id AS payer_id,
                    b.method,
                    -- Calculate the rate to use based on credit_card flag
                    CASE 
                        WHEN b.credit_card = 1 THEN r.spot_rate
                        ELSE (yr.NTD / yr.JPY)
                    END AS rate_to_use
                FROM 
                    BILL_RECORD b
                LEFT JOIN 
                    RATE r ON b.rate_id = r.rate_id
                LEFT JOIN 
                    YOUR_RATE yr ON b.your_rate_id = yr.your_rate_id
                WHERE 
                    b.group_id = ?
            ),
            
            -- CTE for bills paid by each user (with converted amounts)
            BillsPaid AS (
                SELECT 
                    payer_id AS user_id,
                    COUNT(*) AS bills_paid,
                    SUM(amount * rate_to_use) AS total_paid
                FROM 
                    BillsWithRates
                GROUP BY 
                    payer_id
            ),
            
            -- CTE for percentage-based split amounts
            PercentageSplits AS (
                SELECT 
                    bwr.bill_id,
                    bwr.payer_id,
                    sr.user_id,
                    bwr.amount * bwr.rate_to_use * (sr.percentage / 10000) AS user_amount,
                    1 AS participated
                FROM 
                    BillsWithRates bwr
                JOIN 
                    SPLIT_RECORD sr ON bwr.bill_id = sr.bill_id
                WHERE 
                    bwr.method = 2
            ),
            
            -- CTE for item-based split amounts
            ItemSplits AS (
                SELECT 
                    bwr.bill_id,
                    bwr.payer_id,
                    id.user_id,
                    id.item_amount * bwr.rate_to_use AS user_amount,
                    1 AS participated
                FROM 
                    BillsWithRates bwr
                JOIN 
                    ITEM_DETAIL id ON bwr.bill_id = id.bill_id
                WHERE 
                    bwr.method = 1
            ),
            
            -- Combine both types of splits
            AllSplits AS (
                SELECT * FROM PercentageSplits
                UNION ALL
                SELECT * FROM ItemSplits
            ),
            
            -- Calculate amounts owed to each payer
            OwedToPayers AS (
                SELECT 
                    payer_id AS user_id,
                    SUM(CASE WHEN payer_id != user_id THEN user_amount ELSE 0 END) AS amount_to_receive
                FROM 
                    AllSplits
                GROUP BY 
                    payer_id
            ),
            
            -- Calculate amounts owed by each participant
            OwedByParticipants AS (
                SELECT 
                    user_id,
                    SUM(CASE WHEN payer_id != user_id THEN user_amount ELSE 0 END) AS amount_to_pay,
                    COUNT(DISTINCT bill_id) AS bills_participated
                FROM 
                    AllSplits
                GROUP BY 
                    user_id
            )
            
            -- Final result combining all the above calculations
            SELECT 
                u.user_id,
                u.user_name,
                COALESCE(bp.bills_paid, 0) AS bills_paid,
                COALESCE(obp.bills_participated, 0) AS bills_participated,
                ROUND(
                    (COALESCE(otp.amount_to_receive, 0) - COALESCE(obp.amount_to_pay, 0)), 
                    2
                ) AS total_amount
            FROM 
                USER u
            JOIN 
                GROUP_USER gu ON u.user_id = gu.user_id AND gu.group_id = ?
            LEFT JOIN 
                BillsPaid bp ON u.user_id = bp.user_id
            LEFT JOIN 
                OwedToPayers otp ON u.user_id = otp.user_id
            LEFT JOIN 
                OwedByParticipants obp ON u.user_id = obp.user_id
            ORDER BY 
                u.user_name
        `;
        
        db.query(query, [group_id, group_id], (err, results) => {
            if (err) {
                console.error("SQL Error calculating totals:", err);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error calculating totals", 
                    error: err.message 
                });
            }
            
            res.json({
                success: true,
                userTotals: results
            });
        });
    });
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

// Add these endpoints to your existing Express server

// Endpoint to calculate what each user has advanced (paid)
app.get('/total_advance', (req, res) => {
    const { group_id } = req.query;

    if (!group_id) {
        return res.status(400).json({ 
            success: false, 
            message: "Group ID is required" 
        });
    }

    const query = `
        WITH BillsWithRates AS (
            SELECT 
                b.bill_id,
                b.bill_name,
                b.amount,
                b.user_id AS payer_id,
                b.method,
                -- Use fixed rate of 0.22 as requested in the example
                0.22 AS rate_to_use
            FROM 
                BILL_RECORD b
            WHERE 
                b.group_id = ?
        ),
        
        -- Calculate total advances (what each user paid)
        UserAdvances AS (
            SELECT 
                payer_id AS user_id,
                SUM(amount * rate_to_use) AS total_advanced,
                COUNT(*) AS bills_paid
            FROM 
                BillsWithRates
            GROUP BY 
                payer_id
        )
        
        -- Final result: total advances for each user in the group
        SELECT 
            u.user_id,
            u.user_name,
            COALESCE(ua.total_advanced, 0) AS total_cost,
            COALESCE(ua.bills_paid, 0) AS bill_paid
        FROM 
            USER u
        JOIN 
            GROUP_USER gu ON u.user_id = gu.user_id AND gu.group_id = ?
        LEFT JOIN 
            UserAdvances ua ON u.user_id = ua.user_id
        ORDER BY 
            u.user_name
    `;
    
    db.query(query, [group_id, group_id], (err, results) => {
        if (err) {
            console.error("SQL Error calculating advances:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error calculating advances", 
                error: err.message 
            });
        }
        
        const formattedResults = results.map(user => ({
            ...user,
            total_cost: Math.round(user.total_cost * 100) / 100
        }));
        
        res.json({
            success: true,
            userAdvances: formattedResults
        });
    });
});

// Endpoint to calculate the total cost for each user in a group (what they consumed)
app.get('/total_cost', (req, res) => {
    const { group_id } = req.query;

    if (!group_id) {
        return res.status(400).json({ 
            success: false, 
            message: "Group ID is required" 
        });
    }

    const query = `
        WITH BillsWithRates AS (
            SELECT 
                b.bill_id,
                b.amount AS bill_amount,
                b.method,
                -- Use fixed rate of 0.22 as requested
                0.22 AS rate_to_use
            FROM 
                BILL_RECORD b
            WHERE 
                b.group_id = ?
        ),
        
        -- Calculate costs from percentage-based splits
        SplitCosts AS (
            SELECT 
                sr.user_id,
                SUM(bwr.bill_amount * (sr.percentage / 10000) * bwr.rate_to_use) AS split_cost
            FROM 
                BillsWithRates bwr
            JOIN 
                SPLIT_RECORD sr ON bwr.bill_id = sr.bill_id
            WHERE 
                bwr.method = 2
            GROUP BY 
                sr.user_id
        ),
        
        -- Calculate costs from item-based bills
        ItemCosts AS (
            SELECT 
                id.user_id,
                SUM(id.item_amount * bwr.rate_to_use) AS item_cost
            FROM 
                BillsWithRates bwr
            JOIN 
                ITEM_DETAIL id ON bwr.bill_id = id.bill_id
            WHERE 
                bwr.method = 1
            GROUP BY 
                id.user_id
        ),
        
        -- Combine both types of costs using UNION ALL and GROUP BY
        CombinedCosts AS (
            SELECT 
                user_id,
                SUM(cost_amount) AS total_cost
            FROM (
                SELECT user_id, split_cost AS cost_amount FROM SplitCosts
                UNION ALL
                SELECT user_id, item_cost AS cost_amount FROM ItemCosts
            ) AS all_costs
            GROUP BY 
                user_id
        )
        
        -- Final result joining with user data
        SELECT 
            u.user_id,
            u.user_name,
            COALESCE(cc.total_cost, 0) AS total_cost
        FROM 
            USER u
        JOIN 
            GROUP_USER gu ON u.user_id = gu.user_id AND gu.group_id = ?
        LEFT JOIN 
            CombinedCosts cc ON u.user_id = cc.user_id
        ORDER BY 
            u.user_name
    `;
    
    db.query(query, [group_id, group_id], (err, results) => {
        if (err) {
            console.error("SQL Error calculating costs:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error calculating costs", 
                error: err.message 
            });
        }
        
        // Round the total_cost to 2 decimal places
        const formattedResults = results.map(user => ({
            ...user,
            total_cost: Math.round(user.total_cost * 100) / 100
        }));
        
        res.json({
            success: true,
            userCosts: formattedResults
        });
    });
});
app.get('/group_balance', (req, res) => {
    const { group_id } = req.query;

    if (!group_id) {
        return res.status(400).json({ 
            success: false, 
            message: "Group ID is required" 
        });
    }

    const query = `
        WITH BillsWithRates AS (
            SELECT 
                b.bill_id,
                b.amount,
                b.user_id AS payer_id,
                b.method,
                -- Use fixed rate of 0.22 as requested
                0.22 AS rate_to_use
            FROM 
                BILL_RECORD b
            WHERE 
                b.group_id = ?
        ),
        
        -- Calculate total advances (what each user paid)
        UserAdvances AS (
            SELECT 
                payer_id AS user_id,
                SUM(amount * rate_to_use) AS total_advanced,
                COUNT(*) AS bills_paid
            FROM 
                BillsWithRates
            GROUP BY 
                payer_id
        ),
        
        -- Calculate costs from percentage-based splits
        SplitCosts AS (
            SELECT 
                sr.user_id,
                SUM(bwr.amount * (sr.percentage / 10000) * bwr.rate_to_use) AS split_cost
            FROM 
                BillsWithRates bwr
            JOIN 
                SPLIT_RECORD sr ON bwr.bill_id = sr.bill_id
            WHERE 
                bwr.method = 2
            GROUP BY 
                sr.user_id
        ),
        
        -- Calculate costs from item-based bills
        ItemCosts AS (
            SELECT 
                id.user_id,
                SUM(id.item_amount * bwr.rate_to_use) AS item_cost
            FROM 
                BillsWithRates bwr
            JOIN 
                ITEM_DETAIL id ON bwr.bill_id = id.bill_id
            WHERE 
                bwr.method = 1
            GROUP BY 
                id.user_id
        ),
        
        -- Combine both types of costs using UNION ALL instead of FULL OUTER JOIN
        UserCosts AS (
            SELECT 
                user_id,
                SUM(cost) AS total_cost
            FROM (
                SELECT user_id, split_cost AS cost FROM SplitCosts
                UNION ALL
                SELECT user_id, item_cost AS cost FROM ItemCosts
            ) AS all_costs
            GROUP BY user_id
        )
        
        -- Final result: balance for each user (advance - cost)
        SELECT 
            u.user_id,
            u.user_name,
            COALESCE(ua.total_advanced, 0) AS total_advanced,
            COALESCE(uc.total_cost, 0) AS total_cost,
            COALESCE(ua.bills_paid, 0) AS bills_paid,
            ROUND(
                COALESCE(ua.total_advanced, 0) - COALESCE(uc.total_cost, 0),
                2
            ) AS balance
        FROM 
            USER u
        JOIN 
            GROUP_USER gu ON u.user_id = gu.user_id AND gu.group_id = ?
        LEFT JOIN 
            UserAdvances ua ON u.user_id = ua.user_id
        LEFT JOIN 
            UserCosts uc ON u.user_id = uc.user_id
        ORDER BY 
            balance DESC
    `;
    
    db.query(query, [group_id, group_id], (err, results) => {
        if (err) {
            console.error("SQL Error calculating balance:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error calculating balance", 
                error: err.message 
            });
        }
        
        // Format the numbers
        const formattedResults = results.map(user => ({
            ...user,
            total_advanced: Math.round(user.total_advanced * 100) / 100,
            total_cost: Math.round(user.total_cost * 100) / 100,
            balance: Math.round(user.balance * 100) / 100
        }));
        
        // Calculate group totals
        const groupTotal = formattedResults.reduce(
            (acc, user) => {
                acc.total_advanced += user.total_advanced;
                acc.total_cost += user.total_cost;
                return acc;
            },
            { total_advanced: 0, total_cost: 0 }
        );
        
        res.json({
            success: true,
            userBalances: formattedResults,
            groupTotals: {
                total_advanced: Math.round(groupTotal.total_advanced * 100) / 100,
                total_cost: Math.round(groupTotal.total_cost * 100) / 100
            }
        });
    });
});

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