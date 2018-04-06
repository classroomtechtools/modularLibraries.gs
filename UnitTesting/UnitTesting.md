# UnitTesting.gs

Make unit testing of modular library in apps scripts a cinch.

## UnitTesting.gs Quickstart

Copy and paste the code, and initialize it so that it is live.

```js
Import.UnitTestings.init();  // can be safely executed multiple times during execution



```

The output (minus log info):

```
<{"verb":"Hello","noun":"World"}> (Object)
<{
    "verb": "Hello",
    "noun": "World"
}> (Object)
<[
    "hello",
    "world"
]> (Array)
```

A more versatile method is also available, `__log__` that allows you to combine objects, and even reference properties:

```js
"{0.print}\n{1.print}".__log__(obj);
"{0.typeof_} of length {0.length}".__log__(arr);
```

Output: 

```
<{"verb":"Hello","noun":"World"}> (Object)
<["hello","world"]> (Array)
Array of length 2
```

Under the hood all this is implemented with `String.prototype.format`, which works like so:

```js
"{hello}, {world}".__format__({hello:'hello', world:'world'});
```


## Motivation

There is a certain premium on being able to log output and reason about one's own code. Stackdriver logging is a massive improvement for the stack in so many ways, but for this individual sitting behind the keyboard there is nothing like having fast ways to do two things:

1. Template strings
2. Output templated strings and objects to an instant log

It is intended that this library may well be removed from the final product, or even well before that; this is why all the methods have double underlines: It makes them easy to find for removal.

