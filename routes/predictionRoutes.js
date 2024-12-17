const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs
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
      // Step 1: Perform the prediction
      const imageBuffer = req.file.buffer;
      const model = await loadModel();  // Load the model (once)
      const predictionResult = await predictClassification(model, imageBuffer); // Predict using the uploaded image buffer

      // Step 2: Generate unique ID and timestamp
      const predictionId = uuidv4(); // Generate a unique ID
      const createdAt = new Date().toISOString(); // Timestamp

      // Step 3: Save prediction to Firestore
      await savePrediction(predictionId, predictionResult.label, predictionResult.suggestion, createdAt);

      // Step 4: Return the prediction result in the expected format
      return res.status(201).json({
        status: 'success',
        message: 'Model is predicted successfully',
        data: {
          id: predictionId,
          result: predictionResult.label, // Use 'result' instead of 'label'
          suggestion: predictionResult.suggestion,
          createdAt: createdAt,
        },
      });
    } catch (error) {
      console.error('Error during prediction:', error);
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
