const express = require('express');
const router = express.Router();
const db = require('../database/db');
const axios = require('axios');

router.get('/', (req, res) => {
  res.render('home');
});

router.get('/apply', (req, res) => {
  res.render('apply');
});

router.post('/submit', async (req, res) => {
  const data = req.body;

  const stmt = db.prepare(`
    INSERT INTO applications (
      name, motherName, fatherName, dob, gender, mobile, email, address,
      nationality, religion, category, casteCertNo, annualIncome, incomeCertNo,
      tenthBoard, tenthPercent, twelfthBoard, twelfthCombo,
      twelfthMaxMarks, twelfthMarksScored, twelfthPercent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    data.name, data.motherName, data.fatherName, data.dob, data.gender,
    data.mobile, data.email, data.address, data.nationality, data.religion,
    data.category, data.casteCertNo, data.annualIncome, data.incomeCertNo,
    data.tenthBoard, data.tenthPercent, data.twelfthBoard, data.twelfthCombo,
    data.twelfthMaxMarks, data.twelfthMarksScored, data.twelfthPercent,

    async function (err) {
      if (err) {
        console.error('DB error:', err.message);
        return res.status(500).send("Database Error");
      }

      const applicationId = this.lastID;

      try {
        await axios.post('https://script.google.com/macros/s/AKfycbxsBGzTeyycGQqzfLTyyQfY4GwBL7XOC7Ol3XLSTOR5IYJ7LltKuwkLWbE-EWM8pBtG/exec', {
          ...data,
          id: applicationId
        });
        console.log('Synced to Google Sheets');
      } catch (err) {
        console.error('Google Sheets sync failed:', err.message);
      }

      // Redirect to the print page instead of showing success
      res.redirect(`/print/${applicationId}`);
    }
  );

  stmt.finalize();
});

router.get('/print/:id', (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM applications WHERE id = ?", [id], (err, row) => {
    if (err || !row) {
      return res.status(404).send("Application not found");
    }
    res.render("print", { data: row });
  });
});

module.exports = router;
