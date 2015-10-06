# googleapis-batch
Provides a way to run batch requests through Google's APIs

```javascript
// Adds the batch service to googleapis module
require('googleapis-batch')

// Get reference to batch service & create instance
var Service = require('googleapis').batch
var batchSvc = new Service({
  auth: ...
})

// creates a new batch request instance
var batch = batchSvc.start()

// Adding a request
// Taken from https://developers.google.com/drive/web/batch
batch.add({
  id: 'get-perm-1', // you can give IDs that will map to responses
  uri: '/drive/v2/files/fileId/permissions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    "role": "reader",
    "type": "user",
    "value": "user@example.com"
  }
})

// Adding a second request
// Taken from https://developers.google.com/drive/web/batch
batch.add({
  id: 'get-perm-2',
  uri: '/drive/v2/files/fileId/permissions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    "role": "reader",
    "type": "user",
    "value": "user@example.com"
  }
})

batch.send(function(err, result) {
  console.info(result['get-perm-1'])
  console.info(result['get-perm-2'])
})
```
