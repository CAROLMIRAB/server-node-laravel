var cluster = require('cluster');
var express = require('express');
var fs = require("fs");
var key_ssl = fs.readFileSync('/etc/apache2/ssl/server.key', 'utf8');
var cert = fs.readFileSync('/etc/apache2/ssl/server.crt', 'utf8');
var app = express();
var server = require('https').Server({key: key_ssl, cert: cert}, app);
var io = require('socket.io')(server);
var cors = require('cors');
var numCPUs = require('os').cpus().length;
require('events').EventEmitter.defaultMaxListeners = Infinity;


var playbox = require('../controllers/playboxController.js');
var whitelabel = require('../controllers/whitelabelController.js');

if (cluster.isMaster) {

    for (var i = 0; i < numCPUs; i++) {
        // Create a worker
        cluster.fork();
    }

} else {
    app.use(cors());
    app.use(express.static(__dirname));
    server.listen(3002);

    io.on('connection', function (socket) {
        playbox.PlayboxController(socket, app);
        whitelabel.WhitelabelController(socket, app);
    });
}