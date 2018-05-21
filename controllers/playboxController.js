/**
 THIS CONTROLLER IS FOR REQUEST FROM WHITELABEL AT PLAYBOX
 */
var fs = require("fs");
var redis = require('redis');
var clientphp = redis.createClient({no_ready_check: true}), clientlocal = redis.createClient({no_ready_check: true});
var pg = require('pg');

clientphp.on("error", function (err) {
    console.log("Redis error encountered", err);
});

clientlocal.auth('yYcKRyDKFwX.zKB]');
clientphp.auth('yYcKRyDKFwX.zKB]');

clientphp.subscribe('playbox');


var dashboardResume = function (socket, data) {
    var str = JSON.parse(data);
    var channelDashboard = 'DASHBOARD.' + str.wl + "." + str.currency;
    socket.emit(channelDashboard, str);
}


var loginUser = function (data) {
    var str = JSON.parse(data);
    switch (str.type) {
        case "login":
            var date = new Date();
            var dd = date.getDate(), y = date.getFullYear(), m = date.getMonth(), h = date.getHours(), mm = date.getMinutes(), ss = date.getSeconds();
            var now = new Date(y, m, dd, h, mm, ss);

            var key = str.wl + ":" + str.data.id
            clientlocal.hmset(key, "iduser", str.data.id, "username", str.data.username, "wl", str.wl, "date", now);
            clientlocal.expire(key, 7200);
            break;
        case "logout":
            var key = str.wl + ':' + str.data.id;
            clientlocal.del(key, function (err, obj) {
                console.log('Eliminado');
            });
            break;
    }
}

/**
 * Send notifications playbox
 *
 * @param socket
 * @param data
 */
var realCasino = function (socket, data) {
    var str = JSON.parse(data);
    var channelRealCasino = 'REALCASINO.' + str.wl + "." + str.currency + "." + str.data.casino;

    if (str.type == 'request') {
        var key = str.wl + str.module + ":" + str.data.transaction
        clientlocal.hmset(key, "transaction", str.data.transaction, "transactiontype", str.data.transactiontype, "username", str.data.username);
        clientlocal.expire(key, 600);
    }

    socket.emit(channelRealCasino, str);
}


/**
 * main class
 *
 * @param socket
 * @param app
 * @constructor
 */
var PlayboxController = function (socket, app) {
    clientphp.on("message", function (channel, data) {
        var str = JSON.parse(data);
        switch (str.module) {
            case "dashboard":
                loginUser(data);
                dashboardResume(socket, data);
                break;
            case "realcasino":
                realCasino(socket, data);
                break;
        }
    });


    app.get('/usersConnected/:wl', function (req, res) {
        var resultsConnected = [];
        var wl = req.params.wl + ':*';
        clientlocal.keys(wl, function (err, keys) {
            if (err) {
                return console.log(err);
            }

            resultsConnected.push(keys);
            console.log(resultsConnected);
            /* for (var i = 0, len = keys.length; i < len; i++) {
             clientlocal.hgetall(keys[i], function (err, obj) {
             resultsConnected.push({username: obj.username, iduser: obj.iduser});
             res.json(resultsConnected);
             });
             }*/

            res.json(resultsConnected);
        });

        // res.writeHead(200, {"Content-Length": resultsConnected.length, "Content-Type": "application/json"});
        //res.end(JSON.stringify(resultsConnected));

    });

    app.get('/usersConnectedNumber/:wl', function (req, res) {
        var wl = req.params.wl + '*';
        clientlocal.keys(wl, function (err, keys) {
            if (err) {
                return console.log(err);
            }

            res.writeHead(200, {"Content-Type": "application/json"});
            return res.end(JSON.stringify(keys.length));
        })
    });
}


module.exports.PlayboxController = PlayboxController;