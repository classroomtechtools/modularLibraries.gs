(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import._Packages=Import._Packages||{};Import._Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import._Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,
   
"CustomErrors",

function Package_(config) {
  var self = this;

  var customError;
  
  customError = function (message, anything) {
    if (!(this instanceof customError)) return new customError(message)
    message = message || 'No message provided';
    this.name = config.name;
    this.message = message;
    var stackInfo = self.utils.getStack(0);
    this.error = stackInfo.error;
    this.error.message = message;
    this.error.trace = stackInfo.stackLevels.slice(3);  // remove traces of me
    this.stack = stackInfo.stack;
    this.caller = stackInfo.stackLevels[0].caller;
    this.lineNumber = stackInfo.stackLevels[0].line;
    this.file = stackInfo.stackLevels[0].file;
    if (config.callback && typeof config.callback === 'function') config.callback.call(this);
  }
  customError.prototype = Object.create(Error.prototype); 
  customError.prototype.constructor = customError; 
  return customError;  
}, {
  utils: {
    
    /*
    return {error: Object, stack: String, stackLevels: [{line: Number, file: String, caller: String}]
    */
    getStack: function (level) {
      // Credit for this funciton and custom error stack insight in apps scripts to Bruce Mcpherson (http://ramblings.mcpher.com/Home/excelquirks/gassnips/stack)
      
      // by default this is 1 (meaning identify the line number that called this function) 2 would mean call the function 1 higher etc.
      level = typeof level === 'undefined' ? 1 : Math.abs(level);
      var ret = {};
      
      try {
        // throw a fake error
        throw Error("fake error just to get the stack variable");
      }
      catch (err) {
        // return the error object so we know where we are
        ret.stack = err.stack;
        var stack = err.stack.split('\n');
        if (!level) {
          // return an array of the entire stack
          ret.stackLevels = stack.slice(0,stack.length-1).map (function(d) {
            return deComposeMatch(d);
          });
        } else {    
          // return the requested stack level
          ret.stackLevels = [];
          ret.stackLevels.push(deComposeMatch(stack[Math.min(level,stack.length-1)]));
        }
        ret.error = {file: ret.stackLevels[0].file, lineNumber: ret.stackLevels[0].line};
        return ret;
      }
      
      function deComposeMatch (where) {
        var file = /at\s(.*):/.exec(where);
        var line =/:(\d*)/.exec(where);
        var caller =/:.*\((.*)\)/.exec(where);
        return {func:caller ? caller[1] :  'unknown' ,line: line ? line[1] : 'unknown',file: file ? file[1] : 'unknown'};
      }
    }
  }
}, {
  create: function (name, callback, options) {
    options = options || {}; 
    options.config = {
      name: name,
      callback: callback
    };
    return this(options);
  }
}

);
