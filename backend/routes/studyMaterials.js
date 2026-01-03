const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const PDFParser = require('pdf2json'); 
const auth = require('../middleware/auth');
const StudyMaterial = require('../models/StudyMaterial');

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/materials');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to extract text from PDF
async function extractTextFromPDF(filepath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataError', (errData) => {
      reject(errData.parserError);
    });
    
    pdfParser.on('pdfParser_dataReady', () => {
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });
    
    pdfParser.loadPDF(filepath);
  });
}

// Upload study material
router.post('/upload', auth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, subject } = req.body;
    
    // Extract text from PDF using pdf2json
    const extractedText = await extractTextFromPDF(req.file.path);

    const material = new StudyMaterial({
      userId: req.userId,
      title: title || req.file.originalname,
      subject,
      filename: req.file.originalname,
      filepath: req.file.path,
      extractedText
    });

    await material.save();

    res.json({
      message: 'Study material uploaded successfully',
      material: {
        id: material._id,
        title: material.title,
        subject: material.subject,
        uploadedAt: material.uploadedAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload study material', 
      error: error.message 
    });
  }
});

// Get all study materials
router.get('/', auth, async (req, res) => {
  try {
    const materials = await StudyMaterial.find({ userId: req.userId })
      .select('-extractedText') // Don't send full text
      .sort({ uploadedAt: -1 });
    
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get materials by subject
router.get('/subject/:subject', auth, async (req, res) => {
  try {
    const materials = await StudyMaterial.find({
      userId: req.userId,
      subject: req.params.subject
    }).select('-extractedText');
    
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete study material
router.delete('/:id', auth, async (req, res) => {
  try {
    const material = await StudyMaterial.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Delete file from filesystem
    await fs.unlink(material.filepath).catch(() => {});
    
    res.json({ message: 'Study material deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;