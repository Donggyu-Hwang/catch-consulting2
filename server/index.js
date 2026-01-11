const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const app = express();
const PORT = 3001;

// Helper function to get KST (GMT+9) timestamp
function getKSTTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

app.use(cors());
app.use(bodyParser.json());

// Get entire waitlist (for Admin)
app.get('/api/waitlist', (req, res) => {
    const { list_type } = req.query;
    let sql = "SELECT * FROM waiting_list";
    let params = [];

    if (list_type && list_type !== 'all') {
        sql += " WHERE list_type = ?";
        params.push(list_type);
    }

    sql += " ORDER BY status = 'waiting' DESC, created_at ASC";

    console.log('SQL:', sql, 'Params:', params);

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        console.log('Found', rows.length, 'records');
        res.json({
            "message": "success",
            "data": rows
        })
    });
});

// Add to waitlist
app.post('/api/waitlist', (req, res) => {
    const { name, job_group, years, phone, list_type } = req.body;
    const kstTime = getKSTTimestamp();
    const sql = 'INSERT INTO waiting_list (name, job_group, years, phone, list_type, created_at) VALUES (?,?,?,?,?,?)';
    const params = [name, job_group, years, phone, list_type || '컨설팅 1', kstTime];
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message })
            return;
        }
        res.json({
            "message": "success",
            "data": req.body,
            "id": this.lastID
        })
    });
});

// Bulk add to waitlist (for Excel import) - with upsert support
app.post('/api/waitlist/bulk', (req, res) => {
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
        res.status(400).json({ "error": "entries must be a non-empty array" });
        return;
    }

    let completed = 0;
    let inserted = 0;
    let updated = 0;
    let errors = [];

    entries.forEach((entry, index) => {
        const { name, job_group, years, phone, list_type } = entry;
        const kstTime = getKSTTimestamp();

        // First check if entry exists by phone
        db.get("SELECT id FROM waiting_list WHERE phone = ?", [phone], (err, row) => {
            if (err) {
                errors.push({ index, error: err.message });
                completed++;
                checkComplete();
                return;
            }

            if (row) {
                // Update existing (don't change created_at)
                const updateSql = `UPDATE waiting_list SET name = ?, job_group = ?, years = ?, list_type = ? WHERE phone = ?`;
                db.run(updateSql, [name, job_group, years, list_type || '컨설팅 1', phone], function (err) {
                    if (err) {
                        errors.push({ index, error: err.message });
                    } else {
                        updated++;
                    }
                    completed++;
                    checkComplete();
                });
            } else {
                // Insert new with KST timestamp
                const insertSql = 'INSERT INTO waiting_list (name, job_group, years, phone, list_type, created_at) VALUES (?,?,?,?,?,?)';
                db.run(insertSql, [name, job_group, years, phone, list_type || '컨설팅 1', kstTime], function (err) {
                    if (err) {
                        errors.push({ index, error: err.message });
                    } else {
                        inserted++;
                    }
                    completed++;
                    checkComplete();
                });
            }
        });
    });

    function checkComplete() {
        if (completed === entries.length) {
            res.json({
                "message": "success",
                "inserted": inserted,
                "updated": updated,
                "total": inserted + updated,
                "errors": errors
            });
        }
    }
});

// Update status
app.put('/api/waitlist/:id', (req, res) => {
    const { status } = req.body;
    const sql = `UPDATE waiting_list SET status = ? WHERE id = ?`;
    const params = [status, req.params.id];
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": res.message })
            return;
        }
        res.json({
            message: "success",
            changes: this.changes
        })
    });
});

// Postpone (swap with next person)
app.put('/api/waitlist/:id/postpone', (req, res) => {
    const currentId = req.params.id;

    // Get current person's info
    db.get("SELECT * FROM waiting_list WHERE id = ?", [currentId], (err, currentPerson) => {
        if (err || !currentPerson) {
            res.status(400).json({ "error": "Person not found" });
            return;
        }

        // Find next person in same list_type with waiting status, created after current person
        const sql = `SELECT * FROM waiting_list
                     WHERE list_type = ? AND status = 'waiting' AND created_at > ?
                     ORDER BY created_at ASC
                     LIMIT 1`;

        db.get(sql, [currentPerson.list_type, currentPerson.created_at], (err, nextPerson) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }

            if (!nextPerson) {
                res.status(400).json({ "error": "No next person to swap with" });
                return;
            }

            // Swap their created_at timestamps
            const currentTimestamp = currentPerson.created_at;
            const nextTimestamp = nextPerson.created_at;

            db.run(`UPDATE waiting_list SET created_at = ? WHERE id = ?`, [nextTimestamp, currentId], (err) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }

                db.run(`UPDATE waiting_list SET created_at = ? WHERE id = ?`, [currentTimestamp, nextPerson.id], (err) => {
                    if (err) {
                        res.status(400).json({ "error": err.message });
                        return;
                    }

                    res.json({
                        message: "success",
                        swapped: true,
                        current: { id: currentId, name: currentPerson.name },
                        next: { id: nextPerson.id, name: nextPerson.name }
                    });
                });
            });
        });
    });
});

// Get customer status (returns all active entries for the phone number, excluding completed/cancelled)
app.get('/api/waitlist/status/:phone', (req, res) => {
    const phone = req.params.phone;
    // Find all active entries (exclude: completed, cancelled)
    db.all("SELECT * FROM waiting_list WHERE phone = ? AND status IN ('waiting', 'called', 'onsite', 'absent', 'consulting') ORDER BY created_at ASC", [phone], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (!rows || rows.length === 0) {
            console.log('Status check for', phone, ': not found or no active entries');
            res.json({ "message": "not_found", "data": [] });
            return;
        }

        console.log('Status check for', phone, ': found', rows.length, 'active entries');

        // For each entry, count how many ahead in the same list_type
        // Include: waiting, called, onsite, absent, consulting (exclude: completed, cancelled)
        const entriesWithAhead = rows.map(row => {
            return new Promise((resolve, reject) => {
                db.get("SELECT COUNT(*) as count FROM waiting_list WHERE status IN ('waiting', 'called', 'onsite', 'absent', 'consulting') AND list_type = ? AND created_at < ?", [row.list_type, row.created_at], (err, countRow) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            ...row,
                            ahead: countRow.count
                        });
                    }
                });
            });
        });

        Promise.all(entriesWithAhead)
            .then(results => {
                res.json({
                    "message": "found",
                    "data": results,
                    "count": results.length
                });
            })
            .catch(err => {
                res.status(400).json({ "error": err.message });
            });
    });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
