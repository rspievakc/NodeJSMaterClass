/*
* Helpers library
* 
*
*/

const crypto = require('crypto');
const config = require('../../config/config')

const helpers = {}

helpers.hash = function(input) {
  if (typeof(input) === 'string' && input.trim().length > 0) {
    return crypto.createHmac('sha256', config.hashingSecret).update(input).digest('hex')
  }
  return false
}

// Parse a JSON String and does not throw error
helpers.parseJsonFromString = function(input) {
  let result = {}
  try {
    result = JSON.parse(input)
  }
  catch(e) {
    return {}
  }
  return result;
}

module.exports = helpers