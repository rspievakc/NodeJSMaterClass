var http = require('http')
var url = require('url')
var StringDecoder = require('string_decoder').StringDecoder
var environment = require('../config')
var fs = require('fs')

var unifiedServer = function(req, res) {

  var parsedUrl = url.parse(req.url, true)
  var path = parsedUrl.pathname
  // Removes the slashes from begin and end if there are any
  var trimmedPath = path.replace(/^\/+|\/+$/g,'')
  // Retrive the request's method
  var method = req.method.toLowerCase()
  // Parse the request's method into a json object
  var queryString = parsedUrl.query
  // Retrive the request's headers
  var headers = req.headers

  // Parse the request payload, if exists
  var decoder = new StringDecoder('utf-8')
  var buffer = ''
  req.on('data', function(data) {
    buffer += decoder.write(data)
  })
  req.on('end', function() {
    buffer += decoder.end()
    
    var data = {
      'path' : trimmedPath,
      'queryString' : queryString,
      'method': method,
      'headers': headers,
      'payload': buffer
    }

    var handler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound
    handler(data, function(statusCode, payload) {

      var _statusCode = typeof(statusCode) == 'number' ? statusCode : 200
      res.setHeader("Content-Type","application/json")
      res.writeHead(_statusCode)      
      var _payload = JSON.stringify(typeof(payload) == 'object' ? payload : {})
      res.end(_payload)

      console.log("Response - Status Code: ", _statusCode, ", payload:", _payload)
    })
  })
}

var handlers = {}

// Sample handler - Used for test purposes
// The callback will receive the HTTP response code and the payload
handlers.hello = function(data, callback) {
  callback(200, { 'message' : 'Welcome to the assignment #1.'} )
}

// Not found handler
// The callback will receive the HTTP response code and the payload
handlers.notFound = function(data, callback) {
  callback(404, { 
    'message' : 'Endpoint not found',
    'requestData' : data,
  })
}

var router = {
  'hello': handlers.hello,
  'notFound': handlers.notFound,
}

// Instantiate the HTTP server
var httpServer = http.createServer(unifiedServer)

// Starts the HTTP server and listen to the port 3000
httpServer.listen(environment.httpPort, function() {
  console.log("The assignment's #1 http server is ready and listening at port " + environment.httpPort + " - with environment name = " + environment.envName + ".")
})