var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var fs = require('fs');

var dataFile = fs.readFileSync('./canvas.json');
var pixels = JSON.parse(dataFile);

var app = express();
var server = http.Server(app);
var io = socketIO(server);

//variables
const port = 7777;

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

//routing
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

//start server
server.listen(port, function() {
    console.log('Server running on port ' + port);
});

var users = {};

//websocket handlers
io.on('connection', function(socket) {
    socket.on('request_pixels', function(data) {
        users[socket.id] = {
            x_off:data.off_x,
            y_off:data.off_y,
            width:data.width,
            height:data.height
        };
        out = getPixels(data.off_x, data.off_y, data.width, data.height);
        socket.emit('viewpixels', out);
    });
    socket.on('placepixel', function(data) {
        changePixel(data.x_pos, data.y_pos, data.color);
    });
    socket.on('disconnect', function() {
        delete users[socket.id];
    });
});

function getPixels (x_off, y_off, width, height) {
    viewablePixels = {};
    for (y = 0; y < height; y++){
        row = {};
        for (x = 0; x < width; x++) {
            if (pixels[y + y_off] != undefined) {
                if (pixels[y+y_off][x+x_off] !=undefined) {
                    row[x] = pixels[y + y_off][x + x_off];
                }
            }
        }
        viewablePixels[y] = row;
    }
    return(viewablePixels);
}

app.get('*', function(req, res){
    res.status(404).send('<head><style>body {height: 98vh; background-color: black; display: flex; justify-content: center; align-items: center;}</style><title>That is an error</title><!--Princess Luna, bring me your memes, make them the dankest that I ever seen. Add in some yeets and minecraft game over. Then tell the user their bugs are over.--></head><body><img width="70%"; src="//i.imgur.com/hMfpDQ9.png"></body>');
})

function changePixel(x, y, color) {
    if(pixels[y] != undefined) {
        pixels[y][x] = color;
    }
    else {
        pixels[y] = {[x]:color};
    }
    output = JSON.stringify(pixels);
    fs.writeFileSync('./canvas.json', output);

    for (var user in users) {
        if(x >= users[user].x_off && x <=users[user].x_off+users[user].width){
            if(y >=users[user].y_off && y <= users[user].y_off+users[user].width) {
                io.to(user).emit('requestPixelUpdate');
            }
        }
    }
}