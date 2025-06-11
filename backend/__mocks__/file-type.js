// __mocks__/file-type.js
module.exports = {
  fileTypeFromBuffer: jest.fn().mockResolvedValue({
    ext:  'png',
    mime: 'image/png'
  })
}
