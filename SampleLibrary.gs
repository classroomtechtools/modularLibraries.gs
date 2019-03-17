(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import._Packages=Import._Packages||{};Import._Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import._Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"HelloWorld",

function Package_ (config) {
  config.lang = config.lang || 'en';
  config.noun = config.noun || 'World';
  function hi () {
    switch (config.lang) {
      case 'en':
        return 'Hello';
        break;
      case 'ch':
        return 'Ni hao';
        break;
    }
  }

  return function Library_ (self) {
    return {
      sayHi: function () {
        self.output(hi() + ', ' + config.noun);
      }
    }
  }(this);
},

{
  output: function (arg) {
    Logger.log(arg);
  }
},

{
  chinese: function (config) {
    config.lang = 'ch';
    return this({config:config});
  }
}

);
