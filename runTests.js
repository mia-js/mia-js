var Jasmine = require('jasmine-node')
    , fs = require('fs')
    , _String = require('underscore.string')
    , Trycatch = require('trycatch')
    , Logger = require("mia-js-core/node_modules/logger");

Trycatch(function () {
    //take third argument (if available), otherwise take second argument, otherwise nothing
    var relativePath = process.argv[3] || process.argv[2] || '';
    var fullPath = _String.rtrim(__dirname + '/' + _String.ltrim(relativePath, '/'), '/');

    if (!fs.lstatSync(fullPath).isDirectory()) {
        throw new Error("Path '" + fullPath + "' doesn't exist!");
    }

    Jasmine.executeSpecsInFolder({
        specFolders: [fullPath],
        onComplete: function (runner, log) {
            if (runner.results().failedCount == 0) {

                // Use Timeout to prevent output disappear when running on windows
                setTimeout(function () {
                    process.exit(0);
                }, 100);
            }
            else {
                // Use Timeout to prevent output disappear when running on windows
                setTimeout(function () {
                    process.exit(1);
                }, 100);
            }
        },
        isVerbose: true,
        showColors: true,
        /*junitreport: {
         report: true,
         savePath: "./tests/",
         useDotNotation: true,
         consolidate: true
         }*/
    });




}, function (err) {
    Logger('err', err);
    process.exit(1);
});
