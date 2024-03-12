require('dotenv').config();
const express = require('express');
const axios = require('axios');
const http = require('http');
const multer = require('multer');
const { resolve } = require('path');
const { PDFExtract } = require('pdf.js-extract');
const qrcode = require('qrcode');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const pdfExtract = new PDFExtract();
const production = process.env.NODE_ENV === 'production';

io.on('connection', (socket) => {
  console.log('someone connected');
});

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

const dir = production ? '../dist' : '../public';
const indexPath = resolve(__dirname, dir);
app.use(express.static(indexPath));

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

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const dataFrame = pages[pageIndex];
      for (let row = 0; row < dataFrame.length; row++) {
        let currentRow = output.length - 1;
        const { x, y, str } = dataFrame[row];
        // new row when empty string, cur x is less than last and cur y is greater than last
        const isNewRow = (str === NEWLINE && x < previousX && y > previousY);
        // new page when the pageIndex has incremented and previousX and previousY have been reset
        const isNewPage = (pageIndex > 0 && previousX === -1 && previousY === -1);
        // new column when empty or blank space and x is greater than previous
        const isNewColumn = (str.trim() === NEWLINE && x > previousX);

        if (isNewPage || isNewRow) {
          output.push([]);
          currentColumn = 0;
          continue;
        }

        if (isNewColumn) {
          currentColumn++;
          continue;
        }

        // concat content onto any existing content and trim trailing or leading space
        output[currentRow][currentColumn] = `${(output[currentRow][currentColumn] || '')} ${str}`.trim();

        previousX = x;
        previousY = y;
      }

      previousX = -1;
      previousY = -1;
    }

    const [headers, ...rows] = output;
    // map column indices to header keys
    res.json(rows.map((value) => Object.fromEntries(headers.map((header, i) => [header, value[i] ?? '']))));
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing the PDF file');
  }
});

app.get('/geo', async (req, res) => {
  const [, search] = req.url.split('?');
  const base = 'https://nominatim.openstreetmap.org';
  const { data } = await axios.get(`${base}/search?format=geojson&${search}`);
  const [first = { error: 'not found' }] = data.features;
  res.json(first);
});

app.get('/join/:id', (req, res) => {
  res.json({ joining: req.params.id });
})

app.get('/qr', async (req, res) => {
  const session = 'foobar';
  const url = `http://localhost:9090/join/${session}`;
  const qr = await qrcode.toDataURL(url);
  res.json({ qr });
});

server.listen(process.env.PORT, process.env.HOST, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
