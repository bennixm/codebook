// tests/integration/validateProfileImage.integration.test.js
const request = require('supertest');
const express = require('express');
const { validateProfileImage } = require('../../middleware/imageUpload');

const app = express();
app.post('/upload-avatar', validateProfileImage(), (req, res) => {
  const { fileBuffer, fileMeta } = req;
  res.json({
    size:     fileBuffer.length,
    filename: fileMeta.filename,  // ← use the string directly
    mime:     fileMeta.mime,
    ext:      fileMeta.ext,
  });
});

describe('POST /upload-avatar (integration)', () => {
  it('accepts a small PNG file', async () => {
    const png = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
      0xAE, 0x42, 0x60, 0x82
    ]);
    const res = await request(app)
      .post('/upload-avatar')
      .attach('avatar', png, { filename: 'avatar.png', contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      size:     png.length,
      filename: 'avatar.png',
      mime:     'image/png',
      ext:      'png',
    });
  });

  it('rejects files over 2 MB', async () => {
    const big = Buffer.alloc(3 * 1024 * 1024);
    const res = await request(app)
      .post('/upload-avatar')
      .attach('avatar', big, { filename: 'big.png', contentType: 'image/png' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Image must be smaller than 2MB.' });
  });

  it('rejects non-image buffers', async () => {
    const txt = Buffer.from('not an image');
    const res = await request(app)
      .post('/upload-avatar')
      .attach('avatar', txt, { filename: 'not.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Only image files are allowed.' });
  });
});
