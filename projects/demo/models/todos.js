var _ = require('lodash');
var BaseModel = require("mia-js-core/node_modules/baseModel").V2;

module.exports = BaseModel.extend({
        data: {
            _id: {},
            name: {
                type: String,
                index: true,
                required: true,
                unique: true
            },
            status: {
                type: String,
                allowed: ["checked","unchecked"],
                default: "unchecked"
            },
            group: {
                type: String,
                allowed: ["demo"],
                required: true
            },
            lastModified: {
                type: Date,
                index: true,
                required: true
            },
            created: {
                type: Date,
                index: true,
                required: true
            }
        }
        /*
        Add compound indexes as followed:
        ,compoundIndexes: [
         {
         fields: ["name", "group"],
         unique: true
         }
         ]
         */
    },
    {
        disabled: false, // Enable /disable model
        identity: 'todos-model', // Model name
        version: '1.0', // Version number
        created: '2015-07-14T12:00:00', // Creation date
        modified: '2015-07-14T12:00:00', // Last modified date
        collectionName: 'demo.todos'
    });


