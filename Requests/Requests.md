# Requests.gs

A modular library for Google Apps Scripting that wraps `UrlFetchApp.fetch`. Other than using it for external requests, it can also be deployed to interact with Google APIs through the discovery service, as well as other json-based APIs. You can even use it to implement concurrent processing as it also wraps `UrlFetchApp.fetchAll`.

## Quickstart

Grab the [code](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Requests/Requests.gs), put into your project, and then make http requests:

```js
var RequestsLib, libInstance, http, response;
RequestsLib = Import.Requests;
http = RequestsLib();
response = http
               .get(url);        // ... or...
        //     .get(url, {query: {q:''});
        //     .post(url, {body: {param: 'param'}});
        //     .put(url);
        //     .delete_(url);
        //     .head(url);
        //     .options(url);
```

A `response` object is returned, which has `json` and `text` methods to retrieve the content.

## Individual Requests

A library instance contains methods for each of the http requests: `get`, `post`, `put`, `delete_`, `head` and `options` methods which has a `url` parameter (`String`) with optional `options` second parameter (`Object`). They return a `response` object — unless you override that behaviour by specifying a `method` property in the options object, in which case it returns the http method itself.

The `options` parameter can have `headers`, `body`, and `query` properties. All of these are standard usage for http requests. Their values are all assumed to be objects. If you need a query that repeats itself, pass an array to the value of query key instead of a string.

### Templated Urls

An alternative pattern is available for where instead of the `url` parameter of the http requests being a string, it is an object whose properties are expanded based on the `baseUrl` passed as a `config` to the library reference:

Example with a get request:

```js
var exampleDotCom, response;
exampleDotCom = Import.Requests({
  config: {
    baseUrl: 'http://example.com/{uri}'  // define the template
  }
});
response = exampleDotCom.get({
  uri: 'some/article/endpoint'        // expands
});
response.json();
```

Example with a post request:

```js
var json = exampleDotCom.post({
  uri: 'new/article/endpoint',
  body: {
    title: 'A new article'
  },
}).json();
```

### Manually fetch

If you want to define an http method that does not actually reach out to the internet until you manually fetch it yourself, pass `false` in the third parameter (and pass `null` to the second if not utilizing options). Instead of returning a `response` object it returns a `request` object with a `fetch` method that can be invoked at a later time (with no parameters, that then returns the `response` object).

Example with a post request:

```js
var postRequest, response1, response2;
postRequest = exampleDotCom.post({
  endpoint: 'new/article/endpoint',
}, null, false);  // pass null as the second parameter if not utilized

var response1 = postRequest({
  body: {
    title: 'Another new article'
  }
});
var response2 = postRequest({
  body: {
    title: "Yet another new article"
  }
});
response1.fetch().json();
response2.fetch().json();
```

### Create an invokable method

Similar to the above, you can alternatively specify a `method` property in the `config` object at library invocation time. Requests interprets this to mean that instead of a `response` you are expecting a reference to the http method itself:

```js
var RequestsLib, post, response;
RequestsLib = Import.Requests;
post = RequestsLib({
  config: {
    method: 'post'
  }
});

response = post(url, {
  headers: {
    Authentication: 'oauthToken'
  }
});
response.json();
```

### Manually fetching vs. creating invokable method

While their usage cases are similiar in that we are delaying when the software actually reaches out to the internet, they are actually implemented at different layers and thus have one key side effect. 

Notice that with manually fetching, you don't pass a `url` parameter when invoking the request, since it's already been defined. Whereas when you invoke the created method, you are expected to pass a `url` parameter, and is subject to expansion if `baseUrl` is defined and `url` is an object.

### Debugging methods

For debugging, inspect the parameters of the call (that would get sent to `UrlFetchAll.fetch`):

```js
var postRequest = destination.post({
  endpoint: 'new/article/endpoint',
}, null, false);
postRequest.params();  // returns object that would be passed to UrlFetchApp.fetch
postRequest.params(true);  // same as above, including the url
```

## Batch operations

Instead of using one of the http methods one at a time, you can leverage `.batch` to make asyncronous calls. 

The idea is to create an array of `items` which you pass to `batch` which uses it to compile a list of requests as required by `UrlFetchApp.fetchAll`. Each item is an object, where the top-level properties are used to expand the template defined in `urlTemplate`:

```js
var RequestsLib, articleGetter, urlTemplate, articleIds, oauthToken, items, responses;
RequestsLib = Import.Requests;
articleUpdater = RequestsLib();
urlTemplate = 'http://{domain}/{category}/{articleId}';
articleIds = ['123', '234', '456'];
oathToken = 'abc';

// build items that according to this api is needed to make articles
items = articleIds.reduce(function (acc, id) {
  acc.push({
    domain: 'example.com',
    articleId: id,
    category: 'articles',
    options: {
      method: 'post',  // 'get' is default
      body: {
        text: 'updated contents to be this text',
      },
      headers: {
        'Authentication': oauthToken
      }
    }
  });
  return acc;	
});
responses = articleUpdater.batch(urlTemplate, items);
```

If there are specific options to the particular request, such as a header, body, or query, then just add an `options` property to the item. Be sure to indicate what kind of http request this is by specifying the `method` property.


## Interacting with Google APIs

Let's make our own javascript object to interact with Google Apis we need. We're going to create a namespace that can create and delete files from the drive. By using the discovery api, we can "discover" the url needed for a particular endpoint. However, the urls are often (usually) templated, with something like `blahblah.com/files/{fileId}`, but some not. For example, creating a file in the drive is just `files` but deleting it is `files/{fileId}`.

A script that creates a file and promptly deletes it is demonstrated below. Note that the `base` and `attr` options of Import.gs are used, as well as our `config.method`, which allows us to create invokable methods:

```js
  var RequestsLib = Import.Requests;
  var DriveApi = {}, result;
  RequestsLib({
    base: DriveApi,
    attr: 'createFile',
    config: {
      discovery: {
        name: 'drive',
        version: 'v3',
        resource: 'files',
        method: 'create'
      },
      oauth: 'me',
      method: 'post'
    }
  });
  RequestsLib({
    base: DriveApi,
    attr: 'deleteFile',
    config: {
      discovery: {
        name: 'drive',
        version: 'v3',
        resource: 'files',
        method: 'delete'
      },
      method: 'delete_',
      oauth: 'me'
    }
  });
  result = DriveApi.createFile({/* empty as no template is used for this url endpoint */ }, {
    body: {
      name: "New File"
    }
  }).json();
  DriveApi.deleteFile({fileId: result.id});
```

Use the [Discovery API explorer](https://developers.google.com/apis-explorer/#p/discovery/v1/discovery.apis.getRest) and/or the reference documentation to figure out how to interact with specific endpoints. There is only one call out to the discovery api for each endpoint request per run, and is thereafter cached — in that way the above code will only have three http requests instead of four.

## Concurrent Processing with Apps Scripts API + Requests.gs

Call your own functions as a child script. Demonstrated below is "InDevMode" so that you don't have to publish as API executable just to test.

```js
function calledFunction (str) {
  return str;
}

function entryPoint () {
  var RequestsLib = Import.Requests;
  var hi = RequestsLib.callMyFunctionInDevMode('calledFunction', 'hi');
  hi;  // 'hi'
}
```

Make multiple calls. Note that this requires ContextManager.gs library.

```js
var response = RequestsLib.concurrentlyInDevMode(function (c) {
  c.add('calledFunction', 'hello');
  c.add('calledFunction', 'world');
});

response;  // ["hello", "world"]
```

When you have written the functions and are ready for production, simply publish as API executable, and change `concurrentlyInDevMode` method to `concurrently`.

Note that at the present time concurrent calls have a time limit of about one minute. Also note that the response is always in the expected order (and never "world, hello"), because Google returns the responses in order of the original requests passed to it.

