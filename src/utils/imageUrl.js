const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return '/images/cars-lineup.png';
  
  let resolvedPath = imagePath;
  
  if (imagePath.includes('/images/')) {
    const parts = imagePath.split('/images/');
    resolvedPath = `/images/${parts[parts.length - 1]}`;
  }
  else if (imagePath.startsWith('/uploads/') || imagePath.startsWith('uploads/')) {
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    resolvedPath = `${BACKEND_URL}${cleanPath}`;
  }
  else if (imagePath.startsWith('http')) {
    resolvedPath = imagePath;
  }
  
  // Avoid double-encoding
  if (/%[0-9a-fA-F]{2}/.test(resolvedPath)) {
    return resolvedPath;
  }
  
  return encodeURI(resolvedPath);
};

export default resolveImageUrl;
