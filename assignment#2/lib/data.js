/*
* Library to store and edit data
*/

// Dependencies
const fs = require('fs')
const path = require('path')

const lib = {}

// Base directory for the data
lib.baseDir = path.join(__dirname, '/../.data/')

// Builds the path for file given it's directory and filename
lib.buildFilePath = function(directory, filename) {
  let result = path.join(path.join(lib.baseDir, directory), filename)
  if (result.indexOf('.json') === -1) {
    result += '.json'
  }
  return result;
}

// Create a new data file if it does not exists
lib.create = function(directory, filename, data, callback) {

  const path = lib.buildFilePath(directory, filename)

  if (fs.existsSync(path)) {
    callback('Could not create the new file, it already exists.')
  } else {
    // Open the file for writing
    fs.open(path, 'wx', function(err, fileDescriptor) {
      if (!err && fileDescriptor) {
        // Convert the data to a JSON string
        const stringData = JSON.stringify(data)
        // Write to the file and close it.
        fs.writeFile(fileDescriptor, stringData, 'utf8', function(err) {
          if (!err) {
            fs.close(fileDescriptor, function(err) {
              if (!err) {
                callback(false)
              } else {
                callback('Error closing the new file.')
              }
            })
          } else {
            callback('Error writing to the new file.')
          }
        })
      } else {
        callback('Could not create the new file, it may already exist.')
      }
    })
  }
}

// Read data from a file
lib.read = function(directory, filename, callback) {
  fs.readFile(lib.buildFilePath(directory, filename), 'utf8', function(err, data) {
    callback(err, data)
  })
}

// Update the data from a file
lib.update = function(directory, filename, data, callback) {
  fs.open(lib.buildFilePath(directory, filename), 'r+', function(err, fileDescriptor) {
    if (!err) {
      const stringData = JSON.stringify(data)
      fs.ftruncate(fileDescriptor, function(err) {
        if (!err) {
          fs.writeFile(fileDescriptor, stringData, 'utf8', function(err) {
            if (!err) {
              fs.close(fileDescriptor, function(err) {
                if (!err) {
                  callback(false)
                } else {
                  callback('Error closing the file.')
                }
              })
            } else {
              callback('Error writing to existing file.')
            }
          })
        } else {
          callback('Error truncating file.')
        }
      })
    } else {
      callback('Could not open the file for update. It may not exist yet.')
    }
  })
}

// Deletes the data file.
lib.delete = function(directory, filename, callback) {
  fs.unlink(lib.buildFilePath(directory, filename), function(err) {
    if (!err) {
      callback(false)
    } else {
      callback(err)
    }
  })
}

// Exports the module
module.exports = lib
