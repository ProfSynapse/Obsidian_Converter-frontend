const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { convertToMarkdown } = require('../src/converter'); // Import your conversion function

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    const { buffer } = req.file;
    const apiKey = req.body.apiKey;
    const markdown = await convertToMarkdown(buffer.toString(), apiKey);
    res.json({ markdown });
  } catch (error) {
    console.error('Error converting file:', error);
    res.status(500).json({ error: 'An error occurred during conversion' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});