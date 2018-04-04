# Requests.gs

A modular library for Google Apps Scripting that makes external requests a cinch.

## Requests.gs Quickstart

Make http requests:

```js
var requestsLibrary = Import.Requests();
var response = requestsLibrary
		       .get(url);        // ... or...
		//     .get(url, {query: {q:''});
		//     .post(url, {body: {param: 'param'}});
		//     .put(url);
		//     .delete_(url);
		//     .head(url);
		//     .options(url);
```

The `response` object has `.text` and `.json` available to retrieve the actual content. Additionally, there are some configuration options in the `Import.Requests` constructor: 

- Template the url for expansion (less typing):

```js
var exampleDotCom, response;
exampleDotCom = Import.Requests({
  config: {
    baseUrl:'http://example.com/{uri}'  // define the template
  }
});
response = exampleDotCom.get({
  uri: 'some/article/endpoint'        // expands
});
response.json();
```

- Call out to an API service with a `post` request, where the body needs a title passed to it:

```js
var json = exampleDotCom.post({
  uri: 'new/article/endpoint',
  body: {
    title: 'A new article'
  },
}).json();
```

- Save the post request for repeated use, by passing `false` in the last parameter in the `.post` method. The returned object has the method `.fetch` is available when you're ready to actually call out to the internet.

```js
var postRequest = exampleDotCom.post({
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

- Put common headers required for each call, once:

```js
var endpointWithAuth = Import.Requests({
  baseUrl:'http://example.com/{endpoint}',
  headers: {
    auth_token: 'secret'
  }
});
// all subsequent use of endpointWithAuth has authentication token 
// in the header

var allArticles = endpointWithAuth.post({endpoint: 'articles'}).get().json();
```

- For debugging, inspect the parameters of the call (that would get sent to `UrlFetchAll.fetch`):

```js
var postRequest = destination.post({
  endpoint: 'new/article/endpoint',
}, null, false);
postRequest.params();  // returns object that would be passed to UrlFetchApp.fetch
```

## Batch operations

Instead of making one request at a time, you can leverage `.batch` to make asyncronous calls. The idea is to create an array of items that instructs Requests how to compile a list of HttpRequests which is just passed to `UrlFetchApp.fetchAll` under the hood. Each item is an object, where the properties are used in the url template:

```js
var urlTemplate = 'http://example.com/{category}/{articleId}';
var articleGetter = Import.Requests();
var articleIds = ['123', '234', '456'];
var items = articleIds.reduce(function (acc, num, index) {
  acc.push({
  	articleId: num,
  	category: 'articles',
  });
  return acc;	
});
var responses = articleGetter.batch(urlTemplate, items);
responses.zip('articles');  // array of articles returned
```

If there are specific options to the particular request, then just add an `options` property to the item.

## Interacting with Google APIs

Let's make our own objects to interact with Google Apis we need. We're going to create a thing that can create and delete files from the drive. By using the discovery api, we can "discover" the url needed for a particular endpoint. However, the urls are often (usually) templated, with something like `blahblah.com/files/{fileId}`, but some not. For example, creating a file in the drive is just `files` but deleting it is `files/{fileId}`.

A script that creates a file and promptly deletes it is demonstrated below. Note that the `base` and `attr` options of Import.gs are used, as well as our `config.method`:

```js
  var DriveApi = {}, result;
  Import.Requests({
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
  Import.Requests({
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

Use the [Discovery API explorer](https://developers.google.com/apis-explorer/#p/discovery/v1/discovery.apis.getRest) and/or the reference documentation to figure out how to interact with specific endpoints. Note that use of the discovery endpoint means an additional network roundtrip in your script.

## Concurrent Processing with Apps Scripts API + Requests.gs

Call your own functions as a child script. Demonstrated below is "InDevMode" so that you don't have to publish as API executable just to test.

```js
function calledFunction (str) {
  return str;
}

function entryPoint () {
  var hi = Import.Requests.callMyFunctionInDevMode('calledFunction', 'hi');
  hi;  // 'hi'
}
```

Make multiple calls!

```js
var response = Import.Requests.concurrentlyInDevMode(function (c) {
  c.add('calledFunction', 'hello');
  c.add('calledFunction', 'world');
});

response;  // ["hello", "world"]
```

Note that at the present time concurrent calls have a time limit of about one minute. Also note that the author believes the response is always in the expected order (and never "world, hello"), because Google returns the responses in order of the original requests passed to it.

