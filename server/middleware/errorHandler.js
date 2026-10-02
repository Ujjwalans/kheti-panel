// Catches errors from async route handlers (via the asyncHandler wrapper)
// and from thrown/multer errors, and returns a consistent JSON shape.

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error("[error]", err.message);
  const status = err.status || 500;
 res.status(status).json({
  message: err.message,
  error: process.env.NODE_ENV === "development"
    ? err.message
    : undefined,
});
}

module.exports = { asyncHandler, notFound, errorHandler };
