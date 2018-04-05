(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"ObjectStore",

function ObjectStorePackage_ (config) {
  config = config || {};
  config.expiry = config.expiry || 'max';
  config.which = config.which ? config.which.toLowerCase() : 'script';
  var self = this;
  var propertyStore = Import.PropertyStore({
    config: {
      jsons: true,
      which: config.which
    }
  });
  var cacheStore = Import.CacheStore({
    config: {
      jsons: false,  // we should take care of this ourselves
      expiry: config.expiry,
      which: config.which
    }
  });
  
  return {
    delete_: function (key) {
      propertyStore.delete_('storeKeys_'+key);
      cacheStore.delete_(key);
    },  
    set: function (key, value) {
      var matches, storeKeys, newValues;
      value = JSON.stringify(value);
      matches = value.match(/.{1,65500}/g);
      if (matches.length > 999) throw Error("Your object is too rich for my blood. Consider breaking it down further somehow");

      // Update a new hash with values, make one call to cache and properties each
      var charsWritten = 0;
      newValues = matches.reduce(function (acc, val, index) {
        var k;
        k = self.normalizeKey(key, index);
        acc[k] = val;
        cacheStore.set(k, val);
        charsWritten += val.length;
        return acc;
      }, {});
      cacheStore.setByKeys(newValues);
      if (value.length !== charsWritten) {
        throw Error("Not everything was written!");
      }
      propertyStore.set('storeKeys_'+key, Object.keys(newValues).sort());
    },
    get: function (key, value, expiry) {
      /* derive possible ones, getAll, get keys, sort them, combine them */
      var storeKeys, result = '', cacheResult;
      storeKeys = propertyStore.get('storeKeys_'+key) || [];
      if (storeKeys.length > 0) {
        cacheResult = cacheStore.getByKeys(storeKeys);
        
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
          missing = cacheStore.getByKeys(missingKeys);
          for (var k in missing) {
            cacheResult[k] = missing[k];
          }
        }
        Object.keys(cacheResult).sort().forEach(function (k) {
          result += cacheResult[k];
        });
      } else {
        // first time, without any putting; might be there if not expired!
        var index = 0;
        var item = cacheStore.get(self.normalizeKey(key, index));
        while (item && item.length > 0) {
          result += item;
          item = cacheStore.get(self.normalizeKey(key, index));
          index++;
        }
      }

      return JSON.parse(result || 'null');
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
  } 
},

{}

);