const express = require('express');
const bodyParser = require('body-parser');
const predictionRoutes = require('./routes/predictionRoutes'); // Import your routes

const app = express();

// Middleware
app.use(bodyParser.json()); // For parsing application/json

// Use prediction routes
app.use(predictionRoutes);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
