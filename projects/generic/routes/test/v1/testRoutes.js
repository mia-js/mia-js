var ver = '1.0';

module.exports = {

    group: 'generic',
    name: 'Tests',
    version: ver,
    prefix: '/api/tests/generic/v1',
    environment: ["test"],
    routes: {

        //users
        './users/me': {
            post: {
                identity: 'signUp',
                modified: new Date(2014, 10, 3, 15, 0, 0),
                description: "Sign up a user",
                docs: true,
                controller: [
                    {
                        name: 'generic-validateSession',
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'setParametersForSignup',
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'signUp',
                        version: '1.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            },
            get: {
                identity: 'getOwnProfile',
                modified: new Date(2014, 10, 3, 15, 0, 0),
                description: "Get own profile. User must be logged in in order to be able to use this service.",
                docs: true,
                controller: [
                    {
                        name: 'generic-validateSession',
                        version: '1.0'
                    },
                    {
                        name: 'generic-validateUserLogin',
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'getProfile',
                        version: '1.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            },
            put: {
                identity: 'updateOwnProfile',
                modified: new Date(2014, 10, 3, 15, 0, 0),
                description: "Update own profile. User must be logged in in order to be able to use this service.",
                docs: true,
                controller: [
                    {
                        name: 'generic-validateSession',
                        version: '1.0'
                    },
                    {
                        name: 'generic-validateUserLogin',
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'updateProfile',
                        version: '1.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            },
            del: {
                identity: 'deleteAccount',
                modified: new Date(2014, 10, 3, 15, 0, 0),
                description: "Delete own profile. User must be logged in in order to be able to use this service.",
                docs: true,
                controller: [
                    {
                        name: 'generic-validateSession',
                        version: '1.0'
                    },
                    {
                        name: 'generic-validateUserLogin',
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'deleteAccount',
                        version: '1.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            }
        },

        './users/me/login/native': {
            post: {
                identity: 'login',
                modified: new Date(2014, 7, 1, 15, 0, 0),
                description: "Login user",
                docs: true,
                controller: [
                    {
                        name: 'generic-validateSession',
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'login',
                        version: '1.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            }
        },

        './users/me/login/fb': {
            post: {
                identity: 'loginWithFb',
                modified: new Date(2014, 7, 1, 15, 0, 0),
                description: "Login user",
                docs: true,
                controller: [
                    {
                        name: 'generic-validateSession',
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'loginUserWithFacebook',
                        version: '1.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            }
        },

        './users/me/logout': {
            post: {
                identity: 'logout',
                modified: new Date(2014, 7, 1, 15, 0, 0),
                description: "Logout user",
                docs: true,
                controller: [
                    {
                        name: 'generic-validateSession',
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'logout',
                        version: '1.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            }
        },

        './users/me/requestPasswordReset': {
            post: {
                identity: 'requestPasswordReset',
                description: "Request password reset token",
                docs: true,
                modified: new Date(2014, 10, 3, 15, 0, 0),
                controller: [
                    {
                        name: 'generic-validateSession',
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'requestPasswordReset',
                        version: '1.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            }
        },

        './users/me/resetPassword': {
            post: {
                identity: 'resetPassword',
                description: "Reset password",
                docs: true,
                modified: new Date(2014, 10, 3, 15, 0, 0),
                controller: [
                    {
                        name: 'generic-validateSession',
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'resetPassword',
                        version: '1.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            }
        },

        './users/me/validate': {
            post: {
                identity: 'validateUser',
                description: "Validate user",
                docs: true,
                modified: new Date(2014, 10, 3, 15, 0, 0),
                controller: [
                    {
                        name: 'generic-users',
                        function: "validateUser",
                        version: '1.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            }
        },

        './users/me/invalidate': {
            post: {
                identity: 'invalidateUser',
                description: "Invalidate user",
                docs: true,
                modified: new Date(2014, 10, 3, 15, 0, 0),
                controller: [
                    {
                        name: 'generic-users',
                        function: "invalidateUser",
                        version: '1.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            }
        },

        // SERVICE
        './services': {
            list: {
                identity: 'services',
                modified: new Date(2014, 4, 24, 15, 0, 0),
                description: "Lists services available for the congrats API",
                docs: true,
                controller: [
                    {
                        name: 'generic-listServices',
                        version: '2.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            }
        },

        // SESSION
        './devices/:id/sessions': {
            create: {
                identity: 'sessions',
                modified: new Date(2014, 4, 24, 15, 0, 0),
                description: "Generates a new session for a device",
                docs: true,
                controller: [
                    {
                        name: 'generic-accessKeyService',
                        version: '1.0'
                    },
                    {
                        name: 'generic-generateSession',
                        version: '1.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            }
        },

        //device
        './devices': {
            create: {
                identity: 'devices',
                modified: new Date(2014, 4, 24, 15, 0, 0),
                description: "Creates a new device",
                docs: true,
                controller: [
                    {
                        name: 'generic-deviceProfile',
                        version: '1.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            },
            update: {
                identity: 'device',
                modified: new Date(2014, 4, 24, 15, 0, 0),
                description: "Updates device parameters",
                docs: true,
                controller: [
                    {
                        name: 'generic-validateSession',
                        version: '1.0'
                    },
                    {
                        name: 'generic-deviceProfile',
                        version: '1.0'
                    },
                    {
                        name: 'generic-cachingCacheControl',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            }
        }
    }
};