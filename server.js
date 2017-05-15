var https = require('https');
var fs = require('fs');   
const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/dpt.emath.tw/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/dpt.emath.tw/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/dpt.emath.tw/chain.pem')
};

var server = https.createServer(httpsOptions, (req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
}).listen(443);

var request = require('request');
console.log("Hello World");

var io = require('socket.io').listen(server);

io.on('connection', function (socket) {
    console.log('hello');
    socket.on('room',function(data){
        url = data.url;
        token = url.toString('hex');
        socket['room'] = token;
        io.sockets.emit('room_create', { id: token });
        socket.join(socket['room']);
    });
    socket.on('say', function (data) {
        io.to(socket['room']).emit('say', data);
        console.log(data);
    });              
})

