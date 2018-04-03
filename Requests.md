# Requests.gs

A modular library that makes external requests with `UrlFetchApp` a cinch.

## Requests.gs Quickstart

Get request to a url:

```js
var Requests = Import.Requests();
var content = Requests.get(url).text();
```

Get requests to the same url endpoint, that returns jsons:

```js
var EndpointRequests = Import.Requests({
  baseUrl:'http://example.com/{uri}'
});
var response = EndpointRequests.get({
  uri: 'some/article/endpoint'
}).json();
```

Call out to an API service with a `post` request, where the body needs a title passed to it:

```js
var response = EndpointRequests.post({
  uri: 'new/article/endpoint',
  body: {
    title: 'A new article'
  },
}).json();
```

Save the post request for repeated use:

```js
var postRequest = destination.post({
  endpoint: 'new/article/endpoint',
}, null, false);

var response1 = postRequest({
  body: {
    title: 'Another new article'
  }
}).fetch().json();
var response2 = postRequest({
  body: {
    title: "Yet another new article"
  }
}).fetch().json();
```

Put common headers required for each call, once:

```js
var EndpointWithAuth = Import.Requests({
  baseUrl:'http://example.com/{endpoint}',
  headers: {
    auth_token: 'secret'
  }
});
// all subsequent use of destination EndpointWithAuth has authentication token 
// in the header (although you can override)
```

For debugging, inspect the parameters of the call (that gets sent onto `UrlFetchAll.fetch`):

```js
var postRequest = destination.post({
  endpoint: 'new/article/endpoint',
}, null, false);
postRequest.params();  // returns object
```

## Requests.gs with Discovery Api

Other frameworks use the discovery api to interact with other APIs, why not Apps Scripting?

```js
var createFile = Import.Requests({
  config: {
    discovery: {
      name: 'drive',
      version: 'v3',
      category: 'files',
      method: 'create'
    },
    oauth: 'me'
  }
});
createFile.post({
  body: {
    name: "New File"
  }
});
```

Use the [Discovery API explorer](https://developers.google.com/apis-explorer/#p/discovery/v1/discovery.apis.getRest) and/or the reference documentation to figure out how to interact with specific endpoints.

## Concurrent Processing with Requests.gs

`UrlFetchApp` also has `.fetchAll`, and combined with using the app script endpoint, we have concurrency. Call your own functions as a child script.

```js
function calledFunction (str) {
  return str;
}

function entryPoint () {
  var hi = Import.Requests.runner('calledFunction', 'hi');
  hi;  // 'hi'
}
```

Make multiple calls!

```js
var response = Import.Requests.concurrently(function (c) {
  c.add('calledFunction', 'hello');
  c.add('calledFunction', 'world');
});

response;  // ["hello", "world"]
```

Note that at the present time concurrent calls have a time limit of about one minute.
