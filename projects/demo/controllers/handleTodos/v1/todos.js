/**
 * @module      :: ToDo Handler
 * @description :: Write/Read to tasks
 */

var MiaJs = require('mia-js-core')
    , Shared = MiaJs.Shared
    , Logger = MiaJs.Logger.tag('demo')
    , DemoLib = Shared.libs('demo-lib')
    , Q = require('q');

function thisModule() {
    var self = this;
    self.disabled = false; // Enable /disable controller
    self.identity = 'demo-toDoHandler'; // Unique controller id used in routes, policies and followups
    self.version = '1.0'; // Version number of service
    self.created = '2015-07-14T12:00:00'; // Creation date of controller
    self.modified = '2015-07-14T12:00:00'; // Last modified date of controller
    self.group = 'demo'; // Group this service to a origin

    /*
     Preconditions:
     - Define preconditions for this controller as validity check before controller gets executed
     - Parameters: Parse and validate input data (available in req.miajs.validatedParameters)
     - Responses: Show up in docs and services listing for developers
     */
    self.preconditions = {
        listToDoItems: {
            parameters: {
                query: {
                    limit: {
                        desc: "Number of items",
                        type: Number
                    },
                    skip: {
                        desc: "Skip number of items for paging",
                        type: Number
                    },
                    sort: {
                        desc: "Sort by name or lastModified",
                        type: String
                    },
                    ascending: {
                        desc: "Sort ascending",
                        type: Boolean
                    }
                }
            },
            responses: {
                200: "Success"
            }
        },
        getToDoItem: {
            parameters: {
                path: {
                    id: {
                        desc: "Id of todo item",
                        type: String,
                        required: true
                    }
                }
            },
            responses: {
                200: "Success"
            }
        },
        create: {
            parameters: {
                body: {
                    name: {
                        desc: "Name of todo item",
                        type: String,
                        required: true
                    },
                    status: {
                        desc: "Status of item in list allowed [checked|unchecked]",
                        type: String
                    }
                }
            },
            responses: {
                200: "Success",
                500: "SomethingHappend"
            }
        },
        update: {
            parameters: {
                path: {
                    id: {
                        desc: "Id of todo item",
                        type: String,
                        required: true
                    }
                },
                body: {
                    name: {
                        desc: "Name of todo item to update",
                        type: String
                    },
                    status: {
                        desc: "Status of item in list allowed [checked|unchecked]",
                        type: String
                    }
                }
            },
            responses: {
                200: "Success",
                500: "SomethingHappend"
            }
        },
        delete: {
            parameters: {
                path: {
                    id: {
                        desc: "Id of todo item to delete",
                        type: String,
                        required: true
                    }
                }
            },
            responses: {
                200: "Success",
                400: "NothingToRemove",
                500: "SomethingHappend"
            }
        }
    };


    var _createInitialToDoData = function () {
        var writeData = [];
        var initData = Shared.config("demo-config.defaultToDos");
        for (var index in initData) {
            writeData.push(DemoLib.addToDoItem(initData[index], "unchecked"));
        }
        return Q.all(writeData);
    };


    /* Available default methods used for routing:
     all, list, index, create, update, delete, post, put, get */

    // List all todo items
    self.listToDoItems = function (req, res, next) {

        var sort = req.miajs.validatedParameters && req.miajs.validatedParameters.query && req.miajs.validatedParameters.query.sort ? req.miajs.validatedParameters.query.sort : "created";
        var limit = req.miajs.validatedParameters && req.miajs.validatedParameters.query && req.miajs.validatedParameters.query.limit ? req.miajs.validatedParameters.query.limit : null;
        var skip = req.miajs.validatedParameters && req.miajs.validatedParameters.query && req.miajs.validatedParameters.query.skip ? req.miajs.validatedParameters.query.skip : null;
        var ascending = req.miajs.validatedParameters && req.miajs.validatedParameters.query && req.miajs.validatedParameters.query.ascending ? req.miajs.validatedParameters.query.ascending : false;


        DemoLib.getAllTodos(sort, ascending, limit, skip).then(function (result) {
            // Set a header
            res.header("About", Shared.config('demo-config.title'));

            if (result.length == 0) {
                //Create some initial data on the fly
                return _createInitialToDoData().then(function () {
                    return DemoLib.getAllTodos(sort, ascending, limit, skip);
                });
            }
            else {
                return Q(result);
            }
        }).then(function (result) {
            res.response = result;
            next();
        }).fail(function (err) {
            next({status: 500});
        });
    };

    // List all todo items
    self.getToDoItem = function (req, res, next) {

        var id = req.miajs.validatedParameters.path.id;

        DemoLib.getTodo(id).then(function (result) {
            // Set a header
            res.header("About", Shared.config('demo-config.title'));
            return Q(result);
        }).then(function (result) {
            res.response = result;
            next();
        }).fail(function (err) {
            next({status: 500});
        });
    };

    // Create a todo item
    self.create = function (req, res, next) {
        var name = req.miajs.validatedParameters.body.name;
        var status = req.miajs.validatedParameters.body.status;

        DemoLib.addToDoItem(name, status).then(function (result) {
            res.response = result;
            next();
        }).fail(function (err) {
            if (err) {
                // Exmaple of settings a custom status code and auto parse error
                next({
                    'status': 400,
                    err: err
                });
            }
            else {
                next({status: 500});
            }
        });
    };

    // Update a todo item
    self.update = function (req, res, next) {
        var name = req.miajs.validatedParameters.body.name;
        var id = req.miajs.validatedParameters.path.id;
        var status = req.miajs.validatedParameters.body.status;
        DemoLib.updateToDoItem(id, name, status).then(function () {
            next();
        }).fail(function (err) {
            if (err && err.code == "11000") {
                next(err);
            }
            // Other error
            else {
                next({status: 500});
            }

        });

    };

    // Delete a todo item
    self.delete = function (req, res, next) {

        var id = req.miajs.validatedParameters.path.id;

        DemoLib.deleteToDoItem(id).then(function () {
            next();
        }).fail(function (err) {
            if (err) {
                next({status: 500});
            }
            else {
                // Exmaple of a custom response error
                next({
                    'status': 404,
                    err: {
                        'code': 'NothingToRemove',
                        'msg': req.miajs.translator('demo-translations', 'NothingToRemove')
                    }
                });
            }
        });
    };


    return self;
}

module.exports = new thisModule();