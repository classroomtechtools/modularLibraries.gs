(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"ObjectStore",

function ObjectStorePackage_ (global, config) {
  config = config || {};
  config.expiry = config.expiry || 'max';
  config.which = config.which || 'script';
  var self = this;
  var propertyStore = Import('PropertyStore')({jsons:true})[config.which]();
  var cacheStore = Import('CacheStore')({jsons:true, expiry: config.expiry})[config.which]();  
  
  return {
    delete_: function (key) {
      propertyStore.delete_('storeKeys_'+key);
      cacheStore.delete_(key);
    },  
    set: function (key, value) {
      var matches, storeKeys, newStoreKeys;
      value = JSON.stringify(value);
      matches = value.match(/.{1,65500}/g);
      storeKeys = propertyStore.get('storeKeys_'+key) || [];
      var charsWritten = 0;
      newStoreKeys = matches.reduce(function (acc, val, index) {
        var k;
        k = self.normalizeKey(key, index);
        acc.push(k);
        cacheStore.set(k, val);
        charsWritten += val.length;
        return acc;
      }, []);
      //Logger.log('#chars written: ' + charsWritten);
      propertyStore.set('storeKeys_'+key, newStoreKeys);        
    },
    get: function (key, value, expiry) {
      /* derive possible ones, getAll, get keys, sort them, combine them */
      var storeKeys, result = '';
      storeKeys = propertyStore.get('storeKeys_'+key) || [];
      if (storeKeys.length > 0) {
        var cacheResult = cacheStore.getByKeys(storeKeys);
        Object.keys(cacheResult).sort().forEach(function (k) {
          result += cacheResult[k];
        });
      } else {
        // first time, without any putting; might be there if not expired!
        var index = 0;
        var item = cacheStore.get(self.normalizeKey(key, index));
        while (item && item.length > 0) {
          result += item;
          item = cacheStore.get(self.normalizeIndex(key, index));
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
    howMany = howMany || 3;
    return key + (Array(Math.max(howMany - String(number).length + 1, 0)).join(0) + number).toString();
  } 
}

);
