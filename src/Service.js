const Batch = require("./batch");

module.exports = class Service {
  constructor(options) {
    options = options || {};
    if (!options.auth) {
      throw new Error("options.auth is required");
    }
    this.auth = options.auth;
  }

  start() {
    return new Batch(this.auth);
  }
};
