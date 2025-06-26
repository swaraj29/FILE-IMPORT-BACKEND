import express from 'express';
import multer from 'multer';
import { handleImport, getAllAttendees, getUniqueAttendees } from '../controllers/importController.js';

const router = express.Router();
const upload = multer({ dest: 'backend/uploads/' });

router.post('/upload', upload.single('file'), handleImport);
router.get('/data', getAllAttendees); // all data, including duplicates
router.get('/duplicates', getUniqueAttendees); // only unique data

export default router;
