/**
 * Centralized error handling middleware.
 * Ensures consistent JSON error responses across the application.
 */
export function errorHandler(err, req, res, next) {
  console.error('[Error Handler]:', err.message || err);

  // Multer-specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large. Maximum allowed size is 5 MB.'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: `Unexpected field in upload: ${err.field}. Please use 'file'.`
    });
  }

  // Known validation errors or custom client errors
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message
  });
}
