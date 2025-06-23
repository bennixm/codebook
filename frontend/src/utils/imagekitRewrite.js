const FIREBASE_PREFIX = import.meta.env.VITE_FIREBASE_PREFIX_URL; 
const IMAGEKIT_PREFIX = import.meta.env.VITE_IMAGEKIT_PREFIX_URL; 
const IMAGEKIT_TRANSFORM = 'tr:w-600,f-auto'; 

export function rewriteImageUrls(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(rewriteImageUrls);
  }

  const newObj = {};
  for (const key in obj) {
    const value = obj[key];
    
    if (typeof value === 'string' && value.startsWith(FIREBASE_PREFIX)) {
      const relativePath = value.replace(FIREBASE_PREFIX, '').replace(/^\/+/, ''); 
      
      newObj[key] = `${IMAGEKIT_PREFIX}/${IMAGEKIT_TRANSFORM}/${relativePath}`;
    } else if (typeof value === 'object') {
      newObj[key] = rewriteImageUrls(value);
    } else {
      newObj[key] = value;
    }
  }
  return newObj;
}
