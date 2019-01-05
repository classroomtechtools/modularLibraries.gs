## CustomErrors.gs

Create and use custom-made errors in your application. Without much code.

## Quickstart

Copy [this library's code](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/CustomErrors/CustomErrors.gs). Use it:

```js
function myFunction () {
  var customError = Import.CustomErrors.create('Custom Error');
  throw customError("Something went wrong!");
}
```

Editor shows red band with `"Custom Error: Something went wrong!"`

Add callback to automatically log errors, with stacktrace.

```js
function runFirst () {
  myFunction();
}
function myFunction () {
  var customError = Import.CustomErrors.create('Custom Error',
    function () {
      console.log(this.error);  // includes stacktrace, properties below
    }
  );
  throw customError("Something went wrong!");
}
```

Stackdriver logger shows the this.error object, which is just this:
{trace=[{file=test, func=myFunction, line=11}, {file=test, func=runFirst, line=3}], file=test, line=11, message=Something went wrong!}
```js
{ 
  message: "Something went wrong!",
  file: "Code",
  line: 11,
  trace: [{  // stacktrace
    file: "Code",
    func: "myFunction",
    line: 10
  }, {
    file: "Code",
    func: "runFirst",
    line: 2
   }]
}
```

Make all the 

## Motivation

Custom error objects are pretty useful design pattern, but making them in an app scripts stack is a bit of a pain. First of all, it's about 10 lines of boilerplate code, and if you want it to be stack-aware, you'll need a utility function on top of that. There are also some nit-picky stuff to watch out for; with this library you can throw custom errors with or without the `new` keyword.

In addition, other stacks such as Node.js use them liberally, as they provide better ways to reason about code. Consider this sort of thing:

```js
try {
  doSomething();
} catch (err) {
  switch (err.name) {
    case 'Bad Credentials': break;
    case 'No Credentials': break;
  }
}
```

That way, your `doSomething` function can throw two kinds of errors and you can handle them differently depending on what kind of error it is. 

Automatically having all your errors logged to stack driver allows developers see how the app is performing in the real world.

And all that with a clean stacktrace! (The library removes any of its own stack in its execution.)

## Discussion

In progress.



