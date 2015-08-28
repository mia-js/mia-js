var _ = require('lodash');
var BaseModel = require("mia-js-core/node_modules/baseModel").V2;

module.exports = BaseModel.extend({
        data: {
            configId: {
                type: String,
                required: true
            },
            workerId: {
                type: String,
                default: null,
                nullable: true,
                index: true
            },
            type: {
                index: true,
                required: true,
                allow: ["mail", "push"]
            },
            notification: {
                template: {
                    type: String,
                    required: true
                },
                to: {
                    type: String,
                    required: true
                },
                badge: {
                    type: Number
                },
                payload: {},
                replacements: {}
            },
            status: {
                type: String,
                default: "pending",
                allow: ["pending", "retry", "processing", "rejected", "fulfilled"],
                index: true
            },
            log: {},
            retry: {
                type: Number,
                default: 0
            },
            schedule: {
                type: Date,
                required: true,
                index: true
            },
            processed: {
                type: Date,
                nullable: true,
                default: null,
                index: true
            },
            created: {
                type: Date,
                required: true,
                index: true
            }
        },
        compoundIndexes: [
            {
                fields: ["status", "schedule", "worker"]
            },
            {
                fields: ["status", "schedule"]
            },
            {
                fields: ["status", "retry"]
            },
            {
                fields: ["status", "processed", "schedule"]
            }
        ]
    },
    {
        disabled: false, // Enable /disable model
        identity: 'generic-notifications-model', // Model name
        version: '1.0', // Version number
        created: '2015-04-05T19:00:00', // Creation date
        modified: '2015-04-05T19:00:00', // Last modified date
        collectionName: 'notifications'
    });