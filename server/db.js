const sqlite3 = require('sqlite3').verbose();
const dbName = 'waiting_list.db';

let db = new sqlite3.Database(dbName, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS waiting_list (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            job_group TEXT,
            years INTEGER,
            phone TEXT,
            list_type TEXT DEFAULT '컨설팅 1',
            status TEXT DEFAULT 'waiting',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            (err) => {
                if (err) {
                    // Table already created
                } else {
                    // Table just created
                    console.log("Table 'waiting_list' ready.");
                }
            });

        // Add list_type column if it doesn't exist (for existing databases)
        db.run(`ALTER TABLE waiting_list ADD COLUMN list_type TEXT DEFAULT '컨설팅 1'`, (err) => {
            if (err) {
                // Column already exists or other error
                console.log("list_type column already exists or error:", err.message);
            } else {
                console.log("Added list_type column to existing table.");
            }
        });
    }
});

module.exports = db;
