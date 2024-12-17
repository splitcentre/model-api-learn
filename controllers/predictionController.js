const multer = require('multer');
const path = require('path');
const { loadModel, predictClassification } = require('../services/modelService');
const { savePrediction } = require('../services/firestoreService');

// Set up multer for file handling
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage }).single('image'); // 'image' is the field name in Postman

exports.handlePrediction = async (req, res) => {
  try {
    // Ensure the image is in the request
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).send({ status: 'fail', message: 'Error uploading image' });
      }

      if (!req.file) {
        return res.status(400).send({ status: 'fail', message: 'Image is required' });
      }

      const image = req.file.buffer; // Image file is available in buffer form

      // Load model (if it's not loaded already)
      const model = await loadModel();

      // Run the prediction
      const { result, suggestion } = await predictClassification(model, image);

      // Prepare the response
      if (!result || !suggestion) {
        return res.status(400).send({ status: 'fail', message: 'Prediction result or suggestion is missing.' });
      }

      // Save prediction to Firestore
      const predictionId = `prediction-${new Date().getTime()}`;
      await savePrediction(predictionId, result, suggestion);

      // Send successful response
      return res.status(200).send({
        status: 'success',
        message: 'Prediction successful',
        data: { id: predictionId, result, suggestion, createdAt: new Date().toISOString() }
      });
    });
  } catch (error) {
    console.error('Error during prediction:', error);
    return res.status(500).send({ status: 'fail', message: error.message });
  }
};
