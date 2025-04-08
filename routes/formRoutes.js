const express = require('express');
const router = express.Router();
const db = require('../database/db');
const axios = require('axios');

router.get('/', (req, res) => {
  const lang = req.query.lang || 'kn';
  res.render('home', { lang });
});

router.get('/notification', (req, res) => {
  const lang = req.query.lang || 'kn'; // default Kannada
  res.render('notification', { lang });
});

router.get('/apply', (req, res) => {
  res.render('apply');
});

router.post('/submit', async (req, res) => {
  const data = req.body;

  // 🔍 1. First, check if Aadhaar number already exists
  db.get(`SELECT * FROM applications WHERE adharNumber = ?`, [data.adharNumber], async (err, row) => {
    if (err) {
      console.error("DB error during Aadhaar check:", err.message);
      return res.status(500).send("Internal Server Error");
    }

    if (row) {
      // ⚠️ Aadhaar already exists – show red popup and redirect back
      return res.send(`
        <html>
          <head>
            <script>
              alert("❌ Aadhaar number already registered! Please use a different one.");
              window.history.back();
            </script>
          </head>
          <body style="background-color:#ffe5e5; text-align:center; padding:50px; font-family:sans-serif;">
            <h2 style="color:#b00000;">❗ Aadhaar Already Registered</h2>
            <p>Please go back and verify your details.</p>
          </body>
        </html>
      `);
    }

    // ✅ Proceed with insert if Aadhaar is unique
    const stmt = db.prepare(`
      INSERT INTO applications (
        name, motherName, fatherName, dob, gender,
        mobile, guardianMobile, email, parentEmail, adharNumber,

        permLandmark, permVillage, permPincode, permTaluka, permDistrict, permState,
        presLandmark, presVillage, presPincode, presTaluka, presDistrict, presState,

        nationality, otherNationality, religion, otherReligion,
        category, casteCertNo, annualIncome, incomeCertNo,

        tenthBoard, otherTenthBoard, tenthPercent,
        twelfthBoard, otherTwelfthBoard, twelfthCombo, otherTwelfthCombo,
        twelfthMaxMarks, twelfthMarksScored, twelfthPercent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.name, data.motherName, data.fatherName, data.dob, data.gender,
      data.mobile || '', data.guardianMobile, data.email, data.parentEmail || '', data.adharNumber,

      data.permLandmark, data.permVillage, data.permPincode, data.permTaluka, data.permDistrict, data.permState,
      data.presLandmark, data.presVillage, data.presPincode, data.presTaluka, data.presDistrict, data.presState,

      data.nationality, data.otherNationality || '', data.religion, data.otherReligion || '',
      data.category, data.casteCertNo || '', data.annualIncome, data.incomeCertNo,

      data.tenthBoard, data.otherTenthBoard || '', data.tenthPercent,
      data.twelfthBoard, data.otherTwelfthBoard || '', data.twelfthCombo, data.otherTwelfthCombo || '',
      data.twelfthMaxMarks, data.twelfthMarksScored, data.twelfthPercent,

      async function (err) {
        if (err) {
          console.error('DB error:', err.message);
          return res.status(500).send("Database Error");
        }

        const applicationId = this.lastID;
        const applicationNumber = `BU_BCA_2025-26_${applicationId}`;

        db.run(
          `UPDATE applications SET applicationNumber = ? WHERE id = ?`,
          [applicationNumber, applicationId],
          async (updateErr) => {
            if (updateErr) {
              console.error("Application number update failed:", updateErr.message);
            }

            try {
              await axios.post('https://script.google.com/macros/s/AKfycbxsBGzTeyycGQqzfLTyyQfY4GwBL7XOC7Ol3XLSTOR5IYJ7LltKuwkLWbE-EWM8pBtG/exec', {
                ...data,
                id: applicationId,
                applicationNumber
              });
              console.log('Synced to Google Sheets');
            } catch (err) {
              console.error('Google Sheets sync failed:', err.message);
            }

            res.redirect(`/submitted/${applicationNumber}`);
          }
        );
      }
    );

    stmt.finalize();
  });
});


router.get('/submitted/:applicationNumber', (req, res) => {
  const applicationNumber = req.params.applicationNumber;

  db.get("SELECT * FROM applications WHERE applicationNumber = ?", [applicationNumber], (err, row) => {
    if (err || !row) {
      return res.status(404).send("Application not found");
    }

    res.render('submitted', { data: row });
  });
});

router.get('/verify', (req, res) => {
  res.render('verify'); // create this view
});

router.post('/verify', (req, res) => {
  const { applicationNumber, dob } = req.body;

  db.get("SELECT * FROM applications WHERE applicationNumber = ? AND dob = ?", [applicationNumber, dob], (err, row) => {
    if (err || !row) {
      return res.status(404).send("Application not found or DOB mismatch");
    }
    res.render("print", { data: row });
  });
});


router.get('/print/:applicationNumber', (req, res) => {
  const applicationNumber = req.params.applicationNumber;

  db.get("SELECT * FROM applications WHERE applicationNumber = ?", [applicationNumber], (err, row) => {
    if (err || !row) {
      return res.status(404).send("Application not found");
    }
    res.render("print", { data: row });
  });
});


module.exports = router;
