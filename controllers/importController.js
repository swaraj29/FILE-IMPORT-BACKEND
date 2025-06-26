import XLSX from 'xlsx';
import fs from 'fs';
import Attendee from '../models/Attendee.js';
import cleanPhone from '../utils/cleanPhone.js';

// ========== 1. IMPORT EXCEL OR CSV FILE ===============
export const handleImport = async (req, res) => {
  try {
    const filePath = req.file.path;
    // Read the uploaded Excel or CSV file
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    // Clean and reformat the data
    const cleaned = rawData.map(row => ({
      email: row.Email?.toLowerCase().trim(),
      firstName: row["First Name"]?.trim(),
      lastName: row["Last Name"]?.trim(),
      phone: cleanPhone(row.Phone),
      location: row.Location,
      gender: row.Gender,
      source: row.Source || 'Referral',
      sessionMinutes: parseInt(row["Session Time (mins)"]) || parseInt(row["Time in Session"]) || 0,
      joinTime: row["Join Time"] ? new Date(row["Join Time"]) : null,
      leaveTime: row["Leave Time"] ? new Date(row["Leave Time"]) : null
    }));

    // Delete all existing attendees before inserting new ones
    await Attendee.deleteMany({});
    await Attendee.insertMany(cleaned);

    // Respond to client first for speed
    res.status(200).json({
      message: 'File processed successfully (all previous attendees deleted)',
      total: cleaned.length,
      inserted: cleaned.length
    });

    // Delete the uploaded file asynchronously (non-blocking)
    fs.unlink(filePath, err => {
      if (err) console.error('Failed to delete file:', err);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Import failed' });
  }
};

// ========== 2. GET ALL ATTENDEES (INCLUDING DUPLICATES) ===============
export const getAllAttendees = async (req, res) => {
  try {
    const data = await Attendee.find().lean();
    res.json({ total: data.length, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attendees' });
  }
};

// ========== 3. GET UNIQUE ATTENDEES BY EMAIL + SUM SESSION MINUTES ===============
export const getUniqueAttendees = async (req, res) => {
  try {
    const all = await Attendee.find().lean();

    const emailMap = new Map();

    for (const rec of all) {
      const emailKey = rec.email?.toLowerCase().trim();
      if (!emailKey) continue;

      const mins = Number(rec.sessionMinutes) || 0;

      if (!emailMap.has(emailKey)) {
        emailMap.set(emailKey, {
          ...rec,
          sessionMinutes: mins
        });
      } else {
        const existing = emailMap.get(emailKey);
        existing.sessionMinutes += mins;
      }
    }

    // Convert map to array
    const unique = Array.from(emailMap.values());

    // Sort by sessionMinutes descending
    unique.sort((a, b) => b.sessionMinutes - a.sessionMinutes);

    res.json({
      uniqueCount: unique.length,
      unique
    });
  } catch (err) {
    console.error('Error in getUniqueAttendees:', err);
    res.status(500).json({ error: 'Failed to fetch unique attendees' });
  }
};