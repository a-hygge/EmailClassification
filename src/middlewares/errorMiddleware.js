// Error handling middleware
const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Nếu là API request
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(statusCode).json({
      success: false,
      error: message
    });
  }

  // Nếu là web request
  res.status(statusCode).render('pages/error', {
    title: `${statusCode} - Error`,
    message: message,
    layout: 'layouts/main'
  });
};

export default errorMiddleware;