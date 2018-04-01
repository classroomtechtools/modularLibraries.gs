(function(global,name,Package,helpers){var ref=function wrapper(args){var wrapped=function(){return Package.apply(global.Import&&Import.module?Import._import(name):global[name],[global].concat(Array.prototype.slice.call(arguments)))};for(i in args){wrapped[i]=args[i]}return wrapped}(helpers);if(global.Import&&Import.module){Import.register(name,ref)}else{Object.defineProperty(global,name,{value:ref});global.Import=global.Import||function(lib){return global[lib]};Import.module=false}})(this,

"CacheStore",

function CacheStorePackage_ (global, config) {
  config = config || {};
  if (config.expiry === 'max') {
    config.expiry = 21600;
  }
  config.expiry = config.expiry || 600;  // 10 minutes
  config.jsons = config.jsons || true;
  var scriptProperties = PropertiesService.getScriptProperties();
  var storeMax = parseInt(scriptProperties.getProperty('__max') || "100");
  
  var CacheObject = function (_cacheObj) {
    return { 
      set: function (key, value, expiry) {
        expiry = expiry || config.expiry;
        _cacheObj.put(key, value, expiry);
      },
      get: function (key, value) {
        if (config.jsons) return JSON.parse(_cacheObj.get(key) || 'null');
        return _cacheObj.get(key, value) || null;
      },
      getByKeys: function (keys) {
        return _cacheObj.getAll(keys);
      },
      remove: function (key) {
        _cacheObj.remove(key);
      },
      removeKeys: function (keys) {
        _cacheObj.removeAll(keys);
      },
    };
  };

  return {
    script: function () {
      return CacheObject(CacheService.getScriptCache());
    },
    document: function () {
      return CacheObject(CacheService.getDocumentCache());
    },
    user: function () {
      return CacheObject(CacheService.getUserCache());    
    }
  }
},

{ /* helpers */ }

);
