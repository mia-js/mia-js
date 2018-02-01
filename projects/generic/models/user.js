var _ = require('lodash')
    , BaseModel = require("mia-js-core/lib/baseModel");

function thisModule() {

    var model = BaseModel.extend({
            data: {
                name: {
                    type: String,
                    index: true
                },
                login: {
                    type: String,
                    index: true,
                    required: true
                },
                /**
                 * if nativeLoginIsSet === true, the login was set meaningfully (is not auto-generated) and can be used to identify the user. The login and password pair can be used for user login, otherwise the native login possibility is locked.
                 */
                nativeLoginIsSet: {
                    type: Boolean,
                    default: false,
                    index: true
                },
                messaging: [{
                    type: {
                        type: String,
                        allow: ['email'],
                        index: true,
                        required: true
                    },
                    value: {
                        type: String,
                        index: true,
                        required: true
                    },
                    validated: {
                        type: Boolean,
                        default: false,
                        index: true
                        //,required: true
                    },
                    inspectTokens: {
                        validateToken: {
                            token: {
                                type: String,
                                unique: true,
                                sparse: true
                            },
                            tokenIssueDate: {
                                type: Date
                            }
                        }
                    }
                }],
                group: {
                    type: String,
                    index: true,
                    required: true
                },
                passHash: {
                    type: String,
                    index: true
                },
                etag: {
                    type: String,
                    index: true
                },
                status: {
                    type: String,
                    default: 'active',
                    allow: ['active', 'inactive', 'deleted'],
                    required: true,
                    index: true
                },
                validated: {
                    type: Boolean,
                    default: false,
                    //required: true,
                    index: true
                },
                deviceCounts: [{
                    appId: {
                        type: String,
                        required: true,
                        index: true
                    },
                    deviceCount: {
                        type: Number,
                        default: 0,
                        required: true
                    }
                }],
                thirdParty: [
                    {
                        provider: {
                            type: String,
                            allow: ['fb'],
                            required: true,
                            index: true
                        },
                        id: {
                            type: String,
                            required: true,
                            index: true
                        }
                    }
                ],
                inspectTokens: {
                    invalidateToken: {
                        token: {
                            type: String,
                            unique: true,
                            sparse: true
                        },
                        tokenIssueDate: {
                            type: Date
                        }
                    },
                    passwordResetToken: {
                        token: {
                            type: String,
                            unique: true,
                            sparse: true
                        },
                        tokenIssueDate: {
                            type: Date
                        }
                    }
                },
                accessTokens: [{
                    token: {
                        type: String,
                        required: true,
                        unique: true,
                        sparse: true
                    },
                    appId: {
                        type: String,
                        index: true
                    },
                    device: {
                        id: {
                            type: String,
                            index: true
                        },
                        name: {
                            type: String
                        }
                    },
                    tokenIssueDate: {
                        type: Date,
                        index: true
                    }
                }]
            },
            compoundIndexes: [
                {
                    fields: ["login", "group"],
                    unique: true
                },
                {
                    fields: ["accessTokens.appId", "accessTokens.device.id"],
                    unique: true,
                    sparse: true
                },
                {
                    fields: ["group", "thirdParty.provider", "thirdParty.id"],
                    sparse: true
                },
                {
                    fields: ["_id", "thirdParty.provider"],
                    unique: true
                },
                {
                    fields: ["group", "messaging.type", "messaging.value"],
                    unique: true
                },
                {
                    fields: ["_id", "status"]
                },
                {
                    //not sure if this index is required
                    fields: ["_id", "accessTokens.appId", "accessTokens.device.id"]
                },
                {
                    fields: ["_id", "status", "etag", "accessTokens.appId", "accessTokens.device.id"]
                },
                {
                    //not sure if this index is required
                    fields: ["login", "group", "accessTokens.appId", "accessTokens.device.id"]
                },
                {
                    fields: ["login", "group", "status", "passHash", "accessTokens.appId", "accessTokens.device.id"]
                },
                {
                    fields: ["status", "accessTokens.appId", "accessTokens.device.id"]
                },
                {
                    fields: ["_id", "status", "accessTokens.appId", "accessTokens.device.id"]
                }
            ]
        },
        {
            disabled: false, // Enable /disable model
            identity: 'generic-user-model', // Model name
            version: '1.0', // Version number
            created: '2014-10-31T19:00:00', // Creation date
            modified: '2017-12-29T11:00:00', // Last modified date
            collectionName: 'users'
        });

    return model;
}

module.exports = thisModule();
