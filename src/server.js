const express = require('express');
const dotenv = require('dotenv');
const submitRoutes = require('./routes/submitRoutes');

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api', submitRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
