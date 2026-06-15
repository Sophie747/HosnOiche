require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors'); 

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var gamesRouter = require('./routes/games'); 

var app = express();

app.use(cors()); 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', gamesRouter); 

app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    console.error('Unhandled error:', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const { Server } = require("socket.io");
const SOCKET_IO_PORT = process.env.SOCKET_IO_PORT || 3002;
const io = new Server(SOCKET_IO_PORT, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

const allowedEventRooms = new Set([
    'game:create',
    'game:end',
    'round:create'
]);

function publishEvent(eventName, payload) {
    io.to(eventName).emit(eventName, payload);
}

app.set('publishEvent', publishEvent);

io.on('connection', (socket) => {
    const requestedRooms = Array.isArray(socket.handshake.auth.interestedIn)
        ? socket.handshake.auth.interestedIn
        : [];

    const rooms = requestedRooms
        .map(room => String(room).trim().toLowerCase())
        .filter(room => allowedEventRooms.has(room));

    rooms.forEach(room => socket.join(room));

    console.log(`Socket.IO client connected: ${socket.id}`);
    console.log(`Subscribed to: ${rooms.join(', ') || '(nothing)'}`);

    socket.on('disconnect', (reason) => {
        console.log(`Socket.IO client disconnected: ${socket.id}. Reason: ${reason}`);
    });

    socket.on('error', (error) => {
        console.error(`Socket.IO error for ${socket.id}:`, error.message);
    });
});

console.log(`Socket.IO server listening on http://localhost:${SOCKET_IO_PORT}`);

module.exports = app;