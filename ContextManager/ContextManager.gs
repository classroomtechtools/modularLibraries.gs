(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"ContextManager",

/*
  @param {Function} body: optional
  @param {Object} options: @prop {Function} enter: The function called on entry
                           @prop {Function} exit: The function called on exit
                           @prop {Function} onError: The function called on error, not re-raised if returns null
                           @prop {Array} params: (optional) arguments sent to the entry function
  @throws re-raises error that was raised in execution of body function (unless onError is defined and returns null)
  @throws Error if sent no parameters or more than two
  @returns returned object from @param body if in embedded mode (two-parameters passed)
  @returns function if in fastory mode (one-parameter passed):
  @param {Function} body (same as above)
*/
function Package () {
  return function () {
    var ret, result, options, bodies, body;
  
    function _parseOptions(opt) {
      var returnThis = {};
      returnThis.params = opt.params || function () { return []; };
      if (typeof returnThis.params !== 'function') throw TypeError("params must be a function");
      returnThis.enter = opt.enter || function () { return returnThis.params.call(this); };
      returnThis.exit = opt.exit || function () {};
      returnThis.onError = opt.onError || function () {};
      return returnThis;
    }

    if (arguments.length == 1) {  // factory mode

      bodies = null;
      options = _parseOptions(arguments[0]);

      return function (body) {
        var ret, result;
        ret = options.params.call(this);
        ret = options.enter.apply(this, ret);
        if (typeof result !== 'undefined')
          ret = result;

        try {
          result = body.apply(this, ret);
          if (typeof result !== 'undefined') 
            ret = result;
        } catch (err) {
          if (options.onError.apply(this, [err].concat(ret)) !== null)
            throw new err.constructor(err.message + ' --> ' (err.stack ? err.stack.toString() : err.toString()));
        } finally {
          options.exit.apply(this, ret);
        }

        return ret;
      };

   } else if (arguments.length == 2) {  // embedded mode

     bodies = arguments[0];
     options = _parseOptions(arguments[1]);

     if (!Array.isArray(bodies))
       bodies = [bodies];

     for (var i = 0; i < bodies.length; i++) {
       body = bodies[i];
       ret = options.params.call(this);
       result = options.enter.apply(this, ret);
       if (typeof result !== 'undefined')
         ret = result;
       try {
         result = body.apply(this, ret);
         if (typeof result !== 'undefined')
           ret = result;
       } catch (err) {
         if (options.onError.apply(this, [err].concat(ret)) !== null)
           throw new err.constructor(err.message + ' --> ' + (err.stack ? err.stack.toString() : err.toString()));
       } finally {
         options.exit.apply(this, ret);
       }
     }
   } else {
     throw new Error("Pass either one or two arguments");
   }

   return ret;
  };
},

{},
{}
);