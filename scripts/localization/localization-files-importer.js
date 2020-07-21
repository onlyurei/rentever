var Spreadsheet = require('edit-google-spreadsheet');
var fs = require('fs');
require('lib/sugar');
var credentials = require('./credentials.js');

var spreadsheetId = credentials.localization.spreadsheets.importFrom;
var worksheetId = 1;

function sheetReady(error, spreadsheet) {
    if (error) { throw error; }
    console.log('Got spreadsheet from Google Docs, processing...');
    spreadsheet.metadata(function (error, metadata) {
        if (error) { throw error; }
        var updated = Date.utc.create(metadata.updated);
        console.log('Last updated about ' + updated.relative() + ' on ' + updated.format('{Weekday} {Month} {d}, {yyyy} {h}:{mm}:{ss}{tt}'));
        console.log(JSON.stringify(metadata, null, 4));
    });
    spreadsheet.receive(function (error, rows) {
        if (error) { throw error; }
        var cols = {};
        var bundles = [];

        Object.each(rows, function (key, val) {
            if (key == 1) {
                cols = val;
            } else {
                var newRow = {};
                Object.each(val, function (k, v) {
                    if (cols[k]) {
                        newRow[cols[k]] = v;
                    }
                });
                bundles.push(newRow);
            }
        });
        var filename = '../workspace/bundles.txt';
        var content = JSON.stringify(bundles, null, 4);

        fs.writeFile(filename, content, function (error) {
            if (error) { throw error; }
            console.log('-> ' + filename);
            require('./localization-files-maker.js');
        });
    });
}

console.log('Attempting to read localization spreadsheet from Google Docs...\n<- https://docs.google.com/spreadsheet/ccc?key=' + spreadsheetId);
Spreadsheet.create({
    debug: true,
    username: credentials.google.username,
    password: credentials.google.password,
    spreadsheetId: spreadsheetId,
    worksheetId: worksheetId,
    callback: sheetReady
});
