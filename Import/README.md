# Import.gs

Import.gs is a Google Apps Script solution to writing and using modular libraries so that apps can better manage code reuse.

## Quickstart

To use Import.gs to write a new library, copy Sample Library below into a new file, and start writing.

To use a modular library, copy the code of the library into your project, and then use `Import.NameOfLibrary()` which returns a library instance.


## Building an Importable, Modular Library

To understand how this all works, we'll step you through how a library with Import.gs is built.

In this section, each code snippet should be thought of as a portion of a combined file in a project, which overall represents the library file. Note that each snippet is not a standalone full statement of JavaScript, as it only makes sense as compilable source code when joined together.

A library can only have one file to its name, and has javascript boilerplate **packaging code**, normally in a minified version, which follows here:

```js
(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(var i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,
```

While the unminified version can be found below, for introductory purposes all we need to know is that it places `Import` into the global namespace if not already present, and enables mechanisms for its features.

The next bit declares the name of the library, which declares how it is to be referenced in another file by `Import.NameOfLibrary`:

```js
"NameOfLibrary",
```

Next is the package code, which is just a function whose body is run upon initialization. After building up its implementation details, it should return something that the end user developer interacts with. It takes one parameter, `config` which the end user populate with properties.

```js
function Package_ (config) {
  this;  // library reference
  var self = this;  // keep self so that we can use self inside method body (if needed)
  var ret =  {
    /* object that has a bunch of methods */
    timesTen: function (a) {
      // code code
      return self.multiply(a, 10)
    },
  };
  ret.utils = self.utils;  // graft on the public functions
  return ret;
},
```

Next, declare the helpers object, which are stand-alone functions that do not access or use implementation package code. If you wish you can make a property of this — or the entire object — publicly available to the end user, which is shown later.

In a helper function, the `this` variable represents the helper object itself, so you can build upon its own methods.

```js
{ /* helpers */
  multiply: function(a, b) {
    return a * b;
  },
  utils: {
    double: function (a) {
      return this.multiply(a, 2);
    },
  },
},
```

Finally, the creators object, which is just a convenience function to build a library instance. The `this` is a library reference, allowing you to invoke it to return a library instance:

```js
{ /* creators */
  fromId: function (id) {
    return this({
      config: {
        spreadsheetId: id,
      }
    });
  }
}
```

Both the helpers and creators are entirely optional and can be left as just regular, empty `{}` objects.

## Using Import

The global `Import` object is provided to the project, which you get when either you use one of the modularLibrary.gs libraries by copying it into your project, or write a new library using the boilerplate code. This object allows you to do two things:

* Interface with the library in your code in a modular way, whose manner of use are defined by how the library itself is written
* Build namespaced objects that organizes all your libraries

Suppose you use the `Requests.gs` and the `Sheets.gs` libraries, and you'd like a namespace object `Libraries` to hold pre-initialized instances throughout your project. The respective libraries have different configuration options, which is also presented here:

```js
Import.Requests({
  namespace: 'Libraries.Requests',
  config: {
    oauth: 'me',  // authenticates with value of ScriptApp.getOauthId
  },
});
Import.Sheets({
  namespace: 'Libraries.Sheet',
  config: {
    spreadsheetId: 'ID'  // able to read and write to this sheet
  }
});
```

You can then access these instances via the `Libraries` global. Perhaps better practice would be to not pollute the global namespace:

```js
var Libraries = {};  // local variable instead passed to base/attr below
Import.Requests({
  base: Libraries,
  attr: 'Requests',
  config: {
    oauth: 'me',
  },
});
Import.Sheets({
  base: Libraries,
  attr: 'Sheets',
  config: {
    spreadsheetId: 'ID'
  }
});
```

You could also use it in a more conventional way:

```js
var requests = Import.Requests({
  config: {
    oauth: 'me',
  }
});
var sheets = Import.Sheets({
  config: {
    spreadsheetId: 'ID'
  }
});
```

## Narrative Documentation

An important facet of `Import.gs` is to fully understand how to write, initialize, and interact with the written libraries. We can understand it by declaring certain vocabulary and describing each of them.

### Using a Library

First, how do understand how we interact with a modular library?

##### Library Reference

A library can be used by receiving a library reference, like this:

```js
var libraryReference = Import.NameOfLibrary;
```

A **libraryReference** object is returned by an un-invoked `Import.NameOfLibrary` expression. They in turn need to be invoked in order to actually run any library-side code (the code inside `Package_` which we call the **package code**) to "initialize" it.

##### Library Instance

Invoking a library reference will then return a **library instance** which is whatever the library returns in the package code (an object, function, as determined by the package code). You can capture the library instance through an assignment statement, or you can forgo an assignment statement and instead instruct `Import` to store a library instance either in the global namespace or onto a local variable.

Invoking a library reference is done by passing a single object as the only parameter, which optionally can have the `namespace` property which places the library instance onto named global namespace, or `base`/`attr` combo in order to build it onto an existing variable.

```js
// add to global namespace
Import.NameOfLibrary({
  namespace: 'Path.to.instance'
});
Path.to.instance.methodDefinedInLibrary();

// build on to of local variable
var Base = {};
Import.NameOfLibrary({
  base: Base,
  attr: 'instance'
});
Base.instance.methodDefinedInLibrary();
```

##### Configuration Options

Additionally, when invoking a library reference, you have the chance to pass **configuration options** to the library by using the optional `config` property:

```js
Import.NameOfLibrary({
  namespace: 'Library',
  config: {
    prop: 'value'
  }
});
```

This config object is passed as the config parameter in the package code. Libraries will have different configuration options, depending on what it does.

##### Creator methods

Alternatively, instead of invoking the library reference, libraries can be written to have **creator methods** or **creators** grafted onto the library reference, which are then invoked, with optional parameters, to return a library instance:

```js
var Library = Import.NameOfLibrary;
var instance = Library.fromId(12345);
```

This pattern is useful for exposing convenience methods that under the hood invokes the long-form `config`. This way you can set up a quickstart functions but also leave advanced options available to the developer.

Although creators act very similiar to a constructor, there is not necessary a `new` called with a function method (although there might be, depending on what the package code returns!), so the term "creator" is used instead to avoid confusion. 


##### Utility methods

Lastly, in the package code the library developer can define functions that interact with javascript primitives and are used in the implementation details of the library, but are also exposed for the end-user developer. These are known as **helper methods** or **utility methods**, and the way to build them is quite simple.

For example, if you are writing a library that interacts with a Google spreadsheet, you might have a transpose method defined on it which just works on a javascript array in a useful way, which the library itself uses throughout its own implementation of various features but does not interact with the library internals. By exposing it as a helper function, the end-user developer does not have to define it themselves. 

By convention, these are defined as a `utils` property on a library instance, and must be exposed in the package code in the following manner:

```js
// in the helpers object

{
  privateMethod: function () { return null; },
  
  utils: {
    publicMethod: function () { return null; },
  }
}

// in the package code:

function Package_ (config) {
  var self = this;
  var returnObject = {};
  returnObject.utils = self.utils;
  return returnObject;
}
```




## Sample library

This is the boilerplate code used in writing libraries, and lets you use `Import.NameOfLibrary` elsewhere. The first line is the magic, explained later:

```js
(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"NameOfLibrary",

function Package_ (config) {
  this;  // reference to itself
  return  {
    /* object that has a bunch of methods */
    doSomething: function () {},
  };
},

{ /* helpers */ },

{ /* creators */ }

);
```

Then, in another file:

```js
function myFunction () {
  // let's import and save it as a variable
  var lib = Import.NameOfLibrary();
  lib.doSomething();  // lib is the returned object
  
  // init the library with configuration, and place it into the "app" global accesssible through the "lib" property
  Import.NameOfLibrary({namespace: "app.lib"});
  app.lib.doSomething();
  
  // init the library with configuration, and place it into an already created object
  var obj = {};
  Import.NameOfLibrary({base: obj, attr: 'lib');
  obj.lib.doSomething();
   
   // Yes you can pollute the global namespace to your heart's content (but not recommended):
   Import.NameOfLibrary({base: 'global', attr: 'Lib'});
   Lib.doSomething();
}
```

## Import API

```js
// Import locally to a variable:
var Lib = Import.NameOfLibrary;
var libInstance = Lib();
libInstance.doSomething();

// Import onto an existing object
var app = {};
Import.NameOfLibrary({
	base: app,
	attr: 'library'
});
app.library.doSomething();

// Import into global namespace
Import.NameOfLibrary({
	namespace: 'App.library'
});
App.library.doSomething();

// Import into a global namespace (synonymous with above)
Import.NameOfLibrary({
	base: 'global',
	attr: 'Library'
});
Library.doSomething();

// Pass configuration (values dependent on library)
Import.NameOfLibrary({
	namespace: 'App.library',
	config: {
		lang: 'chi'
	}
});
App.library.doSomething();
```

## Example Hello World Library

This nonsense library illustrates the some of the features.

```js
(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"HelloWorld",

function PackageCode_ (config) {
  var self = this;  // save for below
  
  return function () {
    return { 
      greetings: function () {
        Logger.log( this.hello() + self.delimiter() + this.person());    // this
      },
      hello: function () {
        switch (config.lang) {
          case 'chi':
            return 'Nihao';
          default:
            return 'Hello';
        }
      },
      person: function () {
        switch (config.lang) {
          case 'chi':
            return 'shijie';
          default:
            return 'World';
        }
      }
    };
  }();  // self-invoking so dev can skip a step
  
},

{
  delimiter: function () { return ', ' },
},

{
  chinese: function () {
    return this({config: {lang:'chi'}});  // "this" is reference to package
  }
}

);
```

Usage of the library, then:

```js
function myFunction () {
  var HelloWorld = Import.HelloWorld;
  
  var eng = HelloWorld();
  var chi = HelloWorld({config: {lang: 'chi'}});
  eng.greetings();
  chi.greetings();
  chi = HelloWorld.chinese();  // same as line 2
  chi.greetings();
}
```

## Packaging Code

The first line of the library is compressed for sanity, but if you wish to understand how it works, behold:

```js
(function (global, name, Package, helpers, creators) {
  name = name.replace(/ /g,"_");
  
  // ref function with added helper properties so it's available from within the package
  var ref = function wrapper (args) {
    var wrapped = function () { return Package.apply(Import._import(name), arguments); };
    for (var i in args) { wrapped[i] = args[i]; };
    return wrapped;
  }(helpers);
  
  global.Import = global.Import || {};
  Import.register = Import.register || function (uniqueId, func) {
    Import.__Packages = Import.__Packages || {};
    Import.__Packages[uniqueId] = func;
  };
  Import._import = Import._import || function (uniqueId) {
    var ret = Import.__Packages[uniqueId];
    if (typeof ret === 'undefined') throw Error("Import error! No library called " + uniqueId);
    return ret;
  };
  Import[name] = function wrapper (args) {
    var wrapped = function (options) {
      options = options || {};
      options.namespace = options.namespace || false;
      options.base = options.base || false;
      options.config = options.config || {};
      options.params = options.params || [];
      
      var makeIt = function () {
        var params, ret;
        params = options.config ? [options.config] : options.params;
        ret = ref.apply(null, params);
        
        // add helper properties so it's available on the library instance:
        for (var h in helpers) 
          ret[h] = helpers[h];
        return ret;
      }.bind(this);
      
      var ret;
      if (options.namespace) {
        var p = global, g = global, last;
        options.namespace.split('.').forEach(function (ns) {
          g[ns] = g[ns] || {};
          p = g;
          g = g[ns];
          last = ns;
        });
        ret = p[last] = makeIt();
      } else if (options.base) {
        if (options.base === 'global') { options.base = global; }
        options.attr = options.attr || name;
        ret = options.base[options.attr] = makeIt();
      } else {
        ret = makeIt();
      }
      return ret;
    }
    
    // populate the library reference with creators:
    for (var c in creators)
      wrapped[c] = creators[c];
    return wrapped;
  }(creators);
  Import.register(name, ref);
})(this, 
   
"name",
   
function Package_(config) {
  var self = this;
  return {};
}, 

{ /* helpers */ },

{ /* creators */ }
  
);
```

### Minified Packaging Code

```js
(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(var i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,Package,Helpers,Creators);
```
