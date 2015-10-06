'use strict'
var path = require('path')
var _ = require('lodash')
var swig = require('swig')
var async = require('async')
var googleapis = require('googleapis')

var requestTpl = swig.compileFile(path.join(__dirname, '/request.swig'))

var CONTENT_ID_RE = /Content-ID\: response-(.+)/
var HEADERS_RE = /\n{2}((?:.|\n)+)\n{2}/m
var STATUS_CODE_RE = /HTTP\/1.1 (\d+) /
var JSON_MIMETYPE = 'application/json'

function Batch(client) {
  this._client = client
  this._parts = []
}

Batch.prototype.authorize = function(done) {
  this._client.authorize(done)
}

Batch.prototype._send = function(authResp, done) {
  var parts = this._parts || []
  var auth = this._client
  var boundary = 'batch_' + Date.now()

  var requests = parts.map(function(part, index) {
    if (part.json && part.body) {
      part.body = JSON.stringify(part.body)
    }

    return {
      'Content-Type': 'application/http',
      'Content-ID': part.id || 'Request-' + (index + 1),
      body: requestTpl(part)
    }
  })

  console.info('Sending %d requests in batch', parts.length)

  auth.request({
    url: 'https://www.googleapis.com/batch',
    method: 'POST',
    auth: {
      bearer: authResp.access_token
    },
    headers: {
      'Content-type': 'multipart/mixed; boundary="' + boundary + '"'
    },
    multipart: {
      chunked: false,
      data: requests
    }
  }, done)
}

Batch.prototype.parseResponse = function(body, response, done) {
  try {
    var boundary = response.headers['content-type'].split(';')[1].replace(' boundary=', '--')
    body = body.substr(boundary.length).replace(boundary + '--', '').replace(/\r?\n/g, '\n')
    var parts = _.map(body.split(boundary), _.trim)
    var responses = _(parts).map(function(part) {
      var json = {
        id: part.match(CONTENT_ID_RE)[1]
      }

      var headers = part.match(HEADERS_RE)[1].split('\n')
      var firstBodyLine = 3 + headers.length + 1

      // Remove the first line and find the HTTP status
      json.statusCode = parseInt(headers.shift().match(STATUS_CODE_RE)[1], 10)
      json.headers = {}
      _.each(headers, function(line) {
        var parts = line.split(': ')
        json.headers[parts[0]] = parts[1]
      })

      var body = part.split('\n').slice(firstBodyLine).join('\n')
      var contentType = (json.headers['content-type'] || json.headers['Content-Type']).split(';')[0]
      if (JSON_MIMETYPE === contentType) {
        try {
          body = JSON.parse(body)
          if (body.error) {
            json.error = body.error
          }
        } catch (err) {
          json.error = err
        }
      }
      json.body = body

      return json
    }).indexBy('id').value()

    done(undefined, responses)
  } catch (err) {
    done(err)
  }
}

/**
 * Just like request's options-with one addition
 * If the options has an 'id' property, this is
 * used for the Client-ID header. If 'id' is not
 * present, 'Request-${index+1}' is used.
 * Ex.
 * {
 *   uri: '/test',
 *   method: 'GET',
 *   headers: {},
 *   body: JSON|string,
 *   json: true
 * }
 */
Batch.prototype.add = function(options) {
  if (!options || !options.method || !options.uri) {
    return
  }
  this._parts.push(options)
  return this
}

Batch.prototype.send = function(callback) {
  callback = callback || _.noop

  async.waterfall([
    this.authorize.bind(this),
    this._send.bind(this),
    this.parseResponse.bind(this)
  ], callback)
}

function Service(options) {
  options = options || {}
  if (!options.auth) {
    throw new Error('options.auth is required')
  }
  this.auth = options.auth
}

Service.prototype.start = function() {
  return new Batch(this.auth)
}

googleapis.batch = Service
