import { config } from 'dotenv';
import express from 'express';
import multer from 'multer';
import { PDFExtract } from 'pdf.js-extract';
import path from 'path';
import { fileURLToPath } from 'url';

config();

// populate expected globals not available in es modules
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const app = express();
const pdfExtract = new PDFExtract();
const production = process.env.NODE_ENV === 'production';

const dir = production ? '../dist' : '../public';
const indexPath = path.resolve(__dirname, dir);
app.use(express.static(indexPath));

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

      // https://open.spotify.com/track/7k1Xm1wy00hCKJDYJL5p1n?si=6567f7f7c6ba4fd4
      let texas = new Set();
      // while the x position is increasing, capture each unique non-empty x position
      // these will be used as our guide for filling the output array
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

      const xpositions = [...texas];
      // page content
      for (let row = 0; row < dataFrame.length; row++) {
        const currentRow = output.length - 1;
        const targetX = xpositions[currentColumn];
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

const {
  PORT = 9090,
  HOST = 'localhost',
} = process.env;

app.listen(PORT, HOST, () => {
  console.log(`Server running at ${HOST}:${PORT}`);
});
