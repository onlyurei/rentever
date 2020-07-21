var fs = require('fs');
require('lib/sugar');

var bundlesFilename = '../workspace/bundles.txt';
console.log('<- ' + bundlesFilename);
var bundles = JSON.parse(fs.readFileSync(bundlesFilename).toString('utf8'));
var locales = require('./locales.js').locales;
var rootLocale = require('./locales.js').rootLocale;
var resourceTypes = {
    strings: 'Strings - Client'
};
var resources = {
    strings: {}
};
var resourceCounts = {
    strings: 0,
    total: 0
};
var numberOfFilesToProcess = Object.keys(locales).length * Object.keys(resources).length;

function fileProcessedCallback() {
    numberOfFilesToProcess--;
    if (!numberOfFilesToProcess) {
        require('./localization-files-exporter.js');
    }
}

function buildLocaleResource(locale, resourceType) {
    var resource = resources[resourceType][locale] = {};
    bundles.each(function (bundle) {
        Object.each(bundle, function (key, value) {
            key = key.compact();
            if (Object.isString(value)) {
                value = value.compact();
            }
            bundle[key] = value;
        });
        var key = bundle[resourceTypes[resourceType]];
        var value = bundle[locales[locale]];
        var rootValue;
        if (key && value && !Object.has(resource, key)) {
            if (locale == rootLocale) {
                resource[key] = value;
                resourceCounts[resourceType]++;
                resourceCounts.total++;
            } else {
                rootValue = bundle[locales[rootLocale]];
                if (typeof rootValue == 'string') {
                    rootValue = rootValue.compact();
                }
                if (value != rootValue) {
                    resource[key] = value;
                }
            }
        }
    });
    if (!Object.isEmpty(resource)) {
        var filename = '';
        var content = '';
        if (resourceType == 'strings') {
            filename = '../../assets/js/nls/' + ((locale == rootLocale) ? '' : (locale + '/')) + 'strings.js';
            var nonRootLocalesString = '';
            if (locale == rootLocale) {
                var nonRootLocales = Object.keys(locales).findAll(function (i) { return i != rootLocale; });
                nonRootLocales.each(function (i, index) {
                    nonRootLocalesString += '"' + i + '": true' + ((index != (nonRootLocales.length - 1)) ? ',\n' : '');
                });
            }
            content = 'define(' + ((locale == rootLocale) ? '{\n"root": ' : '') + JSON.stringify(resource, null, 4) + ((locale == rootLocale) ? (',\n' + nonRootLocalesString + '\n}') : '') + ');\n';
        }
        fs.writeFile(filename, content, function (error) {
            if (error) {
                console.error(error);
            } else {
                console.log('-> ' + filename);
            }
            fileProcessedCallback();
        });
    } else {
        fileProcessedCallback();
    }
}

console.log('Number of raw bundles: ' + bundles.length);
Object.each(locales, function (locale) {
    Object.each(resourceTypes, function (resourceType) {
        buildLocaleResource(locale, resourceType);
    });
});

console.log('Number of valid bundles: ' + resourceCounts.total);
Object.each(resourceTypes, function (resourceType) {
    console.log('Number of ' + resourceType + ': ' + resourceCounts[resourceType]);
});
