const tf = require('@tensorflow/tfjs-node'); // TensorFlow.js for Node.js

const modelURL = 'https://storage.googleapis.com/model-21/submissions-model/model.json'; // Replace with your model URL

let model;

// Load model function (Make sure you load the model once)
async function loadModel() {
  if (!model) {
    try {
      model = await tf.loadGraphModel(modelURL);
    } catch (error) {
      console.error('Error loading model:', error);
      throw new Error('Error loading model');
    }
  }
  return model;
}

// Image classification prediction function
async function predictClassification(model, image) {
  try {
    // Decode the image buffer into a tensor and preprocess the image
    const tensor = tf.node
      .decodeJpeg(image) // Decode JPEG image from buffer
      .resizeNearestNeighbor([224, 224]) // Resize to 224x224 pixels (model input size)
      .expandDims() // Add batch dimension (model expects [1, 224, 224, 3])
      .toFloat(); // Convert image to float tensor

    // Make the prediction using the model
    const prediction = model.predict(tensor);
    const score = await prediction.data(); // Get the prediction scores
    const confidenceScore = Math.max(...score) * 100; // Get the highest score and convert to percentage

    // Determine the label based on confidence score
    const label = confidenceScore <= 50 ? 'Non-cancer' : 'Cancer'; 
    let suggestion;

    // Provide suggestion based on the result
    if (label === 'Cancer') {
      suggestion = "Segera periksa ke dokter!";
    }
    
    if (label === 'Non-cancer') {
      suggestion = "Penyakit kanker tidak terdeteksi.";
    }

    return { label, suggestion };
  } catch (error) {
    console.error('Error during prediction:', error);
    throw new Error('Terjadi kesalahan dalam melakukan prediksi');
  }
}

module.exports = { loadModel, predictClassification };
