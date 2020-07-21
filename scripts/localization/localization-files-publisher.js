var Spreadsheet = require('edit-google-spreadsheet');
var fs = require('fs');
require('lib/sugar');
var credentials = require('./credentials.js');

var spreadsheetId = credentials.localization.spreadsheets.publishTo;
var worksheetId = 1;

var localesMap = require('./locales.js').locales;
var locales = Object.keys(localesMap);
var rootLocale = require('./locales.js').rootLocale;
var resources = {
    strings: {}
};
var head = [];
var body = [];

function loadResources() {
    Object.keys(resources, function (resourceType) {
        locales.each(function (locale) {
            var resource = resources[resourceType][locale] = {};
            var resourceArray = fs.readFileSync('../workspace/' + resourceType + '_' + locale + '.txt').toString('utf8').split('\n');
            resourceArray.each(function (i) {
                var markerPosition = i.indexOf('=');
                if (markerPosition > 0) {
                    resource[i.to(markerPosition)] = i.from(markerPosition + 1);
                }
            });
        });
    });
}

function generateHead() {
    head = Object.keys(resources).union(locales);
}

function generateBody() {
    Object.each(resources, function (resourceType, locales) {
        Object.keys(locales[rootLocale], function (key) {
            var row = [];
            head.each(function (item) {
                if (item == resourceType) {
                    row.push(key);
                } else if (Object.keys(locales).find(item)) {
                    row.push(resources[resourceType][item][key.compact()] || '');
                } else {
                    row.push('');
                }
            });
            body.push(row);
        });
    });
    var row = ['END OF FILE'];
    head.each(function () {
        row.add('');
    });
    body.push(row);
}

function sheetReady(error, spreadsheet) {
    if (error) { throw error; }
    loadResources();
    generateHead();
    generateBody();
    spreadsheet.add([head].union(body));
    spreadsheet.send({
        autoSize: true
    }, function (error) {
        if (error) { throw error; }
    });
}

console.log('Attempting to publish localization spreadsheet to Google Docs...\n-> https://docs.google.com/spreadsheet/ccc?key=' + spreadsheetId);
Spreadsheet.create({
    debug: true,
    username: credentials.google.username,
    password: credentials.google.password,
    spreadsheetId: spreadsheetId,
    worksheetId: worksheetId,
    callback: sheetReady
});
