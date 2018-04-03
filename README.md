# moduleLibraries.gs

moduleLibraries.gs consists of:

- Import.gs, which gives the stack `Import` object
- Example and sample libraries for illustration purposes
- Useful, real libraries for use in any apps scripting project
- Documents the techniques for writing more libraries.

## Quickstart

If all you after are copies of the libraries, simply locate them, and paste them into your project or repo, then access via `Import.NameOfLibrary`. Check the documentation for that library for usage examples.

# Import.gs

Boilerplate code used in the writing of importable, modular libraries in google apps scripts.

## Import.gs Quickstart

Copy this boilerplate into a script file in your project. The first line is the magic, explained later:

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

Write your library code as properties on the returned object in the `Package_` method (or return a function with a constructor, or whatever). The helper object builds upon the library instance, and creators object builds upon importable class. They are both optional.

In the end you'll have a `Import.NameOfLibrary` invokable object that creates an instance of your library. It contains all the methods you defined in the returned object, and optionally the helpers. The creators are built upon `Import.NameOfLibrary` itself.

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
   
   // Sigh. Yes you can just add it to the global namespace:
   Import.NameOfLibrary({base: 'global', attr: 'Lib'});
   Lib.doSomething();
}
```

In other words, the magic line 1 handles the startup sequence required to give the project environment an `Import` object, whose properties represent methods that create instances of the library. That object can also have methods that assist with library creation.

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
  
  /* or you could just return regular object
     it's a library, do whatever you need here  
  return {  };
  */
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

1. All that the developer needs to do is have every file represent a different library, and they have the `Import` object available anywhere after an endpoint function is invoked (a "myFunction" or trigger). 
2. The Import object itself has a property for each library. You each library via this property, throughout your application.
1. The library consists of whatever you return from inside Package_ and the helper functions.
2. The first parameter is by convention the `config` object — the idea is that you can pass in an object of key values to represent various settings or options.
3. You can also pass in infinite number of parameters instead of just one config object, see `params` in the api, if you really need to do that.
2. You can build upon namespaces; you can write a library that has helper functions that the library needs for its own use, but also accessible to the developer. (You can also write private methods.)
3. The only globally created in this code is `Import`.

### Unminified Packaging Code

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
  global.Import[name] = function wrapper (args) {
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

### Minified Packaging Code

```js
(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,Package,Helpers,Creators);
```
