const request = require('request')
const Promise = require('bluebird')
const configurations = require('./configurations')
const validation = require('./validation')

let requestManager = module.exports = {
  JSON_MIME_TYPE: 'application/json'
}

requestManager.create = function(options) {
  let calledArguments = arguments
  return new Promise(function (resolve, reject) {
    let callback = calledArguments[calledArguments.length - 1];
    const schema = options.schema
    const url = 'https://api.mobbex.com/p'
    const path = options.path
    const method = options.method
    let headers = requestManager.setHeaders()
    let body = {}
    let error

    /* istanbul ignore next */
    if (typeof callback !== 'function')
    {
      calledArguments = Array.prototype.slice.call(calledArguments)
      calledArguments.push(function () {})
    }

    if (method === 'POST' || method === 'PUT') {
      if (calledArguments.length < 3) {
        error = new Error('Expecting two arguments, one given')
        reject(error)
      }
    }
    if (calledArguments.length > 2) {
      if (typeof calledArguments[calledArguments.length - 2] === 'object') body = calledArguments[calledArguments.length - 2]
      else {
        error = new Error('Expecting last argument be of type Object')
        reject(error)
      }
    }

    if (method === 'GET' || method === 'DELETE') {
      request({
        method: method,
        uri: url + path,
        headers: headers
      }, function (error, response, body) {
        /* istanbul ignore if */
        if (error) reject(error)
        else resolve(JSON.parse(body))
      })
    }

    if (method === 'POST' || method === 'PUT') {
      if (schema) {
        let errors
        errors = validation.validate(schema, body)
        if (errors.length > 0) {
          error = new Error(validation.message(errors))
          reject(error)
        }
      }
      request({
        method: method,
        uri: url + path,
        headers: headers,
        form: body
      }, function (error, response, body) {
        /* istanbul ignore if */
        if (error) reject(error)
        else resolve(JSON.parse(body))
      })
    }

  })
}

/* istanbul ignore next */
requestManager.setHeaders = function () {
  let headers = {}
  let error

  if (!configurations.getApiKey() || !configurations.getAccessToken()) {
    error = new Error('Must set Api Key and Access Token')
    throw error
  }
  else {
    headers = {
      'x-api-key': configurations.getApiKey(),
      'x-access-token': configurations.getAccessToken(),
      'Content-Type': requestManager.JSON_MIME_TYPE
    }
    return headers
  }
}
