const slugify = require('slugify');
const Blog    = require('../models/Blog');

async function generateUniqueSlug(title) {
  const baseSlug = slugify(title, { lower: true, strict: true });
  const regex    = new RegExp(`^${baseSlug}(?:-(\\d+))?$`);
  const posts    = await Blog.find({ slug: regex }).select('slug');

  let maxSuffix  = 0;
  let existsBase = false;
  for (const { slug } of posts) {
    if (slug === baseSlug) existsBase = true;
    const match = slug.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxSuffix) maxSuffix = num;
    }
  }

  return existsBase
    ? `${baseSlug}-${maxSuffix + 1}`
    : baseSlug;
}

module.exports = { generateUniqueSlug };
