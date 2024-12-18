const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');

// Configuration for Google Cloud
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const FIRESTORE_DATABASE_ID = process.env.FIRESTORE_DATABASE_ID;

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: GOOGLE_CLOUD_PROJECT,
  keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
});

// Initialize Firestore and set database ID
const firestore = new Firestore({
  projectId: GOOGLE_CLOUD_PROJECT,
  keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
  databaseId: FIRESTORE_DATABASE_ID, // Explicitly use the 'prediction' database
});

// Export configurations
module.exports = {
  storage,
  firestore,
};
