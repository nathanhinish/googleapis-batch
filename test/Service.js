const assert = require("assert");
const Service = require("../src/Service");

assert.throws(() => {
  const svc = new Service();
}, "Should throw an error if auth info is missing");
