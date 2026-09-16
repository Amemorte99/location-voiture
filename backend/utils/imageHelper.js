const resolveImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;

 
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  }

  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

module.exports = { resolveImageUrl };
