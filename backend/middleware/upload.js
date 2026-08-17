import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

import { BadRequestError } from '../errors/customErrors.js';

// The extension comes from this map, never from the uploaded filename — a client
// could otherwise name a file "sofa.jpg.php" and have it written to disk verbatim.
const EXTENSION_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../public/uploads/products');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `${crypto.randomUUID()}.${EXTENSION_BY_MIME[file.mimetype]}`),
});

const fileFilter = (req, file, cb) => {
  if (!EXTENSION_BY_MIME[file.mimetype]) {
    cb(new BadRequestError('Only JPEG, PNG, WEBP or AVIF images are accepted'));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
});

export default upload;
