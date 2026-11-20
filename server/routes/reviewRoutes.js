import express from 'express';
import multer from 'multer';
import { analyzeReviews } from '../controllers/reviewController.js';
import { generateReply } from '../controllers/replyController.js';

const router = express.Router();

// Configure Multer for in-memory file handling with a 5MB size limit
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check for CSV extension or mime type
    const isCsv =
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.toLowerCase().endsWith('.csv');

    if (isCsv) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed. Please upload a .csv file.'));
    }
  }
});

// CSV Upload & Batch Analysis endpoint
router.post('/analyze', upload.single('file'), analyzeReviews);

// On-demand suggested reply generation endpoint
router.post('/:reviewId/reply', express.json(), generateReply);

export default router;
