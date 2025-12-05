// backend/routes/file.route.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { GridFSBucket } = require('mongodb');

const auth = require("../middleware/auth.middleware");
// const requireRole = require("../middleware/role.middleware"); // optional

// Download latest CSV (protected)
router.get('/download-csv', auth, async (req, res) => {
  try {
    const conn = mongoose.connection;
    const bucket = new GridFSBucket(conn.db, { bucketName: 'csvFiles' });

    const filesCursor = await bucket.find({ contentType: 'text/csv' }).toArray();
    if (!filesCursor.length) return res.status(404).json({ error: 'No CSV file found' });

    const latestFile = filesCursor.sort((a, b) => b.uploadDate - a.uploadDate)[0];

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${latestFile.filename}"`,
    });

    const downloadStream = bucket.openDownloadStream(latestFile._id);
    downloadStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to download CSV file' });
  }
});

module.exports = router;
