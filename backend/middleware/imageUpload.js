import Busboy from 'busboy';
import { fileTypeFromBuffer } from 'file-type';

const allowedMimePrefixes = ['image/'];
const maxFileSizeMB = 2;

export function validateProfileImage() {
  return (req, res, next) => {
    const busboy = Busboy({ headers: req.headers });
    const bufferChunks = [];
    let totalBytes = 0;
    let fileProcessedPromise = Promise.resolve(); 

    req.body = {};

    let fileCount = 0;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      if (fieldname !== 'avatar') {
        file.resume();
        return;
      }

      if (fileCount >= 1) {
        file.resume();
        return res.status(400).json({ error: 'Only one image is allowed.' });
      }

      fileCount++;

      fileProcessedPromise = new Promise((resolve, reject) => {
        file.on('data', (chunk) => {
          totalBytes += chunk.length;
          if (totalBytes > maxFileSizeMB * 1024 * 1024) {
            reject({ error: 'Image must be smaller than 2MB.' });
          }
          bufferChunks.push(chunk);
        });

        file.on('end', async () => {
          try {
            const finalBuffer = Buffer.concat(bufferChunks);
            const fileType = await fileTypeFromBuffer(finalBuffer);

            if (!fileType || !allowedMimePrefixes.some(prefix => fileType.mime.startsWith(prefix))) {
              return reject({ error: 'Only image files are allowed.' });
            }

            req.fileBuffer = finalBuffer;
            req.fileMeta = {
              filename,
              mime: fileType.mime,
              ext: fileType.ext,
            };

            resolve();
          } catch (err) {
            reject({ error: 'Failed to process image.', detail: err });
          }
        });

        file.on('error', (err) => reject({ error: 'File stream error', detail: err }));
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
        console.error('❌ File processing error:', err);
        res.status(400).json(err);
      }
    });

    req.pipe(busboy);
  };
}
