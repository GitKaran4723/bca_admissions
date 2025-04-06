const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../BCA_DB/applications.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Personal Details
    name TEXT,
    motherName TEXT,
    fatherName TEXT,
    dob TEXT,
    gender TEXT,
    mobile TEXT,
    guardianMobile TEXT,
    email TEXT,
    parentEmail TEXT,

    -- Address
    permLandmark TEXT,
    permVillage TEXT,
    permPincode TEXT,
    permTaluka TEXT,
    permDistrict TEXT,
    permState TEXT,
    presLandmark TEXT,
    presVillage TEXT,
    presPincode TEXT,
    presTaluka TEXT,
    presDistrict TEXT,
    presState TEXT,

    -- Nationality & Religion
    nationality TEXT,
    otherNationality TEXT,
    religion TEXT,
    otherReligion TEXT,

    -- Category & Certificates
    category TEXT,
    casteCertNo TEXT,
    annualIncome TEXT,
    incomeCertNo TEXT,

    -- 10th Details
    tenthBoard TEXT,
    otherTenthBoard TEXT,
    tenthPercent TEXT,

    -- 12th Details
    twelfthBoard TEXT,
    otherTwelfthBoard TEXT,
    twelfthCombo TEXT,
    otherTwelfthCombo TEXT,
    twelfthMaxMarks TEXT,
    twelfthMarksScored TEXT,
    twelfthPercent TEXT,

    -- Meta
    applicationNumber TEXT,
    submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
