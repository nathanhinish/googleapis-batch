const fs = require("fs");
const assert = require("assert");
const template = require("../src/template");

const EXPECTED = fs.readFileSync(__dirname + "/template.expected.txt", "utf8");
assert.equal(
  template({
    id: "get-perm-1",
    uri: "/drive/v2/files/fileId/permissions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    json: true,
    body: JSON.stringify({
      role: "reader",
      type: "user",
      value: "user@example.com",
    }),
  }),
  EXPECTED
);
