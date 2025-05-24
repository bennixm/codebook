const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const userRoutes = require('./routes/user.routes');
connectDB();


app.use(cors());
app.use(express.json()); // ✅ Required for JSON body parsing

app.use('/auth', userRoutes); 


app.use(express.json());
app.use(morgan('dev'));


app.get('/', (req, res) => {
  res.send('Hello from Express backend!');
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
