(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"Dotmitizer",

function Package (config) {
  config = config || {};
  config.pathDelimiter = config.pathDelimiter || '.';
  config.defaultValue = config.defaultvalue || null;  // Avoid changing this

  var dotize = dotize || {};
  
  /*
    Accepts an array and determines the minimum number of left-size padding required to maintain sort order
  */
  function Padder(len, pad) {
    pad = typeof pad === 'undefined' ? '0' : pad;
    var pads = '';
    while (pads.length < len) {
      pads += pad;
    }
  
    this.pad = function (what) {
      var s = what.toString();
      return pads.substring(0, pads.length - s.length) + s;
    };
  }

  dotize.sheetRowsToJsons = function (rows) {
    var columns;
    columns = rows[0];
    return rows.slice(1).map(function(row) {
      return dotize.revert(row.reduce(function(result, field, index) {
        if (field !== config.defaultValue) result[columns[index]] = field;  // FIXME: This fails if config.d
        return result;
      }, {}));
    });
  },

  dotize.jsonsToSheetRows = function (jsons) {
    var headers;
    jsons = jsons.map(function (row) {
      return dotize.convert(row);
    });
    headers = jsons.reduce(function (everyHeader, row) {
      var prop;
      for (prop in row) {
        everyHeader.push( prop );
      }
      return everyHeader;
    }, []);
    
    var mappedHeaders, finalHeaders;
    mappedHeaders = headers.map(function (el, i) {
      return { 
        index: i, 
        value: el === 'id' ? '' : el.toLowerCase()
      }
    });
    mappedHeaders.sort(function (a, b) {
      if (a.value > b.value) return 1;
      if (a.value < b.value) return -1;
      return 0;
    });
    finalHeaders = mappedHeaders.map(function (el) {
      return headers[el.index];
    }).filter(function (value, index, me) {
      return me.indexOf(value) === index;
    });
    
    return jsons.reduce(function (acc, obj) {
      var row, value;
      row = [];
      for (var h=0; h < finalHeaders.length; h++) {
        value = obj[finalHeaders[h]];
        if (typeof value === 'undefined' || value == null) value = config.defaultValue;
        row.push(value);
      }
      acc.push(row);
      return acc;
    }, [finalHeaders]);

  },
  
  dotize.convert = function(obj, prefix) {
    var newObj = {};
  
    if ((!obj || typeof obj != "object") && !Array.isArray(obj)) {
      if (prefix) {
        newObj[prefix] = obj;
        return newObj;
      } else {
        return obj;
      }
    }
  
    function isNumber(f) {
      return !isNaN(parseInt(f));
    }
  
    function isEmptyObj(obj) {
      for (var prop in obj) {
        if (Object.hasOwnProperty.call(obj, prop))
          return false;
      }
    }
  
    function getFieldName(value, field, prefix, isRoot, isItemOfArray, isArray) {
      isArray = isArray || 0;  // should be the length, truthiness makes it work
      //"value: {0.print} field: {1} isRoot: {3} isArrayItem: {4}, isArray: {5}".__log__.apply(null, arguments);
      if (isArray)
        return (prefix ? prefix : "") + (isNumber(field) ? "[" + new Padder( (isArray-1).toString().length ).pad(field) + "]" : (isRoot ? "" : ".") + field);
      else if (isItemOfArray)
        return (prefix ? prefix : "") + "[" + new Padder( (isItemOfArray-1).toString().length ).pad(field) + "]";
      else
        return (prefix ? prefix + "." : "") + field;
    }
  
    return function recurse(o, p, isRoot) {
      var isArrayItem = Array.isArray(o);
      for (var f in o) {
        var currentProp = o[f];
        if (currentProp && typeof currentProp === "object") {
          if (Array.isArray(currentProp)) {
            newObj = recurse(currentProp, getFieldName(currentProp, f, p, isRoot, false, currentProp.length /* true */), isArrayItem); // array
          } else {
            if (isArrayItem && isEmptyObj(currentProp) == false) {
              newObj = recurse(currentProp, getFieldName(currentProp, f, p, isRoot, o.length /* true */)); // array item object
            } else if (isEmptyObj(currentProp) == false) {
              newObj = recurse(currentProp, getFieldName(currentProp, f, p, isRoot)); // object
            } else {
              newObj[getFieldName(currentProp, f, p, isRoot)] = currentProp;  // assume primitive
            }
          }
        } else {
          if (isArrayItem || isNumber(f)) {
            newObj[getFieldName(currentProp, f, p, isRoot, o.length /* true */)] = currentProp; // array item primitive
          } else {
            newObj[getFieldName(currentProp, f, p, isRoot)] = currentProp; // primitive
          }
        }
      }
      
      return newObj;
    }(obj, prefix, true);
  };
  
  dotize.revert = function (source) {

    function arrayRecurse(parent, key, value) {
      var subkey, index;
      if (key.indexOf('].') !== -1) {
        index = key.slice(key.lastIndexOf('[')+1, key.lastIndexOf('].'));
        subkey = key.slice(key.lastIndexOf('].')+2);
        parent[index] = keyRecurse(parent[index] || {}, subkey, value);
        return parent;
      }
      if (key.lastIndexOf('[') === 0) {
        parent.push(value);
        return parent;
      }
      subkey = key.slice(0, key.lastIndexOf('['));
      index = parseInt(subkey.slice(1, subkey.length-1));
      parent[index] = arrayRecurse(parent[index] || [], subkey, value);
      return parent;
    }
    
    function keyRecurse (parent, key, value) {
      if (key.indexOf('.') === -1) {
        parent[key] = value;
        return parent;
      }
      var subkey = key.slice(0, key.indexOf('.'));
      parent[subkey] = keyRecurse(parent[subkey] || {}, key.slice(key.indexOf('.')+1), value);
      return parent;
    };
    
    var result;
    result = {};  // Has to be a hash
    Object.keys(source).forEach(function (sourceKey) {  
      var sourceValue = source[sourceKey];
      
      if (sourceKey.indexOf('[') === -1) 
        // Simple case
        keyRecurse(result, sourceKey, sourceValue);
      else {
        // Complicated case
        // We make values from outside in, figuring out which one to send it to
        // Assume there's only one [] for now, and it's at the end
        var step;
        step = function cycle (parent, key, value) {
          var subkey, lastSubkey, restKey, index, nextIndex, nextKey;
          if (key.indexOf('[') != key.lastIndexOf('[')) {  // what about object array array object?    
            subkey = key.slice(0, key.indexOf('['));
            restKey = key.slice(key.indexOf(']')+1);
            index = parseInt(key.slice(key.indexOf('[')+1, key.indexOf(']')));
            if (restKey[0] == '.') {
              // redo value so that it's the result of a key recurse
              // need to get the index, label it as a key originally
              index = parseInt(key.slice(key.indexOf('[')+1, key.indexOf(']')));
              nextKey = restKey.slice(1, restKey.indexOf('['));
              parent[subkey][index] = parent[subkey][index] || {};
              parent[subkey][index][nextKey] = arrayRecurse(parent[subkey][index][nextKey] || [], restKey.slice(1), value);
            } else {
              // do nothing
            }
          }
          subkey = key.slice(0, key.indexOf('['));
          restKey = key.slice(key.indexOf('['));  // key to assign
          parent[subkey] = parent[subkey] || [];
          return arrayRecurse(parent[subkey], restKey, value);
        }(result, sourceKey, sourceValue);
        keyRecurse(result, sourceKey.slice(0, sourceKey.indexOf('[')), step);      
      }
    });
    
    if ((Object.keys(result).length == 1) && result[""])
      return result[""];
    return result;
  }

  return dotize;
},

{ /* helpers */ },

{ /* creators */ }

);