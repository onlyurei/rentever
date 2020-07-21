var fs = require('fs');
require('lib/sugar');

var localesMap = require('./locales.js').locales;
var locales = Object.keys(localesMap);
var rootLocale = require('./locales.js').rootLocale;
var resourceFilenameMappings = {
    strings: function (locale) {
        var basePath = '../../assets/js/nls';
        var filename = 'strings.js';
        return (locale == rootLocale) ? (basePath + '/' + filename) : (basePath + '/' + locale + '/' + filename);
    }
};
var resources = ['strings'];
var numberOfFilesToProcess = locales.length * resources.length;

function fileProcessedCallback() {
    numberOfFilesToProcess--;
    if (!numberOfFilesToProcess) {
        require('./localization-files-publisher.js');
    }
}

locales.each(function (locale) {
    resources.each(function (resource) {
        var inputFilename = resourceFilenameMappings[resource](locale);
        var outputFilename = '../workspace/' + resource + '_' + locale + '.txt';
        if (resource == 'strings') {
            var resourceText = fs.readFileSync(inputFilename).toString('utf8').trim();
            var startMarker = 'define(';
            var endMarker = '});';
            var resourceJSON = JSON.parse(resourceText.substring(resourceText.indexOf(startMarker) + startMarker.length, resourceText.lastIndexOf(endMarker) + 1).trim());
            if (locale == rootLocale) {
                resourceJSON = resourceJSON.root;
            }
            var output = '';
            Object.each(resourceJSON, function (key, value) {
                output += (key + '=' + value + '\n');
            });
            fs.writeFile(outputFilename, output, function (error) {
                if (error) { throw error; }
                console.log('-> ' + outputFilename);
                fileProcessedCallback();
            });
        }
    });
});
