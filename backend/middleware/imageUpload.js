// middleware/imageUpload.js
const Busboy = require('busboy');
const { fileTypeFromBuffer } = require('file-type');

const allowedMimePrefixes = ['image/'];
const maxFileSizeMB      = 2;

function validateProfileImage() {
  return (req, res, next) => {
    const busboy = Busboy({ headers: req.headers });
    const bufferChunks = [];
    let totalBytes = 0;
    let fileProcessedPromise = Promise.resolve();

    req.body = {};
    let fileCount = 0;

    busboy.on('file', (fieldname, file, info) => {
      // info = { filename, encoding, mimeType }
      const { filename, encoding, mimeType } = info;
      const mimetype = mimeType;

      // ignore other fields
      if (fieldname !== 'avatar') {
        file.resume();
        return;
      }

      // early mime‐type guard
      if (!allowedMimePrefixes.some(prefix => mimetype.startsWith(prefix))) {
        file.resume();
        return res.status(400).json({ error: 'Only image files are allowed.' });
      }

      if (fileCount >= 1) {
        file.resume();
        return res.status(400).json({ error: 'Only one image is allowed.' });
      }
      fileCount++;

      fileProcessedPromise = new Promise((resolve, reject) => {
        file.on('data', chunk => {
          totalBytes += chunk.length;
          if (totalBytes > maxFileSizeMB * 1024 * 1024) {
            return reject({ error: 'Image must be smaller than 2MB.' });
          }
          bufferChunks.push(chunk);
        });

        file.on('end', async () => {
          try {
            const finalBuffer = Buffer.concat(bufferChunks);
            const fileType    = await fileTypeFromBuffer(finalBuffer);

            if (
              !fileType ||
              !allowedMimePrefixes.some(prefix => fileType.mime.startsWith(prefix))
            ) {
              return reject({ error: 'Only image files are allowed.' });
            }

            req.fileBuffer = finalBuffer;
            req.fileMeta   = {
              filename,
              mime:     fileType.mime,
              ext:      fileType.ext,
            };
            resolve();
          } catch (err) {
            reject({ error: 'Failed to process image.', detail: err });
          }
        });

        file.on('error', err => reject({ error: 'File stream error', detail: err }));
      });
    });

    busboy.on('field', (name, val) => {
      req.body[name] = val;
    });

    busboy.on('finish', async () => {
      try {
        await fileProcessedPromise;
        next();
      } catch (err) {
        if (process.env.NODE_ENV !== 'test') {
          console.error('❌ File processing error:', err);
        }
        
        res.status(400).json(err);
      }
    });

    req.pipe(busboy);
  };
}
function validateBlogCoverImage() {
  return (req, res, next) => {
    const busboy = Busboy({ headers: req.headers });
    const chunks = [];
    let totalBytes = 0;
    let filePromise = Promise.resolve();
    req.body = {};
    let count = 0;

    busboy.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;
      if (fieldname !== 'coverImage') {
        file.resume();
        return;
      }
      if (!allowedMimePrefixes.some(prefix => mimeType.startsWith(prefix))) {
        file.resume();
        return res.status(400).json({ error: 'Invalid image type.' });
      }
      if (count++ > 0) {
        file.resume();
        return res.status(400).json({ error: 'Only one image allowed.' });
      }

      filePromise = new Promise((resolve, reject) => {
        file.on('data', chunk => {
          totalBytes += chunk.length;
          if (totalBytes > maxFileSizeMB * 1024 * 1024) {
            return reject({ error: `Image too large (max ${maxFileSizeMB}MB).` });
          }
          chunks.push(chunk);
        });
        file.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            const typeInfo = await fileTypeFromBuffer(buffer);
            if (!typeInfo || !allowedMimePrefixes.some(prefix => typeInfo.mime.startsWith(prefix))) {
              return reject({ error: 'Invalid image type.' });
            }
            req.fileBuffer = buffer;
            req.fileMeta   = { filename, mime: typeInfo.mime, ext: typeInfo.ext };
            resolve();
          } catch {
            reject({ error: 'Failed to process image.' });
          }
        });
        file.on('error', () => reject({ error: 'File stream error.' }));
      });
    });

    busboy.on('field', (name, val) => { req.body[name] = val });
    busboy.on('finish', async () => {
      try {
        await filePromise;
        
        req.file = {
          buffer: req.fileBuffer,
          ...req.fileMeta
        };
        next();
      } catch (err) {
        res.status(400).json(err);
      }
    });
    
    req.pipe(busboy);
  };
}

async function validateBlogContentImages(req, res, next) {
  try {
    const content = req.body.content;
    const doc = typeof content === 'string' ? JSON.parse(content) : content;
    if (doc && Array.isArray(doc.blocks)) {
      for (const blk of doc.blocks) {
        if (blk.type === 'image' && blk.data?.file?.url?.startsWith('data:')) {
          const match = blk.data.file.url.match(/^data:(.+);base64,(.+)$/);
          if (!match) {
            throw { error: 'Invalid image data URI.' };
          }
          const mime = match[1];
          const b64  = match[2];
          if (!allowedMimePrefixes.some(prefix => mime.startsWith(prefix))) {
            throw { error: 'Invalid image type.' };
          }
          const buffer = Buffer.from(b64, 'base64');
          if (buffer.length > maxFileSizeMB * 1024 * 1024) {
            throw { error: `Image too large (max ${maxFileSizeMB}MB).` };
          }
        }
      }
    }
    next();
  } catch (err) {
    res.status(400).json(err);
  }
}

module.exports = { validateProfileImage,validateBlogCoverImage,validateBlogContentImages };
