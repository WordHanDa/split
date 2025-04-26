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
// Replace the current SSL options code
var https = require('https');
var fs = require('fs');
var options;

// Try to load SSL certificates if available
try {
    options = {
        key: fs.readFileSync('/Users/macbookpro/key.pem'),
        cert: fs.readFileSync('/Users/macbookpro/cert.pem')
    };
    console.log('SSL certificates loaded successfully. HTTPS mode enabled.');
} catch (err) {
  console.log('SSL certificates not found or not accessible:', err.message);
  console.log('Starting in HTTP mode instead...');
  options = null;
}
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

app.put('/updateGroup', (req, res) => {
    const { group_id, name } = req.body;
    
    if (!group_id) {
        return res.status(400).json({ error: "group_id is required" });
    }
    
    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "group_name cannot be empty" });
    }

    db.query(
        "UPDATE GROUP_TABLE SET group_name = ? WHERE group_id = ?",
        [name, group_id],
        (err, result) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Group not found" });
            }
            
            res.json({ 
                success: true,
                message: "Group updated successfully", 
                result 
            });
        }
    );
});

app.delete('/deleteGroup', (req, res) => {
    const { group_id } = req.body;
    
    if (!group_id) {
        return res.status(400).json({ error: "group_id is required" });
    }

    // First check if group exists
    db.query(
        "SELECT * FROM GROUP_TABLE WHERE group_id = ?",
        [group_id],
        (err, results) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: "Group not found" });
            }
            
            // Group exists, proceed with deletion
            db.query(
                "DELETE FROM GROUP_TABLE WHERE group_id = ?",
                [group_id],
                (err, result) => {
                    if (err) {
                        console.error("MySQL Error:", err);
                        return res.status(500).json({ error: "Database error" });
                    }
                    
                    res.json({ 
                        success: true,
                        message: "Group deleted successfully", 
                        result 
                    });
                }
            );
        }
    );
});

app.delete('/api/groups/:groupId', (req, res) => {
    const groupId = req.params.groupId;
    
    if (!groupId) {
        return res.status(400).json({ 
            success: false,
            error: "Group ID is required" 
        });
    }

    // First check if group exists
    db.query(
        "SELECT * FROM GROUP_TABLE WHERE group_id = ?",
        [groupId],
        (err, results) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ 
                    success: false,
                    error: "Database error" 
                });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: "Group not found" 
                });
            }
            
            // Group exists, proceed with deletion
            db.query(
                "DELETE FROM GROUP_TABLE WHERE group_id = ?",
                [groupId],
                (err, result) => {
                    if (err) {
                        console.error("MySQL Error:", err);
                        return res.status(500).json({ 
                            success: false,
                            error: "Database error" 
                        });
                    }
                    
                    res.json({ 
                        success: true,
                        message: "Group deleted successfully" 
                    });
                }
            );
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

app.delete('/removeGroupUser', (req, res) => {
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
        
        if (results.length === 0) {
          return res.status(404).json({ error: "User not in group" });
        }
        
        // Check if user has any bills in this group
        db.query(
          "SELECT COUNT(*) AS bill_count FROM BILL_RECORD WHERE group_id = ? AND user_id = ?",
          [group_id, user_id],
          (err, billResults) => {
            if (err) {
              console.error("MySQL Error:", err);
              return res.status(500).json({ error: "Database error" });
            }
            
            // If user has bills in this group, don't allow removal
            if (billResults[0].bill_count > 0) {
              return res.status(400).json({ 
                success: false,
                error: "User has existing bill records in this group and cannot be removed" 
              });
            }
            
            // Also check if user has split records in this group
            db.query(
              "SELECT COUNT(*) AS split_count FROM SPLIT_RECORD sr " +
              "JOIN BILL_RECORD br ON sr.bill_id = br.bill_id " +
              "WHERE br.group_id = ? AND sr.user_id = ?",
              [group_id, user_id],
              (err, splitResults) => {
                if (err) {
                  console.error("MySQL Error:", err);
                  return res.status(500).json({ error: "Database error" });
                }
                
                // If user has split records in this group, don't allow removal
                if (splitResults[0].split_count > 0) {
                  return res.status(400).json({ 
                    success: false,
                    error: "User has existing split records in this group and cannot be removed" 
                  });
                }
                
                // User has no records in this group, proceed with removal
                db.query(
                  "DELETE FROM GROUP_USER WHERE group_id = ? AND user_id = ?",
                  [group_id, user_id],
                  (err, result) => {
                    if (err) {
                      console.error("MySQL Error:", err);
                      return res.status(500).json({ error: "Database error" });
                    }
                    
                    res.json({ 
                      success: true,
                      message: "User removed from group successfully", 
                      result 
                    });
                  }
                );
              }
            );
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

app.put('/updateRate', (req, res) => {
    const { id, JPY, NTD, user_id } = req.body;
    
    if (!id) {
        return res.status(400).json({ error: "Rate id is required" });
    }
    
    // Validate and convert numeric values
    const parsedJPY = parseFloat(JPY);
    const parsedNTD = parseFloat(NTD);
    const parsedUserId = parseInt(user_id);

    if (isNaN(parsedJPY) || isNaN(parsedNTD) || isNaN(parsedUserId)) {
        return res.status(400).json({ error: "Invalid JPY, NTD, or user_id values" });
    }

    if (parsedJPY <= 0 || parsedNTD <= 0) {
        return res.status(400).json({ error: "JPY and NTD must be greater than 0" });
    }
    
    db.query(
        "SELECT * FROM YOUR_RATE WHERE your_rate_id = ?",
        [id],
        (err, results) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: "Rate not found" });
            }
            
            db.query(
                "UPDATE YOUR_RATE SET JPY = ?, NTD = ?, user_id = ? WHERE your_rate_id = ?",
                [parsedJPY, parsedNTD, parsedUserId, id],
                (err, result) => {
                    if (err) {
                        console.error("MySQL Error:", err);
                        return res.status(500).json({ error: "Database error" });
                    }
                    
                    res.json({ 
                        success: true, 
                        message: "Rate updated successfully", 
                        result 
                    });
                }
            );
        }
    );
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
            
            // NEW: Check if user has any associated bill records
            db.query(
                "SELECT COUNT(*) AS bill_count FROM BILL_RECORD WHERE user_id = ?",
                [user_id],
                (err, billResults) => {
                    if (err) {
                        console.error("MySQL Error:", err);
                        return res.status(500).json({ error: "Database error" });
                    }
                    
                    // If user has bill records, don't allow deletion
                    if (billResults[0].bill_count > 0) {
                        return res.status(400).json({ 
                            success: false,
                            error: "User has existing bill records and cannot be deleted" 
                        });
                    }else{
                        // User has no bill records, proceed with deletion
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
                }
            );
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

app.get('/YOUR_RATE/user', (req, res) => {
  const user_id = req.query.user_id;
  
  if (!user_id) {
    return res.status(400).json({
      success: false,
      error: "user_id parameter is required"
    });
  }
  
  const query = `
    SELECT yr.*, u.user_name
    FROM YOUR_RATE yr
    JOIN USER u ON yr.user_id = u.user_id
    WHERE yr.user_id = ?
    ORDER BY yr.your_rate_id DESC
  `;
  
  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching user rates:", err);
      return res.status(500).json({
        success: false,
        error: "Error fetching user rates"
      });
    }
    
    if (results.length === 0) {
      return res.json({
        success: true,
        message: "No rates found for this user",
        rates: []
      });
    }
    
    res.json({
      success: true,
      rates: results  // Return all results instead of just the first one
    });
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

app.get('/getBillsByGroupId', (req, res) => {
    const group_id = req.query.group_id;

    if (!group_id) {
        return res.status(400).json({ 
            success: false,
            error: "Group ID is required" 
        });
    }

    const query = `
        SELECT 
            b.*,
            u.user_name as payer_name
        FROM 
            BILL_RECORD b
        JOIN 
            USER u ON b.user_id = u.user_id
        WHERE 
            b.group_id = ?
        ORDER BY 
            b.create_time DESC
    `;

    db.query(query, [group_id], (err, results) => {
        if (err) {
            console.error("Error fetching bills:", err);
            return res.status(500).json({ 
                success: false,
                error: "Error fetching bills" 
            });
        }

        res.json(results);
    });
});

app.get('/getBillDetails', (req, res) => {
    const bill_id = req.query.bill_id;

    if (!bill_id) {
        return res.status(400).json({ 
            success: false,
            error: "Bill ID is required" 
        });
    }

    const query = `
        SELECT 
            b.*,
            u.user_name as payer_name
        FROM 
            BILL_RECORD b
        JOIN 
            USER u ON b.user_id = u.user_id
        WHERE 
            b.bill_id = ?
    `;

    db.query(query, [bill_id], (err, results) => {
        if (err) {
            console.error("Error fetching bill details:", err);
            return res.status(500).json({ 
                success: false,
                error: "Error fetching bill details" 
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Bill not found"
            });
        }

        res.json(results[0]);
    });
});

app.put('/updateBill', (req, res) => {
    const { 
        bill_id, 
        bill_name, 
        amount, 
        user_id, 
        group_id, 
        method, 
        note = '', 
        create_time = new Date(), 
        rate_id = null, 
        credit_card = false, 
        your_rate_id = null 
    } = req.body;
    
    // Validate required fields
    if (!bill_id) {
        return res.status(400).json({ 
            success: false, 
            error: "Bill ID is required"
        });
    }
    
    if (!bill_name || !amount || !method || !group_id) {
        return res.status(400).json({ 
            success: false, 
            error: "Required fields cannot be empty",
            missing: {
                bill_name: !bill_name,
                amount: !amount,
                method: !method,
                group_id: !group_id
            }
        });
    }

    // First check if the bill exists
    db.query(
        "SELECT * FROM BILL_RECORD WHERE bill_id = ?",
        [bill_id],
        (err, results) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ 
                    success: false, 
                    error: "Database error" 
                });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    error: "Bill not found" 
                });
            }
            
            // Prepare update query with only the fields that are present
            const updates = [];
            const values = [];
            
            if (bill_name) {
                updates.push('bill_name = ?');
                values.push(bill_name);
            }
            if (amount) {
                updates.push('amount = ?');
                values.push(amount);
            }
            if (method) {
                updates.push('method = ?');
                values.push(method);
            }
            updates.push('note = ?');
            values.push(note);
            updates.push('credit_card = ?');
            values.push(credit_card ? 1 : 0);
            updates.push('group_id = ?');
            values.push(group_id);
            
            if (rate_id !== undefined) {
                updates.push('rate_id = ?');
                values.push(rate_id);
            }
            if (your_rate_id !== undefined) {
                updates.push('your_rate_id = ?');
                values.push(your_rate_id);
            }
            
            // Add bill_id at the end for WHERE clause
            values.push(bill_id);
            
            const updateQuery = `
                UPDATE BILL_RECORD 
                SET ${updates.join(', ')}
                WHERE bill_id = ?
            `;
            
            db.query(updateQuery, values, (err, result) => {
                if (err) {
                    console.error("Error updating bill:", err);
                    return res.status(500).json({ 
                        success: false, 
                        error: "Error updating bill" 
                    });
                }
                
                res.json({ 
                    success: true,
                    message: "Bill updated successfully", 
                    result: result 
                });
            });
        }
    );
});

app.delete('/deleteBill', (req, res) => {
    const { bill_id } = req.body;
    
    if (!bill_id) {
        return res.status(400).json({ 
            success: false, 
            error: "bill_id is required" 
        });
    }

    // First check if the bill exists
    db.query(
        "SELECT * FROM BILL_RECORD WHERE bill_id = ?",
        [bill_id],
        (err, results) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ 
                    success: false, 
                    error: "Database error" 
                });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    error: "Bill not found" 
                });
            }
            
            // Before deleting the bill, delete related records
            db.beginTransaction(err => {
                if (err) {
                    console.error("Error starting transaction:", err);
                    return res.status(500).json({ 
                        success: false, 
                        error: "Database error" 
                    });
                }
                
                // Delete split records first
                db.query(
                    "DELETE FROM SPLIT_RECORD WHERE bill_id = ?",
                    [bill_id],
                    (err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error("Error deleting split records:", err);
                                res.status(500).json({ 
                                    success: false, 
                                    error: "Error deleting split records" 
                                });
                            });
                        }
                        
                        // Delete item details
                        db.query(
                            "DELETE FROM ITEM_DETAIL WHERE bill_id = ?",
                            [bill_id],
                            (err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error("Error deleting item details:", err);
                                        res.status(500).json({ 
                                            success: false, 
                                            error: "Error deleting item details" 
                                        });
                                    });
                                }
                                
                                // Finally delete the bill
                                db.query(
                                    "DELETE FROM BILL_RECORD WHERE bill_id = ?",
                                    [bill_id],
                                    (err, result) => {
                                        if (err) {
                                            return db.rollback(() => {
                                                console.error("Error deleting bill:", err);
                                                res.status(500).json({ 
                                                    success: false, 
                                                    error: "Error deleting bill" 
                                                });
                                            });
                                        }
                                        
                                        db.commit(err => {
                                            if (err) {
                                                return db.rollback(() => {
                                                    console.error("Error committing transaction:", err);
                                                    res.status(500).json({ 
                                                        success: false, 
                                                        error: "Error committing transaction" 
                                                    });
                                                });
                                            }
                                            
                                            res.json({ 
                                                success: true,
                                                message: "Bill and related records deleted successfully", 
                                                result: result 
                                            });
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
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

app.put('/updateItem', async (req, res) => {
    const { bill_id, items } = req.body;
    
    if (!bill_id || !Array.isArray(items)) {
        return res.status(400).json({
            success: false,
            message: "Bill ID and items array are required"
        });
    }
    
    try {
        // First check if the bill exists
        const billExists = await new Promise((resolve, reject) => {
            db.query(
                "SELECT bill_id FROM BILL_RECORD WHERE bill_id = ?",
                [bill_id],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results.length > 0);
                }
            );
        });
        
        if (!billExists) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }
        
        // Begin transaction for data consistency
        await new Promise((resolve, reject) => {
            db.beginTransaction(err => err ? reject(err) : resolve());
        });
        
        try {
            // Get existing items to determine which need updating vs inserting
            const existingItems = await new Promise((resolve, reject) => {
                db.query(
                    "SELECT * FROM ITEM_DETAIL WHERE bill_id = ?",
                    [bill_id],
                    (err, results) => err ? reject(err) : resolve(results)
                );
            });
            
            const existingItemIds = existingItems.map(item => item.item_id);
            
            // Process each item: update existing ones, add new ones
            for (const item of items) {
                if (item.item_id && existingItemIds.includes(item.item_id)) {
                    // Update existing item
                    await new Promise((resolve, reject) => {
                        db.query(
                            "UPDATE ITEM_DETAIL SET item_amount = ?, user_id = ?, item_name = ? WHERE item_id = ?",
                            [item.item_amount, item.user_id, item.item_name, item.item_id],
                            (err) => err ? reject(err) : resolve()
                        );
                    });
                } else {
                    // Insert new item
                    await new Promise((resolve, reject) => {
                        db.query(
                            "INSERT INTO ITEM_DETAIL (item_amount, bill_id, user_id, item_name) VALUES (?, ?, ?, ?)",
                            [item.item_amount, bill_id, item.user_id, item.item_name],
                            (err) => err ? reject(err) : resolve()
                        );
                    });
                }
            }
            
            // Delete items that are no longer in the updated list
            const updatedItemIds = items
                .filter(item => item.item_id)
                .map(item => item.item_id);
            
            const itemsToDelete = existingItemIds.filter(id => !updatedItemIds.includes(id));
            
            if (itemsToDelete.length > 0) {
                await new Promise((resolve, reject) => {
                    db.query(
                        "DELETE FROM ITEM_DETAIL WHERE item_id IN (?)",
                        [itemsToDelete],
                        (err) => err ? reject(err) : resolve()
                    );
                });
            }
            
            // Commit the transaction
            await new Promise((resolve, reject) => {
                db.commit(err => err ? reject(err) : resolve());
            });
            
            res.json({
                success: true,
                message: "Items updated successfully"
            });
            
        } catch (error) {
            // Rollback on error
            await new Promise((resolve) => {
                db.rollback(() => resolve());
            });
            throw error;
        }
        
    } catch (error) {
        console.error("Error updating items:", error);
        res.status(500).json({
            success: false,
            message: "Error updating items"
        });
    }
});

app.get('/getItems', (req, res) => {
    const { bill_id } = req.query;

    if (!bill_id) {
        return res.status(400).json({ 
            success: false,
            error: "Bill ID is required" 
        });
    }

    const query = `
        SELECT id.*, u.user_name
        FROM ITEM_DETAIL id
        JOIN USER u ON id.user_id = u.user_id
        WHERE id.bill_id = ?
        ORDER BY id.item_id
    `;

    db.query(query, [bill_id], (err, results) => {
        if (err) {
            console.error("Error fetching items:", err);
            return res.status(500).json({ 
                success: false,
                error: "Error fetching items" 
            });
        }

        // Return just the array of items without wrapping it in an object
        // This matches what the frontend expects
        res.json(results);
    });
});

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
                -- Calculate the rate to use based on credit_card flag
                CASE 
                    WHEN b.credit_card = 1 THEN r.spot_rate/10000
                    ELSE (yr.JPY / yr.NTD)/10000
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
                -- Calculate the rate to use based on credit_card flag
                CASE 
                    WHEN b.credit_card = 1 THEN r.spot_rate/10000
                    ELSE (yr.NTD / yr.JPY)/10000
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
                -- Calculate the rate to use based on credit_card flag
                CASE 
                    WHEN b.credit_card = 1 THEN r.spot_rate/10000
                    ELSE (yr.NTD / yr.JPY)/10000
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

// Update the endpoint name to match what the frontend expects (plural 'getSplitRecords')
app.get('/getSplitRecords', (req, res) => {
    const { bill_id } = req.query;

    if (!bill_id) {
        return res.status(400).json({ 
            success: false,
            error: "Bill ID is required" 
        });
    }

    db.query(
        `SELECT sr.*, u.user_name 
         FROM SPLIT_RECORD sr 
         JOIN USER u ON sr.user_id = u.user_id 
         WHERE sr.bill_id = ?`,
        [bill_id],
        (err, results) => {
            if (err) {
                console.error("Error fetching split records:", err);
                return res.status(500).json({ 
                    success: false,
                    error: "Error fetching split records" 
                });
            }
            
            // Return the results directly to match frontend expectations
            res.json(results);
        }
    );
});

// Add the PUT endpoint for updateSplitRecord
app.put('/updateSplitRecord', (req, res) => {
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

        // Check if total equals 100% (10000 basis points)
        if (totalPercentage !== 10000) {
            console.error(`Total percentage is not 100%: ${totalPercentage/100}%`);
            return res.status(400).json({ 
                success: false,
                message: `Total percentage must be 100%, current total is: ${totalPercentage/100}%` 
            });
        }

        // Begin transaction
        db.beginTransaction(err => {
            if (err) {
                console.error("Error starting transaction:", err);
                return res.status(500).json({ 
                    success: false,
                    message: "Database error" 
                });
            }

            // Delete existing records
            db.query(
                "DELETE FROM SPLIT_RECORD WHERE bill_id = ?",
                [bill_id],
                async (deleteErr) => {
                    if (deleteErr) {
                        return db.rollback(() => {
                            console.error("Error deleting old records:", deleteErr);
                            res.status(500).json({ 
                                success: false,
                                message: "Error deleting old records" 
                            });
                        });
                    }

                    try {
                        // Insert new records with the updated percentages
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

                        // Commit the transaction
                        db.commit(err => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error("Error committing transaction:", err);
                                    res.status(500).json({ 
                                        success: false,
                                        message: "Error updating split records" 
                                    });
                                });
                            }

                            res.json({
                                success: true,
                                message: "Split records updated successfully",
                                splitDetails: Object.entries(percentages).map(([user_id, percentage]) => ({
                                    user_id,
                                    percentage: parseInt(percentage)
                                }))
                            });
                        });

                    } catch (insertError) {
                        return db.rollback(() => {
                            console.error("Error inserting records:", insertError);
                            res.status(500).json({ 
                                success: false,
                                message: "Error updating split records" 
                            });
                        });
                    }
                }
            );
        });

    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ 
            success: false,
            message: "Error processing request" 
        });
    }
});
// Replace the current server startup code
if (!options) {
    // Start HTTPS server if certificates are available
    const server = https.createServer(options, app);
    server.listen(3002, '0.0.0.0', () => {
      console.log('OK, HTTPS server is running on port 3002');
    });
} else {
// Fallback to HTTP if no certificates
    app.listen(3002, '0.0.0.0', () => {
    console.log('OK, HTTP server is running on port 3002');
    console.log('NOTE: Running in insecure HTTP mode. Generate SSL certificates for HTTPS.');
    });
}