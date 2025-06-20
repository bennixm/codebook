const express = require('express');
const jwt    = require('jsonwebtoken');
const http       = require('http');
const socketIo   = require('socket.io');
const cors = require('cors');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const guestIdentity    = require('./middleware/guestIdentity');
const morgan = require('morgan');
const connectDB = require('./config/db');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:5173', // your Vite app URL
    methods: ['GET','POST'],
    credentials: true
  }
});



const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const blogRoutes = require('./routes/blog.routes');
const tagRoutes = require('./routes/tag.routes');
const notifRoutes     = require('./routes/notification.routes');
const categoryRoutes = require('./routes/category.routes');
// Connect to MongoDB
connectDB();


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true 
}));

app.use(morgan('dev'));        
app.use(express.json()); 
app.use(cookieParser());
app.use(guestIdentity);

app.locals.io = io;

app.use('/user', userRoutes); 
app.use('/auth', authRoutes); 
app.use('/blog', blogRoutes);
app.use('/tags', tagRoutes);
app.use('/notifications', notifRoutes);
app.use('/categories', categoryRoutes);


io.use((socket, next) => {
  const raw = socket.request.headers.cookie || ''
  const cookies = cookie.parse(raw)      
  const token   = cookies.token
  if (!token) return next()             

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return next(new Error('Authentication error'))
    socket.userId = payload.id         
    next()
  })
})

io.on('connection', socket => {
  console.log('📡 Socket connected:', socket.id)
  if (socket.userId) {
    console.log(`→ auto-joining room ${socket.userId}`)
    socket.join(socket.userId.toString())
  }
})



app.get('/', (req, res) => {
  res.send('Hello from Express backend!');
});


server.listen(PORT, () => {
  console.log(`Server + Socket.io running on http://localhost:${PORT}`);
});