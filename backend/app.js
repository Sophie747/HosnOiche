var path = require('path');
const fs = require('fs');

// Resolve Env-File
const envPath = path.resolve(__dirname, '..', '.env');
const dotenvResult = require('dotenv').config({ path: envPath });

if (dotenvResult.error) {
    console.warn('dotenv failed to load .env at', envPath, '-', dotenvResult.error.message);
} else {
    const masked = process.env.DATABASE_URL ? '[redacted]' : undefined;
    console.log('dotenv loaded .env at', envPath, 'DATABASE_URL=', masked, 'DATABASE_HOST=', process.env.DATABASE_HOST || '(none)');
}

var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors'); 

var usersRouter = require('./routes/users');
var gamesRouter = require('./routes/games'); 

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/api', gamesRouter); 

app.get(/^\/(?!api|users|socket\.io).*/, function (req, res, next) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'), function (err) {
        if (err) next();
    });
});

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
let io = null;

const allowedEventRooms = new Set([
    'game:create',
    'game:end',
    'round:create'
]);

function attachSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        }
    });
    
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

    return io;
}

function publishEvent(eventName, payload) {
    if (io) io.to(eventName).emit(eventName, payload);
}

app.set('publishEvent', publishEvent);

module.exports = app;
module.exports.attachSocket = attachSocket;

if (typeof(PhusionPassenger) !== 'undefined') {
    const http = require('http');
    const server = http.createServer(app);
    attachSocket(server);
    server.listen('passenger');
}