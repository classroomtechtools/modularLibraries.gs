# ContextManager.gs

Create a block of code in apps scripts that is guaranteed to do something before its execution, and after its execution — even if an error occurred. Optionally handle or swallow errors, and pass parameters onto each stage.

(Inspired by Python's `with` statement.)

## ContextManager.gs Quickstart

Copy and paste the [code](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/ContextManager/ContextManager.gs), and create a context manager that can be used as a block of code.

```js
var withOpenFile = Import.ContextManager();

withSomeOperation(function () {
  Logger.log('inside body');
  throw Error("Haha something bad happened");	
}, {
  enter: function () {
    Logger.log('entered, doing some preparation!');
  },
  exit: function () {
    Logger.log('exiting, doing cleanup, even if an error occurred');
  },
  onError: function () {
    Logger.log('There was an error');
  }
});
```

Error is thrown, with the following output:

```
entered, doing some preparation!
dinside body
There was an error
exiting, doing cleanup, even if an error occurred
```

You can build an objects at each stage:

```js
var initialArray = ['params'];
var withSomeOperation = Import.ContextManager();
  
var [result, _] = withSomeOperation(function (arr) {
  arr.push('body');
  }, {
    enter: function (arr) {
    arr.push('enter');
  },
  exit: function (arr) {
    arr.push('exit');
  },
  onError: function (arr) {
    arr.push('onError');
  },
  params: function () {
    return [ initialArray ];
  }
});  
  
Logger.log(result);
```

Output:

```
[params, enter, body, exit]
```

Or at each stage objects can be returned, which are passed onto the next stage. Note that because `Function.prototype.apply` is being utilized, you are expected to return an array. This has the consequence of having to unpack the final result as an array as well, but in that case a deconstructing assignment is your friend.

```js
var withSomeOperation = Import.ContextManager();
  
var [result, _] = withSomeOperation(function (hash) {
  return [ {hash: hash} ];
}, {
  enter: function (arr) {
  return [ {array: arr} ];
},
  exit: function (hash) {
    return [ JSON.stringify(hash) ];
  },
  params: function () {
    return [ ['params'] ];
  }
});  
  
Logger.log(result);  // deconstructed above
```

Output: 

```
 {hash={array=[params]}}
```


## Decorator Pattern

ContextManager.gs can also be used to implement the decorator pattern. Instead of passing a function body as the first parameter, just define the `enter` and `exit` methods (as appropriate), and then call the resulting "factory" with a function which will become the body.

```js
var hashLogDecorator = Import.ContextManager()({  // no body
  exit: function (obj) {
    Logger.log(obj)
  },
  params: function () {
    return [ {} ];
  }
});

hashLogDecorator(function (obj) {  // this is the body
  obj.hey = 'hey';
  obj.yo = 'yo';
});
```

Output:

```
{yo=yo, hey=hey}
```

