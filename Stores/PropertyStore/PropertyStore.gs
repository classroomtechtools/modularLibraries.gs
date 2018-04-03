(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"PropertyStore",

function PropertyStorePackage_ (global, config) {
  config = config || {};
  config.jsons = config.jsons || false;
  
  var PropertyObject = function (_propertyObject) {
    return { 
      set: function (key, value) {
        if (config.jsons) value = JSON.stringify(value);
        _propertyObject.setProperty(key, value);
      },
      get: function (key) {
        var ret;
        ret = _propertyObject.getProperty(key);
        if (config.jsons) {
          ret = JSON.parse(ret || 'null');
        }
        return ret;
      },
    };
  };

  return {
    script: function () {
      return PropertyObject(PropertiesService.getScriptProperties());
    },
    document: function () {
      return PropertyObject(PropertiesService.getDocumentProperties());
    },
    user: function () {
      return PropertyObject(PropertiesService.getUserProperties());    
    }
  }
},

{ /* helpers */ }

);
