const Batch = require('./batch')

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

module.exports = Service
