function extractFirebasePath(url) {
    try {
      const match = url.match(/https:\/\/storage\.googleapis\.com\/[^\/]+\/(.+)/);
      return match?.[1] ?? null;
    } catch {
      return null;
    }
  }
  module.exports = {
    extractFirebasePath,
  }; 