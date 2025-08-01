import express from 'express';
import cors from 'cors';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { CVParser } from './cv-parser.js';
import { EmailService } from './email-service.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  }
});

// Initialize services
const cvParser = new CVParser();
const emailService = new EmailService();

// Routes
app.post('/api/parse-cv', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const cvData = await cvParser.parseCV(req.file.path);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `CV parsed successfully. Found ${cvData.positions?.length || 0} positions and ${cvData.skills?.length || 0} skills.`,
      data: cvData
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/ask-cv-question', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const answer = await cvParser.askQuestion(question);

    res.json({
      success: true,
      answer: answer
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        error: 'Recipient (to), subject, and body are required'
      });
    }

    await emailService.sendEmail(to, subject, body);

    res.json({
      success: true,
      message: `Email sent successfully to ${to}`
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      cvParser: 'available',
      emailService: 'available'
    }
  });
});

// Serve static files for the frontend
app.use(express.static(path.join(process.cwd(), 'frontend', 'dist')));

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'frontend', 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`API Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});