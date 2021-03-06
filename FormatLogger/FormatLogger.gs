(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(var i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"FormatLogger",

function FormatLoggerPackage_ (config) {
  config = config || {};
  config.useLogger = config.useLogger || false;
  config.transformers = config.transformers || {};
  config.defaultTransformString = config.defaultTransformString || "{0}";
  config.pprintNewlines = config.pprintNewlines || true;
  config.pprintWhitespace = config.pprintWhitespace || 4;
  PropertiesService.getScriptProperties().setProperty('Import.FormatLogger.__config', JSON.stringify(config))
  if (config.useLogger)
    config.loggerObject = Logger;
  else
    config.loggerObject = console;

  var global = function gimmeGlobal() { return this; }.apply(null, []);

  //  ValueError :: String -> Error
  var ValueError = function(message) {
    var err = new Error(message);
    err.name = 'ValueError';
    return err;
  };

  //  defaultTo :: a,a? -> a
  var defaultTo = function(x, y) {
    return y == null ? x : y;
  };

   //  create :: Object -> String,*... -> String
  var create = function() {

    return function(template) {
      var args = Array.prototype.slice.call(arguments, 1);
      var idx = 0;
      var state = 'UNDEFINED';

      return template.replace(
        /([{}])\1|[{](.*?)(?:!(.+?))?[}]/g,
        function(match, literal, key, xf) {
          if (literal != null) {
            return literal;
          }
          if (key.length > 0) {
            if (state === 'IMPLICIT') {
              throw ValueError('cannot switch from ' +
                               'implicit to explicit numbering');
            }
            state = 'EXPLICIT';
          } else {
            if (state === 'EXPLICIT') {
              throw ValueError('cannot switch from ' +
                               'explicit to implicit numbering');
            }
            state = 'IMPLICIT';
            key = String(idx);
            idx += 1;
          }
          var value = defaultTo('', lookup(args, key.split('.')));
          if (xf == null) {
            return value;
          } else if (Object.prototype.hasOwnProperty.call(config.transformers, xf)) {
            return config.transformers[xf](value);
          } else {
            throw ValueError('no transformer named "' + xf + '"');
          }
        }
      );
    };
  };

  var lookup = function(obj, path) {
    if (!/^\d+$/.test(path[0])) {
      path = ['0'].concat(path);
    }
    for (var idx = 0; idx < path.length; idx += 1) {
      var key = path[idx];
      if (typeof obj[key] === 'function')
        obj = obj[key]();
      else
        obj = obj[key];
    }
    return obj;
  };

  Object.defineProperty(Object.prototype, 'stringify', {
    get: function () {
      return function (pretty) {
        pretty = pretty || false;
        if (pretty)
          return (config.pprintNewlines ? "\n" : "") +
                  config.defaultTransformString.__format__(JSON.stringify(this, null, config.pprintWhitespace), this);
        else
          return config.defaultTransformString.__format__(JSON.stringify(this), this);
      }
    },
    configurable: true,
    enumerable: false,
  });

  Object.defineProperty(Object.prototype, 'typeof_', {
    get: function () {
      var result = typeof this;
      switch (result) {
        case 'string':
          break;
        case 'boolean':
          break;
        case 'number':
          break;
        case 'object':
        case 'function':
          switch (this.constructor) {
            case new String().constructor:
              result = 'String';
              break;
            case new Boolean().constructor:
              result = 'Boolean';
              break;
            case new Number().constructor:
              result = 'Number';
              break;
            case new Array().constructor:
              result = 'Array';
              break;
            case new RegExp().constructor:
              result = 'RegExp';
              break;
            case new Date().constructor:
              result = 'Date';
              break;
            case Function:
              result = 'Function';
              break;
            default:
              result = this.constructor.toString();
              var m = this.constructor.toString().match(/function\s*([^( ]+)\(/);
              if (m)
                result = m[1];
              else
                result = this.constructor.name;   // it's an ES6 class, use name of constructor
              break;
          }
          break;
      }
      return result.substr(0, 1).toUpperCase() + result.substr(1);
    },
    configurable: true,
    enumerable: false,
  });

  Object.defineProperty(Object.prototype, 'print', {
    get: function () {
      return this.stringify(false);
    },
    configurable: true,
    enumerable: false,
  });

  Object.defineProperty(Object.prototype, '__print__', {
    get: function () {
      config.loggerObject.log.call(config.loggerObject, this.stringify(false) );
    },
    configurable: true,
    enumerable: false,
  });

  Object.defineProperty(Object.prototype, 'pprint', {
    get: function () {
      return this.stringify(true);
    },
    configurable: true,
    enumerable: false,
  });

  Object.defineProperty(Object.prototype, '__pprint__', {
    get: function () {
      config.loggerObject.log.call(config.loggerObject, this.stringify(true) );
    },
    configurable: true,
    enumerable: false,
  });

  Object.defineProperty(String.prototype, '__log__', {
    get: function () {
      return function() {
        config.loggerObject.log.call(config.loggerObject, this.__format__.apply(this, Array.prototype.slice.call(arguments)) );
      }.bind(this);
    },
    configurable: true,
    enumerable: false,
  });

  Object.defineProperty(String.prototype, '__error__', {
    get: function () {
      return function() {
        config.loggerObject.error.call(config.loggerObject, this.__format__.apply(this, Array.prototype.slice.call(arguments)) );
      }.bind(this);
    },
    configurable: true,
    enumerable: false,
  });

  Object.defineProperty(String.prototype, '__info__', {
    get: function () {
      return function() {
        config.loggerObject.info.call(config.loggerObject, this.__format__.apply(this, Array.prototype.slice.call(arguments)) );
      }.bind(this);
    },
    configurable: true,
    enumerable: false,
  });

  Object.defineProperty(String.prototype, '__warn__', {
    get: function () {
      return function() {
        config.loggerObject.warn.call(config.loggerObject, this.__format__.apply(this, Array.prototype.slice.call(arguments)) );
      }.bind(this);
    },
    configurable: true,
    enumerable: false,
  });

  Object.defineProperty(String.prototype, '__format__', {
    get: function () {
      var $format = create(config.transformers);
      return function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(this);
        return $format.apply(global, args);
      }
    },
    configurable: true,
    enumerable: false,
  });

},

{},

{
  init: function (str) {
    this.initWithLogger(str);
  },
  initWithLogger: function (str) {
    str = str || "<{0}> ({1.typeof_})";
    this({
      config: {
        useLogger: true,
        defaultTransformString: str,
        pprintNewLines: false
      }
    });
  },
  initWithStackdriver: function (str) {
    str = str || "<{0}> ({1.typeof_})";
    this({
      config: {
        useLogger: false,
        defaultTransformString: str,
        pprintNewLines: false
      }
    });
  },
  withDefaultSettings: function (func) {
    var oldConfig;
    oldConfig = JSON.parse(PropertiesService.getScriptProperties().getProperty('Import.FormatLogger.__config') || '{}');
    this.init("{0}");
    func.call();
    this({config: oldConfig});  // oldConfig
  },
}

);
