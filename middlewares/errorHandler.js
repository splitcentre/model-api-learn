module.exports = (err, req, res, next) => {
  if (err.message === 'File too large') {
    return res.status(413).json({
      status: 'fail',
      message: 'Payload content length greater than maximum allowed: 1000000',
    });
  }

  if (err.message === 'Invalid file type') {
    return res.status(400).json({
      status: 'fail',
      message: 'Terjadi kesalahan dalam melakukan prediksi',
    });
  }

  console.error(err.stack);
  res.status(500).json({
    status: 'fail',
    message: 'An unexpected error occurred',
  });
};
