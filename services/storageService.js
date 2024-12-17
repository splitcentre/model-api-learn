const tf = require('@tensorflow/tfjs-node');

const MODEL_URL = 'https://storage.googleapis.com/model-21/submissions-model/model.json';
let cachedModel = null;

// Function to load model
exports.downloadModel = async () => {
  if (cachedModel) return cachedModel; // Return cached model if already loaded

  try {
    console.log('Loading model from:', MODEL_URL);
    cachedModel = await tf.loadGraphModel(MODEL_URL);
    console.log('Model loaded successfully.');
  } catch (error) {
    console.error('Failed to load model from:', MODEL_URL);
    throw new Error('Error loading model');
  }

  return cachedModel;
};
