const express = require('express');
const multer = require('multer');
const { PDFExtract } = require('pdf.js-extract');

const app = express();
const pdfExtract = new PDFExtract();

// Configure multer for memory storage, file filter, and size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },  // 2MB size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const options = { password: req.body.password };
    const pdfBuffer = req.file.buffer;  // Get the Buffer of the uploaded file

    const pdfData = await pdfExtract.extractBuffer(pdfBuffer, options);
    const pages = pdfData.pages.map(({ content }) => content);
    const NEWLINE = '';
    const output = [[]];

    let previousX = -1;
    let previousY = -1;
    let currentColumn = 0;

    pages.forEach((page, pageIndex) => {
      page.forEach((content) => {
        let currentRow = output.length - 1;
        const { x, y, str } = content;
        // new row when empty string, cur x is less than last and cur y is greater than last
        const isNewRow = (str === NEWLINE && x < previousX && y > previousY);
        // new page when the pageIndex has incremented and previousX and previousY have been reset
        const isNewPage = (pageIndex > 0 && previousX === -1 && previousY === -1);
        // new column when empty or blank space and x is greater than previous
        const isNewColumn = (str.trim() === NEWLINE && x > previousX);

        if (isNewPage || isNewRow) {
          output.push([]);
          currentColumn = 0;
        } else if (isNewColumn) {
          currentColumn++;
        } else {
          // concat content onto any existing content
          output[currentRow][currentColumn] = `${(output[currentRow][currentColumn] || '')} ${str}`.trim();
        }

        previousX = x;
        previousY = y;
      })

      previousX = -1;
      previousY = -1;
    });

    const [headers, ...results] = output;
    res.json(results.map((value) => Object.fromEntries(headers.map((header, i) => [header, value[i] ?? '']))));
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing the PDF file');
  }
});

const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
