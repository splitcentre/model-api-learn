const express = require('express');
const multer = require('multer');
const { loadModel, predictClassification } = require('../services/modelService');
const { savePrediction, getHistories } = require('../services/firestoreService'); // Import the service functions

const router = express.Router();

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 1000000 },  // Max 1MB file size
}).single('image');

// POST /predict endpoint
router.post('/predict', (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // If Multer specific error occurs
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          status: 'fail',
          message: 'Payload content length greater than maximum allowed: 1000000',
        });
      }
    } else if (err) {
      // Handle other errors
      return res.status(400).json({
        status: 'fail',
        message: 'Terjadi kesalahan dalam melakukan prediksi',
      });
    }

    try {
      // If no errors, proceed with prediction
      const imageBuffer = req.file.buffer;
      const model = await loadModel();  // Load the model (once)
      const result = await predictClassification(model, imageBuffer); // Predict using the uploaded image buffer

      // Save prediction to Firestore
      const predictionId = new Date().toISOString(); // Use current timestamp as unique ID
      await savePrediction(predictionId, result.label, result.suggestion); // Save prediction to Firestore

      // Return the prediction result
      return res.status(200).json({
        status: 'success',
        message: 'Model is predicted successfully',
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: 'Terjadi kesalahan dalam melakukan prediksi',
      });
    }
  });
});

// GET /predict/histories endpoint to get prediction history
router.get('/predict/histories', async (req, res) => {
  try {
    // Retrieve all predictions from Firestore
    const histories = await getHistories(); // Use the getHistories function

    if (histories.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No prediction histories found.',
        data: [],
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Prediction histories retrieved successfully',
      data: histories,
    });
  } catch (error) {
    console.error('Error retrieving prediction histories:', error);
    return res.status(500).json({
      status: 'fail',
      message: 'Error retrieving prediction histories',
    });
  }
});

module.exports = router;
