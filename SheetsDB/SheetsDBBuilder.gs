(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"SheetsDBBSession",

function SessionPackage_ (options) {
  var self = this;
  
  var SessionObj = function (dbsheet) {
    this.dbsheet = dbsheet;
    this.valuesSortBy = null;
    this.headerRequests = [];
    this.bodyRequests = [];
    this.valueRequests = [];
    this.footerRequests = [];
    this._tabsAutoClear = false;
  };
  
  var builderObj_prototype1 = {
    utils: {
      transpose: self.utils.transpose,
      rowArrayToUserEnteredValues: function (rowArray) {
        return rowArray.reduce(function (acc, row) {
          var obj;
          obj = row.reduce(function (a, v) {
            var o;
            o = {
              userEnteredValue: {},
            }
            var kind = null;
            switch (typeof v) {
              case "string":
                if (v[0] == '=') {
                  kind = "formulaValue";
                } else { 
                  // FIXME: What about nanoseconds, ISO 8601 includes this 2015-10-03T01:00:00Z
                  var match = v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\+(\d{2}):(\d{2})$/);
                  if (match !== null) {
                    kind = "formulaValue";
                    v = '=DATEVALUE("' + match[2] + "/" + match[3] + "/" + match[1] + '")';
                  } else {
                    kind = "stringValue";
                  }
                }
                break;
              case "number":
                kind = "numberValue";
                break;
              case "boolean":
                kind = "boolValue";
                break;
              case "object":
                if (v === null) {
                  kind = "stringValue";
                  v = "";
                } else {
                  kind = "stringValue";
                  v = JSON.stringify(v);
                }
                break;
              case "undefined":
                kind = "stringValue";
                v = "";
                break;
              default:
                throw Error("Unknown type value " + typeof(v) + " sent to updateCell");
            }
            o.userEnteredValue[kind] = v;
            a.push(o);
            return a;
          }, []);
          acc.push({values: obj});
          return acc;
        }, []);
      }
    },
    addValueRequest: function (fn) {
      return function () {
        var request = fn.apply(this, arguments);
        this.valueRequests.push(request);
        return this;
      };
    },
    
    addBodyRequest: function (fn) {
      return function () {
        var request, important;
        request = fn.apply(this, arguments);
        important = ['NewTab', 'SetNumColumns', 'SetNumRows'].indexOf(fn.name);        
        if (important !== -1) {
          this.headerRequests.push([request, important]);
        } else {
          this.bodyRequests.push(request);
        }
        return this;
      }
    },
    
    addPostRequest: function (fn) {
      return function () {
        var request = fn.apply(this, arguments);
        this.footerRequests.push(request);
        return this;
      }
    },
  };
  
  var builderObj_prototype2 = {
    commit: builderObj_prototype1.addBodyRequest(
      function () {
        return function () {
          return {commit: true};
        }
      }
    ),
    
    tabsAutoClear: function () {
      this._tabsAutoClear = true;
    },
    
    setValuesSortByIndex: function (sortBy) {
      this.valuesSortBy = sortBy;
    },
    
    toRange: function (title, left, right) {
      if (title.indexOf(' ') !== -1)
        title = "'" + title + "'";
      if (typeof right === 'undefined')
        return title + '!' + left.toString() + ':' + left.toString();
      else
        return title + '!' + left.toString() + ':' + right.toString();
    },
    
    /*
     * columns first because that is same as a1Notation
     */
    updateCells: builderObj_prototype1.addBodyRequest(
      function (sheet, colIndex, rowIndex, rowArray) {
        return function () {
          return {
            updateCells: {
              rows: builderObj_prototype1.utils.rowArrayToUserEnteredValues(rowArray),
              fields: '*',
              start: {
                sheetId: this.getSheet(sheet).properties.sheetId,
                columnIndex: colIndex,
                rowIndex: rowIndex,
              },
            }
          }
        };
      }
    ),
    
    updateCellsWithClear: builderObj_prototype1.addBodyRequest(
      function (sheet, rowIndex, colIndex, rowArray) {
        return function () {
          var sht;
          sht = this.getSheet(sheet);
          return {
            updateCells: {
              rows: builderObj_prototype1.utils.rowArrayToUserEnteredValues(rowArray),
              fields: '*',
              range: {
                sheetId: sht.properties.sheetId,
                startRowIndex: rowIndex,
                startColumnIndex: colIndex,
                endRowIndex: sht.properties.gridProperties.rowCount,
                endColumnIndex: sht.properties.gridProperties.columnCount,
              }
            }
          }
        };
      }
    ),
    
    setValues: builderObj_prototype1.addValueRequest(
      function () {
        if (arguments.length == 0) throw Error("Cannot have setValues with zero args");
        var title, left, right, range;

        if (arguments.length == 2) {
          range = arguments[0];
        } else {
          title = arguments[0];
          left = arguments[1];
          if (arguments.length == 4) right = arguments[2];
          else if (arguments.length == 3) right = undefined;
          else throw Error("setValues must be either 2, 3, or 4 arguments");
          range = this.toRange(title, left, right);
        }
        
        var values;
        values = arguments[arguments.length-1];
        return function () {
          return {
            majorDimension: options.dimension,
            range: range,
            values: values
          }
        }
      }
    ),
    
    insertRows: builderObj_prototype1.addBodyRequest(
      function (sheet, startRow, endRow) {
        return function () {
          return {
            insertDimension: {
              range: {
                sheetId: this.getSheet(sheet).properties.sheetId,
                dimension: "ROWS",
                startIndex: startRow,
                endIndex: endRow
              },
              inheritFromBefore: true,
            }
          }
        }
      }
    ),
    
    insertRow: function (sheet, startRow) {
      this.insertRows(sheet, startRow, startRow+1);
      return this;
    },
    
    insertColumns: builderObj_prototype1.addBodyRequest(
      function (sheet, startCol, endCol) {
        return function () {
          return {
            insertDimension: {
              range: {
                sheetId: this.getSheet(sheet).properties.sheetId,
                dimension: "COLUMNS",
                startIndex: startCol,
                endIndex: endCol
              },
              inheritFromBefore: true,
            }
          }
        }
      }
    ),
    
    
    setNumColumns: builderObj_prototype1.addBodyRequest(
      function SetNumColumns (sheet, numCols) {
        return function SetNumColumns () {
          return {
            updateSheetProperties: {
              properties: {
                sheetId: this.dbsheet.getSheetId(sheet),
                gridProperties: {
                  columnCount: numCols,
                }
              },
              fields: 'gridProperties.columnCount',
            }
          };
        }.bind(this);
      }
    ),
    
    hideGridlinesRequest: builderObj_prototype1.addBodyRequest(
      function (sheet, bool) {
        return function () {
          return { 
            updateSheetProperties: {
              properties: {
                sheetId: this.dbsheet.getSheet(sheet).properties.sheetId,
                gridProperties: {
                  hideGridlines: bool,
                }
              },
              fields: 'gridProperties.hideGridlines',
            }
          };
        }.bind(this);
      }
    ),
    
    setNumRows: builderObj_prototype1.addBodyRequest(
      function SetNumRows (sheet, numRows) {
        return function SetNumRows () {
          return {
            updateSheetProperties: {
              properties: {
                sheetId: this.dbsheet.getSheet(sheet).properties.sheetId,
                gridProperties: {
                  rowCount: numRows,
                }
              },
              fields: 'gridProperties.rowCount',
            },
          };
        }.bind(this);
      }
    ),
    
    /*
      In addition to a freezeRows request, it can set the keyHeadingRow which is an option
      that allows us to define which row in the header to look at
     */
    freezeRows: builderObj_prototype1.addBodyRequest(
      function (sheet, numRows, headerRow) {
        headerRow = headerRow || numRows;
        this.dbsheet.setKeyHeadingRow(headerRow);
        return function () {
          return {
            updateSheetProperties: {
              properties: {
                sheetId: this.dbsheet.getSheet(sheet).properties.sheetId,
                gridProperties: {
                  frozenRowCount: numRows,
                }
              },
              fields: 'gridProperties.frozenRowCount',
            },
          };
        }.bind(this);
      }
    ),
    
    freezeColumns: builderObj_prototype1.addBodyRequest(
      function (sheet, numCols) {
        return function () {
          return {
            updateSheetProperties: {
              properties: {
                sheetId: this.dbsheet.getSheet(sheet).properties.sheetId,
                gridProperties: {
                  frozenColumnCount: numCols,
                }
              },
              fields: 'gridProperties.frozenColumnCount',
            },
          };
        }.bind(this);
      }
    ),
    
    changeTabColor: builderObj_prototype1.addBodyRequest(
      function (sheet, red, green, blue, alpha) {
        if (typeof alpha === 'undefined')
          alpha = 1;
        return function () {
          return {
            updateSheetProperties: {
              properties: {
                sheetId: this.dbsheet.getSheet(sheet).properties.sheetId,
                tabColor: {
                  red: red,
                  green: green,
                  blue: blue,
                  alpha: alpha
                }
              },
              fields: 'tabColor',
            }
          };
        }.bind(this);
      }
    ), 
    
    newTab: builderObj_prototype1.addBodyRequest(
      function NewTab (title) {
        return function NewTab () {
          return {
            addSheet: {
              properties: {
                title: title
              }
            },
          };
        }.bind(this);
      }
    ),    
    
    tabTitleRequest: builderObj_prototype1.addBodyRequest(
      function (sheet, title) {
        return function () {
          return {
            updateSheetProperties: {
              properties: {
                sheetId: this.dbsheet.getSheet(sheet).properties.sheetId,
                title: title,
              },
              fields: 'title',
            },
          }
        }.bind(this);
      }
    ),
    
    /*
     * range: a1notation | gridrange
     */
    sort: builderObj_prototype1.addBodyRequest(
      function (range, dimensionIndex, sortOrder) {
        return function () {
          return {
            sortRange: {
              range: this.dbsheet.argsToGrid(range),
              sortSpecs: {
                dimensionIndex: dimensionIndex || 0,
                sortOrder: sortOrder || 'ASCENDING',
              },
            }
          }
        }.bind(this);
      }
    ),

    addBand: builderObj_prototype1.addBodyRequest(
      function (range, first, second, third, fourth) {
        return function () {
          return {
            addBanding: {
              bandedRange: {
                range: this.dbsheet.argsToGrid(range),
                rowProperties: self.utils.makeBandingProperties(first, second, third, fourth),
              },
            },
          }
        }.bind(this);
      }
    ),
    
    updateBand: builderObj_prototype1.addBodyRequest(
      function (bandId, range, first, second, third, fourth) {
        return function () {
          return {
            updateBanding: {
              bandedRange: {
                bandedRangeId: bandId,
                range: this.dbsheet.argsToGrid(range),
                rowProperties: self.utils.makeBandingProperties(first, second, third, fourth),
              },
              fields: "*",
            },
          }
        }.bind(this);
      }
    ),


  };
  
  SessionObj.prototype = self.utils.assign(builderObj_prototype1, builderObj_prototype2);
  
  return SessionObj;
},

{
  utils: {  /* Utility functions */
  
    /*
      return object that takes both
    */
    assign: function (target, varArgs) { // .length of function is 2
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }
      
      var to = Object(target);
      
      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        
        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
  
    transpose: function (arr) {
      return Object.keys(arr[0]).map(function(column) {
        return arr.map(function(row) { return row[column]; });
      });
    },
    zeroIndexedToColumnName: function (n) {
      var ordA = 'A'.charCodeAt(0);
      var ordZ = 'Z'.charCodeAt(0);
      var len = ordZ - ordA + 1;
        
      var s = "";
      while(n >= 0) {
        s = String.fromCharCode(n % len + ordA) + s;
        n = Math.floor(n / len) - 1;
      }
      return s;
    },
    str_to10: function(str, base) {
      var lvl = str.length - 1;
      var val = (base || 0) + Math.pow(26, lvl) * (str[0].toUpperCase().charCodeAt() - 64 - (lvl ? 0 : 1));
      return (str.length > 1) ? self.utils.str_to10(str.substr(1, str.length - 1), val) : val;
    },
    hexToColor: function (hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          red: Math.floor(parseInt(result[1], 16) * 255),
          green: Math.floor(parseInt(result[2], 16) * 255),
          blue: Math.floor(parseInt(result[3], 16) * 255),
          alpha: 1,
      } : null;
    },
    makeBandingProperties: function (headerHex, firstBandHex, secondBandHex, footerHex) {
      return {
        headerColor: self.utils.hexToColor(headerHex),
        firstBandColor: self.utils.hexToColor(firstBandHex),
        secondBandColor: self.utils.hexToColor(secondBandHex),
        footerColor: self.utils.hexToColor(footerHex),
      }
    },
  }
},

{}

);