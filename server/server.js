var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const crypto = require('crypto');
var port = process.env.PORT || 8080;
server.listen(port);


var request = require('request');
console.log("Hello World");

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/remote.html');
});

io.on('connection', function (socket) {
    console.log('hello');
    socket.on('room',function(data){
        url = data.msg;
        token = crypto.createHash('sha1').update(url).digest("hex");
        socket['room'] = token;
        socket.join(socket['room']);
        io.to(socket['room']).emit('room_create', { id: token });
        
    });

    socket.on('join',function(data){
        socket['room'] = data;        
        socket.join(socket['room']);
        console.log('join!');
    });
    socket.on('say', function (data) {
        io.to(socket['room']).emit('say', data);
        console.log(data);
    });              
})

