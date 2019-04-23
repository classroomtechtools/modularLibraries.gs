(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config, global]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"ObjectStore",

function ObjectStorePackage_ (config, global) {
  config = config || {};
  config.expiry = config.expiry || 'max';
  if (config.expiry === 'max') config.expiry = 21600;
  config.which = config.which ? config.which.toLowerCase() : 'script';
  config.cyclic = config.cyclic || false;
  var self = this;
  
  // WeakMapPolyfill  https://github.com/polygonplanet/weakmap-polyfill/blob/master/weakmap-polyfill.js
  
  if (self.WeakMap) {
    return;
  }

  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var defineProperty = function(object, name, value) {
    if (Object.defineProperty) {
      Object.defineProperty(object, name, {
        configurable: true,
        writable: true,
        value: value
      });
    } else {
      object[name] = value;
    }
  };

  global.WeakMap = (function() {

    // ECMA-262 23.3 WeakMap Objects
    function WeakMap() {
      if (this === void 0) {
        throw new TypeError("Constructor WeakMap requires 'new'");
      }

      defineProperty(this, '_id', genId('_WeakMap'));

      // ECMA-262 23.3.1.1 WeakMap([iterable])
      if (arguments.length > 0) {
        // Currently, WeakMap `iterable` argument is not supported
        throw new TypeError('WeakMap iterable is not supported');
      }
    }

    // ECMA-262 23.3.3.2 WeakMap.prototype.delete(key)
    defineProperty(WeakMap.prototype, 'delete', function(key) {
      checkInstance(this, 'delete');

      if (!isObject(key)) {
        return false;
      }

      var entry = key[this._id];
      if (entry && entry[0] === key) {
        delete key[this._id];
        return true;
      }

      return false;
    });

    // ECMA-262 23.3.3.3 WeakMap.prototype.get(key)
    defineProperty(WeakMap.prototype, 'get', function(key) {
      checkInstance(this, 'get');

      if (!isObject(key)) {
        return void 0;
      }

      var entry = key[this._id];
      if (entry && entry[0] === key) {
        return entry[1];
      }

      return void 0;
    });

    // ECMA-262 23.3.3.4 WeakMap.prototype.has(key)
    defineProperty(WeakMap.prototype, 'has', function(key) {
      checkInstance(this, 'has');

      if (!isObject(key)) {
        return false;
      }

      var entry = key[this._id];
      if (entry && entry[0] === key) {
        return true;
      }

      return false;
    });

    // ECMA-262 23.3.3.5 WeakMap.prototype.set(key, value)
    defineProperty(WeakMap.prototype, 'set', function(key, value) {
      checkInstance(this, 'set');

      if (!isObject(key)) {
        throw new TypeError('Invalid value used as weak map key');
      }

      var entry = key[this._id];
      if (entry && entry[0] === key) {
        entry[1] = value;
        return this;
      }

      defineProperty(key, this._id, [key, value]);
      return this;
    });


    function checkInstance(x, methodName) {
      if (!isObject(x) || !hasOwnProperty.call(x, '_id')) {
        throw new TypeError(
          methodName + ' method called on incompatible receiver ' +
          typeof x
        );
      }
    }

    function genId(prefix) {
      return prefix + '_' + rand() + '.' + rand();
    }

    function rand() {
      return Math.random().toString().substring(2);
    }


    defineProperty(WeakMap, '_polyfill', true);
    return WeakMap;
  })();


  function isObject(x) {
    return Object(x) === x;
  }
  
  // end WeakMap Polyfill



  // start Cyclic  https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
  
  if (typeof JSON.decycle !== "function") {
      JSON.decycle = function decycle(object, replacer) {
  
  // Make a deep copy of an object or array, assuring that there is at most
  // one instance of each object or array in the resulting structure. The
  // duplicate references (which might be forming cycles) are replaced with
  // an object of the form
  
  //      {"$ref": PATH}
  
  // where the PATH is a JSONPath string that locates the first occurance.
  
  // So,
  
  //      var a = [];
  //      a[0] = a;
  //      return JSON.stringify(JSON.decycle(a));
  
  // produces the string '[{"$ref":"$"}]'.
  
  // If a replacer function is provided, then it will be called for each value.
  // A replacer function receives a value and returns a replacement value.
  
  // JSONPath is used to locate the unique object. $ indicates the top level of
  // the object or array. [NUMBER] or [STRING] indicates a child element or
  // property.
  
          var objects = new WeakMap();     // object to path mappings
  
          return (function derez(value, path) {
  
  // The derez function recurses through the object, producing the deep copy.
  
              var old_path;   // The path of an earlier occurance of value
              var nu;         // The new object or array
  
  // If a replacer function was provided, then call it to get a replacement value.
  
              if (replacer !== undefined) {
                  value = replacer(value);
              }
  
  // typeof null === "object", so go on if this value is really an object but not
  // one of the weird builtin objects.
  
              if (
                  typeof value === "object"
                  && value !== null
                  && !(value instanceof Boolean)
                  && !(value instanceof Date)
                  && !(value instanceof Number)
                  && !(value instanceof RegExp)
                  && !(value instanceof String)
              ) {
  
  // If the value is an object or array, look to see if we have already
  // encountered it. If so, return a {"$ref":PATH} object. This uses an
  // ES6 WeakMap.
  
                  old_path = objects.get(value);
                  if (old_path !== undefined) {
                      return {$ref: old_path};
                  }
  
  // Otherwise, accumulate the unique value and its path.
  
                  objects.set(value, path);
  
  // If it is an array, replicate the array.
  
                  if (Array.isArray(value)) {
                      nu = [];
                      value.forEach(function (element, i) {
                          nu[i] = derez(element, path + "[" + i + "]");
                      });
                  } else {
  
  // If it is an object, replicate the object.
  
                      nu = {};
                      Object.keys(value).forEach(function (name) {
                          nu[name] = derez(
                              value[name],
                              path + "[" + JSON.stringify(name) + "]"
                          );
                      });
                  }
                  return nu;
              }
              return value;
          }(object, "$"));
      };
  }
  
  
  if (typeof JSON.retrocycle !== "function") {
      JSON.retrocycle = function retrocycle($) {
          "use strict";
  
  // Restore an object that was reduced by decycle. Members whose values are
  // objects of the form
  //      {$ref: PATH}
  // are replaced with references to the value found by the PATH. This will
  // restore cycles. The object will be mutated.
  
  // The eval function is used to locate the values described by a PATH. The
  // root object is kept in a $ variable. A regular expression is used to
  // assure that the PATH is extremely well formed. The regexp contains nested
  // * quantifiers. That has been known to have extremely bad performance
  // problems on some browsers for very long strings. A PATH is expected to be
  // reasonably short. A PATH is allowed to belong to a very restricted subset of
  // Goessner's JSONPath.
  
  // So,
  //      var s = '[{"$ref":"$"}]';
  //      return JSON.retrocycle(JSON.parse(s));
  // produces an array containing a single element which is the array itself.
  
          var px = /^\$(?:\[(?:\d+|"(?:[^\\"\u0000-\u001f]|\\(?:[\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*")\])*$/;
  
          (function rez(value) {
  
  // The rez function walks recursively through the object looking for $ref
  // properties. When it finds one that has a value that is a path, then it
  // replaces the $ref object with a reference to the value that is found by
  // the path.
  
              if (value && typeof value === "object") {
                  if (Array.isArray(value)) {
                      value.forEach(function (element, i) {
                          if (typeof element === "object" && element !== null) {
                              var path = element.$ref;
                              if (typeof path === "string" && px.test(path)) {
                                  value[i] = eval(path);
                              } else {
                                  rez(element);
                              }
                          }
                      });
                  } else {
                      Object.keys(value).forEach(function (name) {
                          var item = value[name];
                          if (typeof item === "object" && item !== null) {
                              var path = item.$ref;
                              if (typeof path === "string" && px.test(path)) {
                                  value[name] = eval(path);
                              } else {
                                  rez(item);
                              }
                          }
                      });
                  }
              }
          }($));
          return $;
      };
}
  
  
  // end Cyclic


  /* we'll use two seperate variables to interface with the cache, since one of them is going be jsons
     and the other will not, */
  var keysStore = Import.CacheStore({
    config: {
      jsons: true,
      expiry: config.expiry,
      which: config.which
    }
  });
  var mainStore = Import.CacheStore({
    config: {
      jsons: false,  // we should take care of this ourselves
      expiry: config.expiry,
      which: config.which
    }
  });
  
  return {
    delete_: function (key) {
      keysStore.remove(self.keyStoreKey(key));
      mainStore.remove(key);
    },
    set: function (key, value, thisExpiry) {
      expiry = thisExpiry || config.expiry;
      var matches, storeKeys, newValues;
      if (config.cyclic)
        value = JSON.stringify(JSON.decycle(value));
      else 
        value = JSON.stringify(value);
      matches = value.match(/.{1,65500}/g);
      if (matches.length > 999) throw Error("Your object is too rich for my blood. Consider breaking it down further somehow");

      // Update a new hash with values, make one call to cache and properties each
      var charsWritten = 0;
      newValues = matches.reduce(function (acc, val, index) {
        var k;
        k = self.normalizeKey(key, index);
        acc[k] = val;
        //mainStore.set(k, val, expiry);     // FIXME: IS THIS NECESSARY???
        charsWritten += val.length;
        return acc;
      }, {});
      
      if (value.length === charsWritten) {
        mainStore.setByKeys(newValues, expiry);
        keysStore.set(self.keyStoreKey(key), Object.keys(newValues).sort());
      } else {
        // Don't write it; not in the cache... !
        console.log("501) Cache error. Expecting " + value.length + " but only " + charsWritten + "(" + key + ")");
        //throw Error();
      }

    },
    get: function (key) {
      /* derive possible ones, getAll, get keys, sort them, combine them */
      var storeKeys, ret, result = '', cacheResult;
      storeKeys = keysStore.get(self.keyStoreKey(key)) || [];
      if (storeKeys.length > 0) {
        cacheResult = mainStore.getByKeys(storeKeys);
        
        /* Seeing some issues with some keys not returning in the first request (only for very large requests)!
           (It is consistently the same keys, not random, which initially made me think I was doing something wrong)
           Workaround is to simply re-do the request, but that really should be fixed (by Google)  */
        if (Object.keys(cacheResult).length !== storeKeys.length) {
          var missingKeys, missing;
          missingKeys = storeKeys.reduce(function (acc, thisKey) {
            if (typeof cacheResult[thisKey] === 'undefined') {
              acc.push(thisKey);
            }
            return acc;
          }, []);
          console.log('110) missing keys recovered ' + missingKeys);
          missing = mainStore.getByKeys(missingKeys);
          for (var k in missing) {
            cacheResult[k] = missing[k];
          }
        }
        Object.keys(cacheResult).sort().forEach(function (k) {
          result += cacheResult[k];
        });
      }
      try {
        if (config.cyclic)
          ret = JSON.retrocycle(JSON.parse(result || 'null'));
        else 
          ret = JSON.parse(result || 'null');
      } catch (e) {
        console.log("502: cache could not be parsed: " + e.message + " (" + key + ")");
        return null;  // so fail silently
      }
      return ret;
    },
    append: function (key, listToAppend) {
      var obj;
      obj = this.get(key) || [];
      if (!Array.isArray(obj)) throw Error("Cannot append onto object that isn't a list");
      Array.prototype.push.apply(obj, listToAppend);
      this.set(key, obj);
    }
  }


},

{
  normalizeKey: function (key, number, howMany) {
    // padding gives us upper theoretical limit, padding with four digits has loooooong run-times
    howMany = howMany || 3;
    return key + (Array(Math.max(howMany - String(number).length + 1, 0)).join(0) + number).toString();
  },

  keyStoreKey: function (key) {
    return '__storeKey:' + key;
  }
},

{}

);
