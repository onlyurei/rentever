/* jshint undef: false */
var page = require('webpage').create();
var system = require('system');
var args = system.args;

//example usage : phantomjs contract-pdf-generator.js [url-to-generate] [target-file-path]

if (args.length === 1) {
    console.log('Try to pass some arguments when invoking this script!');
    phantom.exit();
}

page.paperSize = {
    format: 'A4',
    margin: {
        top: '50px',
        left: '50px',
        right: '50px',
        bottom: '50px'
    }
};

var urlToGenerate = args[1];
var destinationPath = args[2];
page.open(urlToGenerate, function(status) {
    if(status === 'success') {
        page.render(destinationPath);
    }
    phantom.exit();
});
