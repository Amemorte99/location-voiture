
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(error);
};


const errorHandler = (err, req, res, next) => {
  const logger = require('./logger');
  logger.error(err);
  
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

 
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Ressource non trouvée';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

 
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `La valeur du champ "${field}" existe déjà`;
  }

  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500
      ? 'Erreur interne du serveur'
      : message,
    stack: isProduction ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
