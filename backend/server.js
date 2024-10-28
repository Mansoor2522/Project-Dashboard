const express = require('express');
const cors = require('cors');
const vehicles = require('./data/vehicles.json');

const app = express();
app.use(cors());

app.get('/free/api/vehicles', (req, res) => {
  res.json(vehicles);
});

app.listen(5000, () => {
  console.log('Backend server running on port 5000');
});