var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const crypto = require('crypto');
const { Translate } = require('@google-cloud/translate').v2;
var port = process.env.PORT || 8080;
server.listen(port);

const GOOGLE_APPLICATION_CREDENTIALS = 'ycshu-314159.json';
const translate = new Translate({
    projectId: 'ycshu-314159', 
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS
});

async function translateText(text, targetLanguage) {
    let [translations] = await translate.translate(text, targetLanguage);
    translations = Array.isArray(translations) ? translations : [translations];
    return translations[0];
}
var request = require('request');
console.log("Hello World");

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/remote.html');
});

app.use('/i18n', express.static('i18n'))

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
        if (data.lan == 'ori') {
            if (data.name) {
                data.msg = data.name + "：" + data.msg;
            }
            io.to(socket['room']).emit('say', data);
            console.log(data);
        }else{
            let content = data.msg;
            translateText(content, data.lan).then(translatedText => {
                data.msg = translatedText;
                if (data.name) {
                    data.msg = data.name + "：" + data.msg;
                }
                io.to(socket['room']).emit('say', data);
                console.log(data);
            }).catch(error => {
                console.error(`Error during translation: ${error}`);
            });
        }
        
    });              
})

