var _ = require('lodash');
var BaseModel = require("mia-js-core/lib/baseModel");

module.exports = BaseModel.extend({
        data: {}
    },
    {
        disabled: false, // Enable /disable model
        identity: 'generic-errorLogEntry-model', // Model name
        version: '1.0', // Version number
        created: '2014-04-01T19:00:00', // Creation date
        modified: '2014-04-01T19:00:00', // Last modified date
        collectionName: 'errorLogEntries',
        collectionOptions: { capped : true, size : 5242880, max : 1000 } //size: max size in bytes, max: max document number
    });