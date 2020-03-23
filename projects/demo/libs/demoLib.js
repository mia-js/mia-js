/**
 * Lib
 * Use libs to define functions you want to use in multiple controllers
 */

const Q = require('q')
const _ = require('lodash')
const MiaJs = require('mia-js-core')
const Shared = MiaJs.Shared
const ObjectID = require('mia-js-core/lib/dbAdapters').MongoObjectID
const ToDoModel = Shared.models('todos-model')

function ThisModule () {
  const self = this

  self.identity = 'demo-lib' // Controller name used in routes, policies and followups
  self.version = '1.0' // Version number of service

  // Custom variable
  const _groupName = 'demo'

  self.getAllTodos = function (sortBy, ascending, limit, skip) {
    const deferred = Q.defer()

    skip = _.isNumber(skip) ? parseInt(skip) : 0
    limit = _.isNumber(limit) ? parseInt(limit) : 25
    sortBy = sortBy || 'created'
    ascending = ascending && ascending === false ? -1 : 1

    const sort = {}
    sort[sortBy] = ascending

    ToDoModel.find({}).then(function (docs) {
      docs.sort(sort).skip(skip).limit(limit).toArray(function (err, result) {
        return err ? deferred.reject(err) : deferred.resolve(result)
      })
    })

    return deferred.promise
  }

  // Get a single todo item by object id
  self.getTodo = function (id) {
    const deferred = Q.defer()

    const query = {
      _id: ObjectID(id)
    }

    ToDoModel.find(query).then(function (docs) {
      docs.toArray(function (err, result) {
        return err ? deferred.reject(err) : deferred.resolve(result)
      })
    })

    return deferred.promise
  }

  // Add a toDo item to the db
  self.addToDoItem = function (name, status) {
    const data = {
      name: name,
      status: status,
      group: _groupName,
      lastModified: new Date(),
      created: new Date()
    }

    return ToDoModel.validate(data).then(function (validatedData) {
      return ToDoModel.insertOne(validatedData).then(function (data) {
        const deviceDataCreated = data.ops
        if (deviceDataCreated && deviceDataCreated[0] && deviceDataCreated[0]._id) {
          return Q.resolve({ id: deviceDataCreated[0]._id })
        } else {
          return Q.reject()
        }
      })
    }).catch(function (err) {
      return err && err.code === '11000' ? Q.reject(err) : Q.reject()
    })
  }

  // Update a todo item
  self.updateToDoItem = function (id, name, status) {
    const query = {
      _id: ObjectID(id)
    }

    const data = {
      group: _groupName,
      lastModified: new Date()
    }

    if (!_.isEmpty(name)) {
      data.name = name
    }

    if (!_.isEmpty(status)) {
      data.status = status
    }

    return ToDoModel.validate(data, { partial: true }).then(function (validatedData) {
      return ToDoModel.updateOne(query, { $set: validatedData }, {
        upsert: true
      }).then(function () {
        return Q.resolve()
      })
    }).catch(function (err) {
      return err && err.code === '11000' ? Q.reject(err) : Q.reject()
    })
  }

  self.deleteToDoItem = function (id) {
    const query = {
      _id: ObjectID(id)
    }
    return ToDoModel.deleteOne(query).then(function (data) {
      const deletedCount = data.deletedCount || 0
      return deletedCount === 1 ? Q.resolve() : Q.reject()
    }).catch(function (err) {
      return Q.reject(err)
    })
  }

  return self
}

module.exports = new ThisModule()
