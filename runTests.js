require('babel-core/register');
require('babel-polyfill');

const MiaJs = require('mia-js-core').Run;
const Jasmine = require('jasmine');
const JasmineConsoleReporter = require('jasmine-console-reporter');

MiaJs.init()
    .then(MiaJs.start)
    .then(() => {
        console.log('MiaJs started - running the tests now');
        const jasmine = new Jasmine();
        const reporter = new JasmineConsoleReporter({
            colors: 1,           // (0|false)|(1|true)|2
            cleanStack: 1,       // (0|false)|(1|true)|2|3
            verbosity: 4,        // (0|false)|1|2|(3|true)|4
            listStyle: 'indent', // 'flat'|'indent'
            activity: false
        });

        jasmine.loadConfigFile('spec/support/jasmine.json');
        jasmine.addReporter(reporter);
        jasmine.execute();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
