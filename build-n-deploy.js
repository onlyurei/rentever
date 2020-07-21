/*

 This is a small nodejs server that serves as an interface for bitbucket POST hook.
 Bitbucket expectation: http://rentever.com:8765/deploy-me-now

 Upon hitting URL above script will simply execute ./deploy.sh. Results are logged in /var/log/build-n-deploy

 /history - to see history of all builds
 */
var exec = require('child_process').exec,
    http = require('http'),
    fs = require('fs');

var logStash = '/var/log/build-n-deploy/';

function execute(command, callback) {
    exec(command, function (error, stdout, stderr) {
        if (error) {
            callback(error);
        }
        if (stderr) {
            callback(stderr);
        }
        callback(stdout);
    });
}

http.createServer(function (req, res) {
    if (req.url === '/deploy-me-now') {
        execute('./deploy.sh', function (result) {
            var filename = new Date().toISOString().replace(/T/, '-').replace(/\..+/, '');
            fs.writeFile(logStash + filename, result, function (err) {
                if (err) {
                    console.log(err);
                }
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(result.replace(/(?:\r\n|\r|\n)/g, '<br>'));
            });
        });
    } else if (req.url === '/history') {
        var html = '';
        fs.readdir(logStash, function (err, files) {
            if (err) {
                console.log(err);
            }
            console.log(files.length);
            if (files.length) {
                files.forEach(function (item, index) {
                    if (item.indexOf('.')) {
                        html = (index + 1) + ': <a href="/file/' + item + '">' + item + '</a><br>' + html;
                    }
                });
            } else {
                html = 'No history yet';
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
        });
    } else if (req.url.indexOf('/file/') === 0) {
        var filename = req.url.split('/')[2];
        var result = fs.readFileSync(logStash + filename, { encoding: 'utf8' });
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(result.replace(/(?:\r\n|\r|\n)/g, '<br>'));

    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write('404 Not Found\n');
        res.end();
    }
}).listen(8765);
