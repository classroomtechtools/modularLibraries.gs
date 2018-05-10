(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"Sheets",

function SheetsPackage_ (config) {
  config.spreadsheetId = config.spreadsheetId || null;
  config.dimension = config.dimension || 'ROWS';
  config.valueInputOption = config.valueInputOption || 'RAW';
  config.insertDataOption = config.insertDataOption || 'INSERT_ROWS';  // OVERWRITE
  config.valueRenderOption = config.valueRenderOption || 'UNFORMATTED_VALUE';  // FORMATTED_VALUE, FORMULA
  config.dateTimeRenderOption = config.dateTimeRenderOption || 'SERIAL_NUMBER';
  config.includeValuesInResponse = config.includeValuesInResponse || false;
  config.includeValueInResponse = config.includeValuesInResponse;
  config.defaultTitle = config.defaultTitle || "Untitled Spreadsheet";
  
  var self = this;
  var apiObject, getendpoints, methods;
  apiObject = {api: {spreadsheets: {values: {}, sheets: {/* TBI */}, developerMetadata: {}}},
               getValues: {}, metadata: {}};
     
  apiObject.utils = self.utils;
  
  // 
  // Spreadsheets
  //
  apiObject.api.spreadsheets.create = self.utils.standardQueryDecorator(
    function Me (spreadsheet) {
      spreadsheet = spreadsheet || {properties: {title: config.defaultTitle}};
      return Import.Requests({
        config: {
          discovery: self.discoverSpreadsheet('create'),
          oauth: 'me',
          method: 'post',
          query: Me.options,
          body: spreadsheet
        }
      })();
    }
  );
  
  apiObject.api.spreadsheets.get = self.utils.standardQueryDecorator(
    function Me () {
      return Import.Requests({
        config: {
          discovery: self.discoverSpreadsheet('get'),
          oauth: 'me',
          method: 'get',
          query: Me.options
        }
      })({spreadsheetId: config.spreadsheetId});
    }
  );
  
  apiObject.api.spreadsheets.batchUpdate = self.utils.standardQueryDecorator(
    function Me (requests, opt) {
      opt = opt || {};
      opt.includeSpreadsheetInResponse = opt.includeSpreadsheetInResponse || false;
      opt.responseIncludeGridData = opt.responseIncludeGridData || false;
      opt.responseRanges = opt.responseRanges || '';
  
      return Import.Requests({
        config: {
          discovery: self.discoverSpreadsheet('batchUpdate'),
          oauth: 'me',
          method: 'post',
          query: Me.options,
          body: {
            requests: requests,
            includeSpreadsheetInResponse: opt.includeSpreadsheetInResponse,
            responseIncludeGridData: opt.responseIncludeGridData,
            responseRanges: opt.responseRanges,
          }
        }
      })({spreadsheetId: config.spreadsheetId});
    }
  );
    
  apiObject.api.spreadsheets.getByDataFilter = self.utils.standardQueryDecorator(
    function Me (dataFilters) {
      return Import.Requests({
        config: {
          discovery: self.discoverSpreadsheet('getByDataFilter'),
          oauth: 'me',
          method: 'post',
          body: {
            dataFilters: dataFilters,
            //includeGridData: opt.includeGridData,  // this is actually ignored, since we use fields
          },
          query: Me.options
        }
      })({spreadsheetId: config.spreadsheetId});
    }
  );
    
  apiObject.api.spreadsheets.developerMetadata.get = self.utils.standardQueryDecorator(
    function Me (id) {
      var response;
      response = Import.Requests({
        config: {
          discovery: self.discoverDevMetadata('get'),
          oauth: 'me',
          method: 'get',
          query: Me.options
        }
      })({spreadsheetId: config.spreadsheetId, metadataId: id});
      if (response.statusCode() == 400) return null;
      return response;
    }
  );

  apiObject.api.spreadsheets.developerMetadata.search = self.utils.standardQueryDecorator(
    function Me (/*dataFilters*/) {
      var response;
      response = Import.Requests({
        config: {
          discovery: self.discoverDevMetadata('search'),
          oauth: 'me',
          method: 'post',
          body: {
            dataFilters: Array.prototype.slice.call(arguments)
          },
          query: Me.options
        }
      })({spreadsheetId: config.spreadsheetId});   
      if (response.statusCode() == 400) return null;
      return response;
    }
  );
  
  apiObject.api.spreadsheets.values.append = self.utils.standardQueryDecorator(
    function Me (table, values) {
      return Import.Requests({
        config: {
          discovery: self.discoverValues('append'),
          oauth: 'me',
          method: 'post',
          query: self.augmentQueryParams({
            valueInputOption: config.valueInputOption,
            insertDataOption: config.insertDataOption,
            includeValuesInResponse: config.includeValuesInResponse,
            responseValueRenderOption: config.valueRenderOption,
            responseDateTimeRenderOption: config.dateTimeRenderOption
          }, Me.options),
          body: {
            range: table,
            majorDimension: config.dimension,
            values: values
          }
        }
      })({spreadsheetId: config.spreadsheetId, range: table});
    }
  );
  
  apiObject.api.spreadsheets.values.batchClear = self.utils.standardQueryDecorator(
    function Me (/* clear ranges */) {
      return Import.Requests({
        config: {
          discovery: self.discoverValues('batchClear'),
          oauth: 'me',
          method: 'post',
          body: {
            ranges: Array.prototype.slice.call(arguments),
          },
          query: Me.options
        }
      })({spreadsheetId: config.spreadsheetId});
    }
  );
  
  apiObject.api.spreadsheets.values.batchClearByDataFilter = self.utils.standardQueryDecorator(
    function Me (/* dataFilters */) {
      return Import.Requests({
        config: {
          discovery: self.discoverValues('batchClearByDataFilter'),
          oauth: 'me',
          method: 'post',
          body: {
            dataFilters: Array.prototype.slice.call(arguments)
          },
          query: Me.options
        }
      })({spreadsheetId: config.spreadsheetId});
    }
  );
  
  /*
    data is a hash where keys are the range a1notation and values are arrays of intended raw values
  */
  apiObject.api.spreadsheets.values.batchUpdate = self.utils.standardQueryDecorator(
    function Me (data) {
      return Import.Requests({
        config: {
          discovery: self.discoverValues('batchUpdate'),
          oauth: 'me',
          method: 'post',
          query: Me.options,
          body: {
            valueInputOption: config.valueInputOption,
            includeValuesInResponse: config.includeValuesInResponse,
            responseValueRenderOption: config.valueRenderOption,
            responseDateTimeRenderOption: config.dateTimeRenderOption,
            data: Object.keys(data).reduce(
              function (acc, key) {
                var valueRange = {};
                valueRange = {
                  range: key,
                  majorDimension: config.dimension,
                  values: data[key]
                };
                acc.push(valueRange);
                return acc;
              }, []
            )
          }
        }
      })({spreadsheetId: config.spreadsheetId});
    }
  );
  
  apiObject.api.spreadsheets.values.batchUpdateByDataFilter = self.utils.standardQueryDecorator(
    function Me (dataFilters) {
      return Import.Requests({
        config: {
          discovery: self.discoverValues('batchUpdateByDataFilter'),
          oauth: 'me',
          method: 'post',
          query: Me.options,
          body: {
            valueInputOption: config.valueInputOption,
            includeValuesInResponse: config.includeValuesInResponse,
            responseValueRenderOption: config.valueRenderOption,
            responseDateTimeRenderOption: config.dateTimeRenderOption,
            data: Object.keys(dataFilters).reduce(
              function (acc, key) {
                var dataFilterValueRange = {
                  dataFilter: {},
                  majorDimension: config.dimension,
                  values: dataFilters[key]
                };
                if (typeof key == 'string')
                  dataFilterValueRange.dataFilter.a1Range = key;
                else
                  dataFilterValueRange.dataFilter.developerMetadataLookup = key;
                acc.push(dataFilterValueRange);
                return acc;
              }, []
            )
          }
        }
      })({spreadsheetId: config.spreadsheetId});
    }
  );

  apiObject.api.spreadsheets.values.clear = self.utils.standardQueryDecorator(
    function Me (range) {
      return Import.Requests({
        config: {
          discovery: self.discoverValues('clear'),
          oauth: 'me',
          method: 'post',
          query: Me.options
        }
      })({spreadsheetId: config.spreadsheetId, range: range});
    }
  );
  
  apiObject.api.spreadsheets.values.get = self.utils.standardQueryDecorator(
    function Me (range) {
      return Import.Requests({
        config: {
          discovery: self.discoverValues('get'),
          oauth: 'me',
          method: 'get',
          query: self.augmentQueryParams({
            valueRenderOption: config.valueRenderOption,
            dateTimeRenderOption: config.dateTimeRenderOption,
          }, Me.options)
        }
      })({spreadsheetId: config.spreadsheetId, range: range});
    }
  );
  
  apiObject.api.spreadsheets.values.batchGet = self.utils.standardQueryDecorator(
    function Me (/* ranges */) {
      return Import.Requests({
        config: {
          discovery: self.discoverValues('batchGet'),
          oauth: 'me',
          method: 'get',
          query: self.augmentQueryParams({
            ranges: Array.prototype.slice.call(arguments),
            majorDimension: config.dimension,
            valueRenderOption: config.valueRenderOption,
            dateTimeRenderOption: config.dateTimeRenderOption
          }, Me.options),
        }
      })({spreadsheetId: config.spreadsheetId});
    }
  );
  
  apiObject.api.spreadsheets.values.batchGetByDataFilter = self.utils.standardQueryDecorator(
    function Me (/* dataFilters */) {
      return Import.Requests({
        config: {
          discovery: self.discoverValues('batchGetByDataFilter'),
          oauth: 'me',
          method: 'post',
          body: {
            dataFilters: Array.prototype.slice.call(arguments),
            majorDimension: config.dimension,
            valueRenderOption: config.valueRenderOption,
            dateTimeRenderOption: config.dateTimeRenderOption
          },
          query: Me.options
        }
      })({spreadsheetId: config.spreadsheetId});
    }
  );
  
  /*
    
  */
  apiObject.api.spreadsheets.values.update = self.utils.standardQueryDecorator(
    function Me (rangeA1Notation, values) {
      return Import.Requests({
        config: {
          discovery: self.discoverValues('update'),
          oauth: 'me',
          method: 'put',
          query: self.augmentQueryParams({
            valueInputOption: config.valueInputOption,
            includeValuesInResponse: config.includeValuesInResponse,
            responseValueRenderOption: config.valueRenderOption,
            responseDateTimeRenderOption: config.dateTimeRenderOption
          }, Me.options),
          body: {
            range: rangeA1Notation,   // "For output, this range indicates the entire requested range, even though the values will exclude trailing rows and columns"
            majorDimension: config.dimension,
            values: values
          }
        }
      })({spreadsheetId: config.spreadsheetId, range: rangeA1Notation});
    }
  );

  apiObject.api.spreadsheets.sheets.copyTo = self.utils.standardQueryDecorator(
    function Me (sheetId, destinationSpreadsheetId) {
      return Import.Requests({
        config: {
          discovery: {
            name: 'sheets',
            version: 'v4',
            resource: 'spreadsheets.sheets',
            method: 'copyTo',
          },
          oauth: 'me',
          method: 'post',
          body: {
            destinationSpreadsheetId: destinationSpreadsheetId,   // "For output, this range indicates the entire requested range, even though the values will exclude trailing rows and columns"
          },
          query: Me.options
        }
      })({spreadsheetId: config.spreadsheetId});
    }
  );
  
  return apiObject;
}, 

{ // private methods
  disc: function (resource, method) {
    return {
      name: 'sheets',
      version: 'v4',
      resource: resource,
      method: method,
    };
  },
  discoverSpreadsheet: function (method) {
    return this.disc('spreadsheets', method);
  },
  discoverDevMetadata: function (method) {
    return this.disc('spreadsheets.developerMetadata', method)
  },
  discoverValues: function (method) {
    return this.disc('spreadsheets.values', method)
  },
  
  augmentQueryParams: function (primaryOptions, secondaryOptions) {
    var ret = {};
    Object.keys(secondaryOptions).forEach(function (prop) {
      ret[prop] = secondaryOptions[prop];
    });
    Object.keys(primaryOptions).forEach(function (prop) {
      ret[prop] = primaryOptions[prop];
    });
    return ret;
  },
  
  
  // public methods; added to instance
  utils: {
  
    standardQueryDecorator: function (func) {
      func.options = {
        fields: '*',
        prettyPrint: false  // set here because logging is actually easier
      };
      func.setOption = function (name, value) {
        func.options[name] = value;
      };
      func.getOption = function (name) {
        return func.options[name];
      };
      return func;
    },
  
    listValues2array: function (listValues) {
      return listValues.reduce(
        function (acc, valueObj) {
          var key = Object.keys(valueObj)[0];
          acc.push(valueObj[key]);
          return acc;
        }, []
      );
    },
    array2ListValues: function (arr) {
      return arr.reduce(
        function (result, row) {
          result.push(row.reduce(
            function (r, value) {
              var Value;
              switch (typeof value) {
                case 'string':
                  Value = {stringValue: value};
                  break;
                case 'number':
                  Value = {numberValue: value};
                  break;
                case 'boolean':
                  Value = {boolValue: value};
                  break;
                case 'object':
                  if (value == null)
                    Value = {nullValue: null};
                  else if (Array.isArray(value))
                    Value = {listValue: value};
                  else
                    Value = {structValue: value};
                  break;
                default:
                  throw Error("Unknown type " + typeof value + " sent into array2ListValues");
              }
              r.push(Value);
              return r;
            }, []
          ));
          return result;
        }, []
      );
    },
  },
},

{
  fromId: function (id) {
    return this({
        config: {
            spreadsheetId: id
        }
    });
  },
  
  new_: function () {
    var ss = this().api.spreadsheets.create();
    return this.fromId(ss.json().spreadsheetId);
  },
  
  
}

);
