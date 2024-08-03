const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./auth');
const todoRoutes = require('./todos');
const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', todoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
