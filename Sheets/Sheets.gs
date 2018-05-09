(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"Sheets",

function Package (config) {
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
  apiObject.api.spreadsheets.create = function (spreadsheet, fields) {
    spreadsheet = spreadsheet || {properties: {title: config.defaultTitle}};
    fields = fields || '';
    return Import.Requests({
      config: {
        discovery: self.discoverSpreadsheet('create'),
        oauth: 'me',
        method: 'post',
        query: {
          fields: fields,
        },
        body: spreadsheet
      }
    })();
  };
  
  apiObject.api.spreadsheets.get = function (fields) {
    fields = fields || '';
    return Import.Requests({
      config: {
        discovery: self.discoverSpreadsheet('get'),
        oauth: 'me',
        method: 'get',
        query: {
          fields: fields,
        }
      }
    })({spreadsheetId: config.spreadsheetId});
  };
  
  apiObject.api.spreadsheets.batchUpdate = function (requests, opt) {
    opt = opt || {};
    opt.includeSpreadsheetInResponse = opt.includeSpreadsheetInResponse || false;
    opt.responseIncludeGridData = opt.responseIncludeGridData || false;
    opt.responseRanges = opt.responseRanges || '';
    opt.fields = opt.fields || '*';

    return Import.Requests({
      config: {
        discovery: self.discoverSpreadsheet('batchUpdate'),
        oauth: 'me',
        method: 'post',
        query: {
          fields: opt.fields
        },
        body: {
          requests: requests,
          includeSpreadsheetInResponse: opt.includeSpreadsheetInResponse,
          responseIncludeGridData: opt.responseIncludeGridData,
          responseRanges: opt.responseRanges,
        }
      }
    })({spreadsheetId: config.spreadsheetId});
  };
  
  apiObject.api.spreadsheets.getByDataFilter = function (dataFilters, opt) {
    opt = opt || {};
    opt.fields = opt.fields || '*';
    opt.includeGridData = opt.includeGridData || false;
    return Import.Requests({
      config: {
        discovery: self.discoverSpreadsheet('getByDataFilter'),
        oauth: 'me',
        method: 'post',
        body: {
          dataFilters: dataFilters,
          //includeGridData: opt.includeGridData,  // this is actually ignored, since we use fields
        },
        query: {
          fields: opt.fields,
        }
      }
    })({spreadsheetId: config.spreadsheetId});
  };
  
  apiObject.api.spreadsheets.developerMetadata.get = function (id) {
    var response;
    response = Import.Requests({
      config: {
        discovery: self.discoverDevMetadata('get'),
        oauth: 'me',
        method: 'get',
      }
    })({spreadsheetId: config.spreadsheetId, metadataId: id});
    if (response.statusCode() == 400) return null;
    return response;
  };

  apiObject.api.spreadsheets.developerMetadata.search = function (key) {
    var response;
    response = Import.Requests({
      config: {
        discovery: self.discoverDevMetadata('search'),
        oauth: 'me',
        method: 'post',
        body: {
          dataFilters: [{
            developerMetadataLookup: {
              metadataKey: key
            }
          }]
        }
      }
    })({spreadsheetId: config.spreadsheetId});   
    if (response.statusCode() == 400) return null;
    return response;
  };
  
  apiObject.api.spreadsheets.values.append = function (table, values) {
    
    return Import.Requests({
      config: {
        discovery: self.discoverValues('append'),
        oauth: 'me',
        method: 'post',
        query: {
          valueInputOption: config.valueInputOption,
          insertDataOption: config.insertDataOption,
          includeValuesInResponse: config.includeValuesInResponse,
          responseValueRenderOption: config.valueRenderOption,
          responseDateTimeRenderOption: config.dateTimeRenderOption
        },
        body: {
          range: table,
          majorDimension: config.dimension,
          values: values
        }
      }
    })({spreadsheetId: config.spreadsheetId, range: table});
  };
  
  apiObject.api.spreadsheets.values.batchClear = function (/* clear ranges */) {
    return Import.Requests({
      config: {
        discovery: self.discoverValues('batchClear'),
        oauth: 'me',
        method: 'post',
        body: {
          ranges: Array.prototype.slice.call(arguments),
        }
      }
    })({spreadsheetId: config.spreadsheetId});
  };
  
  apiObject.api.spreadsheets.values.batchClearByDataFilter = function (/* dataFilters */) {
    return Import.Requests({
      config: {
        discovery: self.discoverValues('batchClearByDataFilter'),
        oauth: 'me',
        method: 'post',
        body: {
          dataFilters: Array.prototype.slice.call(arguments)
        }
      }
    })({spreadsheetId: config.spreadsheetId});
  };
  
  /*
    data is a hash where keys are the range a1notation and values are arrays of intended raw values
  */
  apiObject.api.spreadsheets.values.batchUpdate = function (data) {
    return Import.Requests({
      config: {
        discovery: self.discoverValues('batchUpdate'),
        oauth: 'me',
        method: 'post',
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
  };
  
  apiObject.api.spreadsheets.values.batchUpdateByDataFilter = function (dataFilters) {
    return Import.Requests({
      config: {
        discovery: self.discoverValues('batchUpdateByDataFilter'),
        oauth: 'me',
        method: 'post',
        body: {
          valueInputOption: config.valueInputOption,
          includeValueInResponse: config.includeValueInResponse,
          responseValueRenderOption: config.valueRenderOption,
          responseDateTimeRenderOption: config.dateTimeRenderOption,
          data: Object.keys(dataFilters).reduce(
            function (acc, key) {
              var dataFilterValueRange = {
                dataFilter: {},
                majorDimension: config.dimension,
                values: self.utils.array2ListValues(data[key])
              };
              if (typeof key == 'string')
                dataFilterValueRange.dataFilter.a1Range = key;
              else
                dataFilterValueRange.developerMetadataLookup = key;
              acc.push(dataFilterValueRange);
              return acc;
            }
          )
        }
      }
    })({spreadsheetId: config.spreadsheetId});
  };

  apiObject.api.spreadsheets.values.clear = function (range) {
    return Import.Requests({
      config: {
        discovery: self.discoverValues('clear'),
        oauth: 'me',
        method: 'post'
      }
    })({spreadsheetId: config.spreadsheetId, range: range});
  };
  
  apiObject.api.spreadsheets.values.get = function (range) {
    return Import.Requests({
      config: {
        discovery: self.discoverValues('get'),
        oauth: 'me',
        method: 'get',
        query: {
          valueRenderOption: config.valueRenderOption,
          dateTimeRenderOption: config.dateTimeRenderOption,
        }
      }
    })({spreadsheetId: config.spreadsheetId, range: range});
  };
  
  apiObject.api.spreadsheets.values.batchGet = function (/* ranges */) {
    return Import.Requests({
      config: {
        discovery: self.discoverValues('batchGet'),
        oauth: 'me',
        method: 'get',
        query: {
          ranges: Array.prototype.slice.call(arguments),
          majorDimension: config.dimension,
          valueRenderOption: config.valueRenderOption,
          dateTimeRenderOption: config.dateTimeRenderOption
        },
      }
    })({spreadsheetId: config.spreadsheetId});
  };
  
  apiObject.api.spreadsheets.values.batchGetByDataFilter = function (/* dataFilters */) {
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
      }
    })({spreadsheetId: config.spreadsheetId});
  };
  
  /*
    
  */
  apiObject.api.spreadsheets.values.update = function (rangeA1Notation, values) {
    return Import.Requests({
      config: {
        discovery: self.discoverValues('update'),
        oauth: 'me',
        method: 'put',
        query: {
          valueInputOption: config.valueInputOption,
          includeValuesInResponse: config.includeValuesInResponse,
          responseValueRenderOption: config.valueRenderOption,
          responseDateTimeRenderOption: config.dateTimeRenderOption
        },
        body: {
          range: rangeA1Notation,   // "For output, this range indicates the entire requested range, even though the values will exclude trailing rows and columns"
          majorDimension: config.dimension,
          values: values
        }
      }
    })({spreadsheetId: config.spreadsheetId, range: rangeA1Notation});
  };

  apiObject.api.spreadsheets.sheets.copyTo = function (sheetId, destinationSpreadsheetId) {
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
        }
      }
    })({spreadsheetId: config.spreadsheetId});
  };
  
  return apiObject;
}, 

{
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
  
  utils: {
    convertMetadataValue: function (value) {
      return JSON.stringify(value);
    },
    revertMetadataValue: function (value) {
      return JSON.parse(value);      
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
    })
  },
  
  
}

);
