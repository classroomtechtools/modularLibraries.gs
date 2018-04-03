# modularLibraries.gs

This repo consists of:

- Import.gs (below) which adds `Import` global object to the project
- Sample libraries and documentation for writing libraries that can be imported via the `Import.NameOfLibrary()`
- Useful, real libraries (with documentation) for use in any apps scripting project

## Quickstart

The libraries can be found in the repo — all that is needed is copying and pasting into your project, and access them via `Import.NameOfLibrary()`. Check the documentation for that library for usage examples.

# Import.gs

Import.gs is boilerplate code that is to be placed at the top of a file in which a library is defined.

## Import.gs Quickstart

This is the boilerplate code used in writing libraries, and lets you use `Import.NameOfLibrary()` elsewhere. The first line is the magic, explained later:

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
var lib = Import.NameOfLibrary();
lib.doSomething();

// Import onto an object
var app = {};
Import.NameOfLibrary({
	base: app,
	attr: 'library'
});

// Import into global namespace
Import.NameOfLibrary({
	namespace: 'App.library'
});
App.library.doSomething();

// Import into a global variable
Import.NameOfLibrary({
	base: 'global',
	attr: 'Library'
});
Library.doSomething();

// Pass configuration (values dependent on library)
Import.NameOfLibrary({
	namespace: 'App.library',
	config: {
		lang: 'en'
	}
});
App.library.doSomething();
```

## Writing a Library

Using the boilerplate framework, you can write very simple or complex libraries for use throughout your project, accessed via `Import`.

The returned object from the `Package_` method is what is returned to the user via `Import.NameOfLibrary()`. This can be a regular javascript object or a function constructor, or whatever. The returned object is the primary means of exposing functionality.

More sophisticated libraries may wish to define methods such as `Import.NameOfLibrary.new_`, which presents a way for common configuration options to be accessible in one call. Inside this "creator" method, you may return an object from `this()`, which is identical to the end user using `Import.NameOfLibrary()`.

Independent "helper" methods can also be written inside the library that are independent of the returned object  and can be used throughout the library code itself (but is not accessible outside). Inside a helper method, `this` is a reference to 

## Example Hello World Library

This nonsense library illustrates the some of the features, which are explained below:

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
  var eng = Import.HelloWorld();
  var chi = Import.HelloWorld({config: {lang: 'chi'}});
  eng.greetings();
  chi.greetings();
  chi = Import.HelloWorld.chinese();  // same as line 2
  chi.greetings();
}
```

Several patterns/features of note:

1. Library code in defined all in one file, and in other files the `Import` object is available anywhere after an endpoint function is invoked (a `myFunction` called manually or via trigger).
2. The `Import` object itself has a property for each library. You access these libraries via this property, throughout your application.
1. The library consists of whatever you return from inside Package_ and the helper functions.
2. The first parameter is by convention the `config` object — the idea is that you can pass in an object of key values to represent various settings or options.
3. The only globally created in this code is `Import`.

## Packaging Code

The first line of the library is compressed for sanity, but if you wish to understand how it works, behold:

```js
(function (global, name, Package, helpers, creators) {
  name = name.replace(/ /g,"_");
  var ref = function wrapper (args) {
    var wrapped = function () { return Package.apply(Import._import(name), arguments); };
    for (i in args) { wrapped[i] = args[i]; };
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
    var wrapped = function (options) {    // TODO: replace spaces with underscores (camelcase?)
      options = options || {};
      options.namespace = options.namespace || false;
      options.base = options.base || false;
      options.config = options.config || {};
      options.params = options.params || [];
      
      var makeIt = function () {
        var params, ret;
        params = options.config ? [options.config] : options.params;
        return ref.apply(null, params);
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
    for (var c in creators) { wrapped[c] = creators[c]; }
    return wrapped;
  }(creators);
  Import.register(name, ref);
})(this, Package, Helpers, Creators);
```

### Compressed Packaging Code

```js
(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,Package,Helpers,Creators);
```
