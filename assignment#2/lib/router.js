const _data = require('../lib/data')
const helpers = require('./helpers')

let handlers = {}

handlers.ping = function(data, callback) {
  callback(200)
}

handlers.notFound = function(data, callback) {
  callback(404)
}

handlers.user = function(data, callback) {
  
  const acceptableMethods = ['post','get','update','delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback)
  } else {
    handlers.notFound(data, callback);
  }

}

handlers._users = {}

/*
* User validator - Validates and build the user object
* Required fields: [firstName, lastName, email, password]
* Optional: none
*/

handlers._users.validate = function(data, callback) {
  let firstName = data.payload.firstName
  let lastName = data.payload.lastName
  let email = data.payload.email
  let password = data.payload.password

  firstName = typeof(firstName) === 'string' && firstName.trim().length > 0 ? firstName.trim() : false
  lastName = typeof(lastName) === 'string' && lastName.trim().length > 0 ? lastName.trim() : false
  email = typeof(email) === 'string' && email.trim().length > 0 ? email.trim() : false
  password = typeof(password) === 'string' && password.trim().length > 0 ? password.trim() : false

  let error = {}
  if (!firstName) {
    error.firstName = "Missing the firstName field."
  }
  if (!lastName) {
    error.lastName = "Missing the lastName field."
  }
  if (!email) {
    error.email = "Missing the email field."
  }
  if (!password) {
    error.password = "Missing the password field."
  }

  let hasErrors = false;
  for(let key in error) {
    if(error.hasOwnProperty(key)) {
      hasErrors = true;
      break;
    }
  }

  if (hasErrors) {
    callback(error)
  } else {
    callback(false, {
      firstName,
      lastName,
      email,
      password
    })
  }
}

// Users post
handlers._users.post = function(data, callback) {
  handlers._users.validate(data, function(err, user) {
    if (!err) {
      _data.read('users', user.email, function(err) {
        if (err) {
          user.password = helpers.hash(user.password)
          if (user.password) {
            _data.create('users', user.email, user, function(err) {
              if (!err) {
                callback(200)
              } else {
                console.log(err)
                callback(400, { message: 'Could not create the user', err } )
              }
            })
          } else {
            callback(400, { message: "Could not hash the password." })
          }
        } else {
          callback(400, { message: 'An user with the given email already exists.' })
        }
      })
    } else {
      callback(400, err)
    }
  })
}

// Users get
handlers._users.get = function(data, callback) {
  handlers._users.validate(data, function(err) {
    if (!err) {
      callback(200)
    } else {
      callback(400, err)
    }
  })
}

// Users update
handlers._users.update = function(data, callback) {
  callback(200)
}

// Users delete
handlers._users.delete = function(data, callback) {
  callback(200)
}

const router = {
  'ping': handlers.sample,
  'notFound': handlers.notFound,
  'user': handlers.user,
}

module.exports = router