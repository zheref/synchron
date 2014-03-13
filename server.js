var http = require('http'),
    cron = require('cron'),
    diffman = require('./diffman');

var server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
});

var cronjob = new cron.CronJob("*/7 * * * * *", function() {
    console.log("You will se this message each 7 seconds");
    diffman();
}, null);

cronjob.start();

server.listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');