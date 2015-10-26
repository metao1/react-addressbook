var express = require('express'),
    app = express(),
    path = require('path'),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    simulator = require('./simulator');

app.use(express.static(path.join(__dirname, './public')));

io.on('connection', function (socket) {
    console.log('Socket connected');
    io.emit('connected',socket.id);
    io.on('disconnect', function () {
        console.log('Socket disconnected');
        io.emit('disconnect');
    });
});

simulator.start(function(room ,type, message) {
    io.emit(type, message);
});

http.listen(8000, function () {
    console.log('listening on: 8000');
});
