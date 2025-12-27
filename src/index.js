const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/pets', petRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
