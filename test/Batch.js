const fs = require("fs");
const assert = require("assert");
const Batch = require("../src/Batch");

const trx = new Batch();

trx.add({
  id: "get-perm-1",
  uri: "/drive/v2/files/fileId/permissions",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  json: true,
  body: {
    role: "reader",
    type: "user",
    value: "user@example.com",
  },
});

trx.add({
  id: "get-perm-2",
  uri: "/drive/v2/files/fileId/permissions",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  json: true,
  body: {
    role: "writer",
    type: "anon",
    value: "anon@example.com",
  },
});

const req = trx.buildRequest("TEST_ACCESS_TOKEN");
assert.equal(req.url, "https://www.googleapis.com/batch");
assert.equal(req.method, "POST");
assert.deepEqual(req.auth, { bearer: "TEST_ACCESS_TOKEN" });
assert.match(
  req.headers["Content-type"],
  /multipart\/mixed; boundary=batch_\d+/
);
assert.equal(req.multipart.chunked, false);
assert.equal(req.multipart.data.length, 2);
assert.deepEqual(req.multipart.data[0], {
  "Content-Type": "application/http",
  "Content-ID": "get-perm-1",
  body: fs.readFileSync(__dirname + "/Batch.expected1.txt", "utf8"),
});
