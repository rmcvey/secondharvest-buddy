import { config } from 'dotenv';
import express from 'express';
import axios from 'axios';
import http from 'http';
import multer from 'multer';
import { PDFExtract } from 'pdf.js-extract';
import qrcode from 'qrcode';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

config();

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

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
const indexPath = path.resolve(__dirname, dir);
app.use(express.static(indexPath));

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const options = { password: req.body.password };
    const pdfBuffer = req.file.buffer;  // Get the Buffer of the uploaded file
    const pdfData = await pdfExtract.extractBuffer(pdfBuffer, options);
    const pages = pdfData.pages.map(({ content }) => content);
    const NEWLINE = '';
    const output = [[]];
    const WIGGLE_ROOM = 5;

    // iterate over pdf pages
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      let currentColumn = 0;
      const dataFrame = pages[pageIndex];

      let texas = new Set();
      // page content, early break
      for (let i = 0; i < dataFrame.length; i++) {
        const { x, str } = dataFrame[i];
        const { x: prevX } = (dataFrame[i - 1] ?? { x: -Infinity, y: Infinity });
        if (x >= prevX) {
          if (str.trim()) {
            texas.add(x)
          }
        } else {
          break;
        }
      }

      texas = [...texas];
      // page content
      for (let row = 0; row < dataFrame.length; row++) {
        const currentRow = output.length - 1;
        const targetX = texas[currentColumn];
        const { x, y, str } = dataFrame[row];
        const { x: prevX, y: prevY } = (dataFrame[row - 1] ?? { x: -Infinity, y: Infinity });
        const isNewColumn = (str.trim() === NEWLINE && x > prevX);
        const isNewRow = (x < prevX && y > prevY);
        const isNewPage = (pageIndex > 0 && prevX === -Infinity && prevY === Infinity);

        // first column reset
        if (isNewRow || isNewPage) {
          output.push([]);
          currentColumn = 0;
          continue;
        }

        if (isNewColumn) {
          currentColumn++;
          continue;
        }

        // column miss, fill in the blank
        if (Math.abs(targetX - x) > WIGGLE_ROOM) {
          output[currentRow].push('');
          currentColumn++;
        }

        output[currentRow][currentColumn] = `${(output[currentRow][currentColumn] || '')} ${str}`.trim();
      }
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
});

app.get('/qr', async (req, res) => {
  const session = 'foobar';
  const url = `http://localhost:9090/join/${session}`;
  const qr = await qrcode.toDataURL(url);
  res.json({ qr });
});

server.listen(process.env.PORT, process.env.HOST, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
