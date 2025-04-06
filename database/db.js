const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../BCA_DB/applications.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    motherName TEXT,
    fatherName TEXT,
    dob TEXT,
    gender TEXT,
    mobile TEXT,
    email TEXT,
    address TEXT,
    nationality TEXT,
    religion TEXT,
    category TEXT,
    casteCertNo TEXT,
    annualIncome TEXT,
    incomeCertNo TEXT,
    tenthBoard TEXT,
    tenthPercent TEXT,
    twelfthBoard TEXT,
    twelfthCombo TEXT,
    twelfthMaxMarks TEXT,
    twelfthMarksScored TEXT,
    twelfthPercent TEXT,
    submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
