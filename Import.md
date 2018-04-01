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


