var http = require('http')
var https = require('https')
var url = require('url')
var StringDecoder = require('string_decoder').StringDecoder
var environment = require('../config/config')
var fs = require('fs')
const crypto = require('crypto')

const _data = require('./lib/data')
const router = require('./lib/router')
const helpers = require('./lib/helpers')

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
    //res.end("Hello World!\n")
    //console.log('Request received on path:', trimmedPath, 
    //  " with method: " , method, 
    //  " with queryString: ", queryString, 
    //  " with headers: ", headers, 
    //  " payload:", buffer ? buffer : 'empty'
    //)

    var data = {
      'path' : trimmedPath,
      'queryString' : queryString,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonFromString(buffer)
    }

    let handler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : router['notFound']

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

// Instantiate the HTTP server
var httpServer = http.createServer(unifiedServer)

// HTTPS server configuration
var httpsServerOptions = {
  'key' : fs.readFileSync('../config/key.pem'),
  'cert' : fs.readFileSync('../config/cert.pem')
}
// Instantiate the HTTPS server
var httpsServer = https.createServer(httpsServerOptions, unifiedServer)

var handlers = {}

// Sample handler - Used for test purposes
// The callback will receive the HTTP response code and the payload
handlers.sample = function(data, callback) {
  callback(200, { 'name' : 'sample handler'} )
}

// Not found handler - Used for test purposes
// The callback will receive the HTTP response code and the payload
handlers.notFound = function(data, callback) {
  callback(404, { 'name' : 'sample handler'} )
}

// Starts the HTTP server and listen to the port 3000
httpServer.listen(environment.httpPort, function() {
  console.log("The assignment's #2 http server is ready and listening at port " + environment.httpPort + " - with environment name = " + environment.envName + ".")
})

// Starts the HTTP server and listen to the port 3000
httpsServer.listen(environment.httpsPort, function() {
  console.log("The assignment's #2 https server is ready and listening at port " + environment.httpsPort + " - with environment name = " + environment.envName + ".")
})

let result = crypto.createHmac('sha256', environment.hashingSecret)
result = result.update('luana1')
result = result.digest('hex')
console.log(result)

console.log(helpers.hash('luana1'))