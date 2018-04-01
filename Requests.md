# Requests.gs

A modular library that makes external requests with `UrlFetchApp` a cinch.

## Requests.gs Quickstart

```js
var Requests = Import("Requests");
```

This gives you an invokable library. Safest way to get started.

## Requests.gs Overview

```js
var destination = Requests({
	baseUrl:'http://example.com/{endpoint}'
});
```

Call out to some website with a `get` request:

```js
var content = destination.get({
	endpoint: 'some/article/endpoint'
}).text();
```

Call out to an API service with a `post` request:

```js
var content = destination.post({
	endpoint: 'new/article/endpoint',
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

var content = postRequest({
	body: {
		title: 'Another new article'
	}
}).fetch().json();
```

Put common headers required for each call, once:

```js
var Requests = Import("Requests");
var destination = Requests({
	baseUrl:'http://example.com/{endpoint}',
	headers: {
		auth_token: 'secret'
	}
});
// all subsequent use of destination variable has authentication token 
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
var createFile = Requests({
    discovery: {
      name: 'drive',
      version: 'v3',
      category: 'files',
      method: 'create'
    },
	oauth: 'me'
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
	var Requests = Import("Requests");
	Requests.runner('calledFunction', 'hi');
}
```

Make multiple calls!

```js
var request1 = Requests.runner('calledFunction', 'hello', null, false);
var request2 = Requests.runner('calledFunction', 'world', null, false);
var responses = Requests.fetchAll([request1, request2]);
```
