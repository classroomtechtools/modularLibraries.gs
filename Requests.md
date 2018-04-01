# modularLibraries.gs
A collection of importable, modular libraries for any gas project. An extension of Package Manager.

# Import.gs

Code is [here](https://gist.github.com/brainysmurf/a5a6fc244a3d913c9fbbab55fc396fd2#file-import-gs): You can copy and paste this into your project, but please note the "file" created must be prior to any other library you copy and paste as well.

## Import.gs Quickstart

Give your project an invokable global `Import` that brings in other modular libraries for use. It can either add the library to the global namespace, or it can just return the constructor:

```js
var lib = Import("NameOfLibrary");
lib();  // inits the library
lib({config:'something'});  // init the library with a configuration object

// init the library with configuration, and place it into the "app" global accesssible through the "lib" property
Import("NameOfLibrary", {namespace: "app.lib"}, {config: 'something'});
app.lib.doSomething();

// init the library with configuration, and place it into an already created object
var obj = {};
Import("NameOfLibrary", {base: obj, attr: 'lib'}, {config: 'something'});
obj.doSomething();
```

These libraries are assumed to be written according to the modular library specifications.

## Modular Library "Specification"

1. Library should be self-contained, and any dependencies are explicitly introduced.
3. Library code can be imported into the functional scope easily, and is the "normal" behaviour
2. Library code can be accessible via the global scope via expressed means
1. It's okay to pollute the global namespace with just one thing, `Import` because what are you going to do, this is javascript.
1. End-user developer can interact with libraries in two ways: either at the object-level (before invocation) or at the instance-level (after invocation). The latter is an object that has methods to implement its features. The former has methods that represent helper functions that assist the implementation.
1. The above number (3) is convoluted and can be ignored if you don't understand it. It basically is only really relevant to library authors.



# Requests.gs

A modular library that makes external requests with `UrlFetchApp` a cinch. Code is [here](https://gist.github.com/brainysmurf/1e086df246ad65d36e0b7c0fef11fc5f).

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
