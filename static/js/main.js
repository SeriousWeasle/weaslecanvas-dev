var socket = io();

var colors = ['#000000', '#FE0000', '#FE9900', '#CCFF00', '#32FF00', '#00FF65', '#545454', '#800001', '#804C00', '#657F00', '#197F00', '#007F32', '#A8A8A8', '#01FFFF', '#0065FF', '#3300FF', '#CC00FF', '#FF0198', '#FFFFFF', '#017F7E', '#01327F', '#19007F', '#65017F', '#7F014B'];

socket.on('viewpixels', function(data) {
    canvas = document.getElementById('drawfield');
    context = canvas.getContext('2d');
    context.clearRect(0, 0, viewsize.x, viewsize.y);
    for (var column_id in data) {
        column = data[column_id];
        for (var pixel in column) {
            context.fillStyle = colors[data[column_id][pixel]];
            context.fillRect(((pixel*32)-16)*scale, ((column_id*32)-16)*scale, 32*scale, 32*scale);
        }
    }
});

socket.on('requestPixelUpdate', function() {
    socket.emit('request_pixels', {off_x:canvasOffset.x, off_y: canvasOffset.y, width: viewPixels.x, height:viewPixels.y});
});

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 37 || event.keyCode == 65) { //left
        canvasOffset.x = canvasOffset.x - 10/scale;
    }
    if (event.keyCode == 68 || event.keyCode ==39) { //right
        canvasOffset.x = canvasOffset.x + 10/scale;
    }
    if (event.keyCode == 87 || event.keyCode == 38) { //up
        canvasOffset.y = canvasOffset.y - 10/scale;
    }
    if (event.keyCode == 83 || event.keyCode == 40) { //down
        canvasOffset.y = canvasOffset.y + 10/scale;
    }
    if((event.keyCode == 90 || event.keyCode == 61) && scale < '8') {
        scale = scale*2;
        viewPixels.x = Math.round(window.innerWidth/(32*scale));
        viewPixels.y = Math.round(window.innerHeight/(32*scale));
        resizeCanvas();
    }
    if(event.keyCode == 82 && scale != '1') {
        scale = 1;
        viewPixels.x = Math.round(window.innerWidth/(32*scale));
        viewPixels.y = Math.round(window.innerHeight/(32*scale));
        resizeCanvas();
    }
    if((event.keyCode == 88 || event.keyCode == 173) && scale > 1/16) {
        scale = scale/2;
        viewPixels.x = Math.round(window.innerWidth/(32*scale));
        viewPixels.y = Math.round(window.innerHeight/(32*scale));
        resizeCanvas();
    }
    if(event.keyCode == 71) {
        toggleGrid();
    }
    socket.emit('request_pixels', {off_x:canvasOffset.x, off_y: canvasOffset.y, width: viewPixels.x, height:viewPixels.y});
});

var viewsize = {
    x:1920,
    y:1080
}
var isOverUI = false;
var selectedColorValue = 0;
var canvasOffset = {
    x:0,
    y:0
}
var viewPixels = {
    x:60,
    y:34
}

var scale = 1;

window.onclose = socket.emit('disconnect');

window.onload = window.onresize = function() {
    viewsize.x = window.innerWidth;
    viewsize.y = window.innerHeight;
    viewPixels.x = Math.round(window.innerWidth/(32*scale));
    viewPixels.y = Math.round(window.innerHeight/(32*scale));
    socket.emit('request_pixels', {off_x:canvasOffset.x, off_y: canvasOffset.y, width: viewPixels.x, height:viewPixels.y});
    resizeCanvas();
}

function selectColor(n) {
    prevcolor = selectedColorValue;
    newcolor = selectedColorValue = n;
    document.getElementById('color_' + prevcolor).style.border = '1px solid black';
    document.getElementById('color_' + n).style.border = '1px solid white';
    console.log(selectedColorValue);
}

function resizeCanvas () {
    c1 = document.getElementById('drawfield');
    c2 = document.getElementById('client-layer');
    c3 = document.getElementById('grid');
    c1.width = c2.width = c3.width = viewsize.x;
    c1.height = c2.height = c3.height = viewsize.y;
    if(grid == true) {
        drawGrid();
    }
}

function drawSelector (x, y) {
    x = 32*Math.round(x/(32*scale));
    y = 32*Math.round(y/(32*scale));
    canvas = document.getElementById('client-layer');
    context = canvas.getContext('2d');
    context.clearRect(0, 0, viewsize.x, viewsize.y);
    context.fillStyle = colors[selectedColorValue];
    context.fillRect((x-20)*scale, (y-20)*scale, 40*scale, 40*scale);
}

document.getElementById('client-layer').onclick = function(event) {
    if(isOverUI == false) {
        x = Math.round(event.clientX/(32*scale)) + canvasOffset.x;
        y = Math.round(event.clientY/(32*scale)) + canvasOffset.y;
        placePixel(x, y);
    }
};

function placePixel (x, y) {
    socket.emit('placepixel', {x_pos:x,y_pos:y,color:selectedColorValue});
}

window.onmousemove = function () {
    drawSelector(event.clientX, event.clientY);
}

function overUI(bool) {
    isOverUI = bool;
}

var grid = false;

function toggleGrid() {
    var canvas = document.getElementById('grid');
    var context = canvas.getContext('2d');
    if (grid == false) {
        grid = true;
        drawGrid();
    }
    else {
        grid = false;
        context.clearRect(0, 0, viewsize.x, viewsize.y);
    }
}

function drawGrid() {
    var canvas = document.getElementById('grid');
    var context = canvas.getContext('2d');
    for(i = 0; i < viewPixels.x; i++) {
        x = ((i*32)+16)*scale;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, viewsize.y);
        context.stroke();
    }
    for(j = 0; j < viewPixels.y; j++) {
        y = ((j*32)+16)*scale;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(viewsize.x, y);
        context.stroke();
    }
}