/*
  Configuration file for the application
*/

var environments = {}

environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName' : 'staging',
  'hashingSecret' : 'ThisIsASecret',
}

environments.production = {
  'httpPort' : 5000,
  'httpsPort' : 5001, 
  'envName' : 'production',
  'hashingSecret' : 'ThisIsASecret',
}

var nodeEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging'
var environment = typeof(environments[nodeEnvironment]) === 'object' ? environments[nodeEnvironment] : environments.staging

module.exports = environment