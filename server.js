var http = require('http');
var fs = require('fs');   
const crypto = require('crypto');

var server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
}).listen(8800);

var request = require('request');
console.log("Hello World");

var io = require('socket.io').listen(server);

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

