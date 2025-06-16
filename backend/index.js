const express = require('express');
const http       = require('http');
const socketIo   = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const guestIdentity    = require('./middleware/guestIdentity');
const morgan = require('morgan');
const connectDB = require('./config/db');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io     = socketIo(server, { cors: { origin: '*' } });


const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const blogRoutes = require('./routes/blog.routes');
const tagRoutes = require('./routes/tag.routes');
const notifRoutes     = require('./routes/notification.routes');
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

io.use((socket, next) => {
  
  next();
});

io.on('connection', socket => {
  console.log(`📡 Socket server connected: ${socket.id}`);
  socket.on('join', ({ userId }) => {
    console.log(`→ Got join with userId: ${userId}`);
    if (!userId) return console.warn('join without userId');
    socket.join(`user_${userId}`);
  });
});


app.get('/', (req, res) => {
  res.send('Hello from Express backend!');
});


server.listen(PORT, () => {
  console.log(`Server + Socket.io running on http://localhost:${PORT}`);
});