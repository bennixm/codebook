const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const connectDB = require('./config/db');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
connectDB();


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true 
}));

app.use(express.json()); 
app.use(cookieParser());


app.use('/user', userRoutes); 
app.use('/auth', authRoutes); 



app.use(morgan('dev'));


app.get('/', (req, res) => {
  res.send('Hello from Express backend!');
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
