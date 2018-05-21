/**
 THIS CONTROLLER IS FOR REQUEST FROM PLAYBOX AT WHITELABEL
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

clientphp.subscribe('whitelabel');


/**
 * Return balance updated
 *
 * @param socket
 * @param data
 */
var realCasinoClient = function (socket, data) {
    var str = JSON.parse(data);
    var nodekey = str.data.idwl + str.data.username;
    var channelRealCasinoClient = 'REALCASINOCLIENT.' + nodekey;
    var key = str.wl + ":" + str.data.user;
    switch (str.type) {
        case "block":
            clientlocal.hmset(key, "user", str.data.user, "state", "false", "message", str.data.message);
            clientlocal.expire(key, 7200);
            break;
        case "unblock":
            clientlocal.hmset(key, "user", str.data.user, "state", "true", "message", str.data.message);
            clientlocal.expire(key, 7200);
            break;
    }
    socket.emit(channelRealCasinoClient, str);
}

/**
 * main class
 *
 * @param socket
 * @param app
 * @constructor
 */
var WhitelabelController = function (socket, app) {
    clientphp.on("message", function (channel, data) {
        var str = JSON.parse(data);
        switch (str.module) {
            case "realcasinoclient":
                realCasinoClient(socket, data);
                break;
        }
    });

    app.get('/userlocked/:wl/:user', function (req, res) {
        var key = req.params.wl + ':' + req.params.user;
        var state = true + '/' + 'message';
        clientlocal.hgetall(key, function (err, obj) {
            if (obj != null) {
                state = obj.state + "/" + obj.message;
            }
            res.writeHead(200, {"Content-Type": "application/json"});
            return res.end(JSON.stringify(state));
        })
    });
}


module.exports.WhitelabelController = WhitelabelController;
//module.exports.loginUser = loginUser;
//module.exports.dashboardResume = dashboardResume;