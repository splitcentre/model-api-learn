const { Firestore } = require('@google-cloud/firestore');
const path = require('path');

// Define the path to the service account key
const serviceAccountPath = path.join(__dirname, '..', 'config', 'serviceAccountKey.json');

// Check if the file path is correct and service account key exists
console.log('Using service account:', serviceAccountPath);

// Initialize Firestore client
const firestore = new Firestore({
  keyFilename: serviceAccountPath, // Service account key for Firebase authentication
});

async function savePrediction(id, result, suggestion) {
  try {
    console.log("Connecting to Firestore...");

    // Test the Firestore connection by writing a test document
    const testDoc = firestore.collection('test').doc('testDoc');
    await testDoc.set({ test: 'Connection successful' });
    console.log("Test write to Firestore successful!");

    // Reference to the predictions collection
    const predictionRef = firestore.collection('predictions').doc(id);

    // Prepare document data
    const data = {
      id,
      result,
      suggestion,
      createdAt: new Date().toISOString(),
    };

    // Save the prediction data to Firestore
    await predictionRef.set(data);
    console.log("Prediction saved successfully!");
  } catch (error) {
    console.error('Error saving prediction to Firestore:', error);
    throw new Error('Failed to save prediction');
  }
}

async function getHistories() {
  try {
    // Retrieve all predictions from Firestore
    const predictionsSnapshot = await firestore.collection('predictions').orderBy('createdAt', 'desc').get();

    if (predictionsSnapshot.empty) {
      return [];
    }

    // Format the results
    const histories = predictionsSnapshot.docs.map(doc => doc.data());
    return histories;
  } catch (error) {
    console.error('Error retrieving prediction histories:', error);
    throw new Error('Failed to retrieve prediction histories');
  }
}

// Export the functions and Firestore instance
module.exports = { savePrediction, getHistories, firestore };
