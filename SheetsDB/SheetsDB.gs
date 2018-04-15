(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"SheetsDB",

function Package (config) {
  config = config || {};  // config for defaults
  config.valueInputOption = config.rawInput ? 'RAW' : 'USER_ENTERED';
  config.valueRenderOption = config.rawOutput ? 'FORMULA' : 'UNFORMATTED_VALUE';
  config.dimension = config.byRows === false ? 'COLUMNS' : 'ROWS';  // Columns only if sent in byRows = false
  config.keyHeaderRow = config.keyHeaderRow || 0;
  config.destInfo = config.destInfo || [];   // for the form!
  config.spreadsheetResource = config.spreadsheetResource || null;
  if (!config.spreadsheetResource) throw Error("Requires a spreadsheet resource");
  
  var self = this;
  
  /*
    The private, main constructor
  */
  var DbSheet = function (ss) {
    this.ss = ss;
    this.plugins = [];
    this.requests = Import.Requests({
      config: {
        oauth: 'me',
      }
    });
  };

  var Session = Import.SheetsDBBSession({
    config: config
  });

  /*
    All errors that occur (except those at object creation) eventually go through here
    Rewraps the calls into better wording errors
    Does not return always throws an error
    FIXME: Instead of using built-in objects, instead use UrlFetch which will streamline this
  */
  var processApiCall = function (err) {
    switch (err.details.code) {
      case 400:   // At the moment all of them are error codes with 400 ... BOOO
        throw Error(err.message)
        break;
      default:
        throw Error("Unimplemented error " + err.detail.error + ", inspect log for details: ");
        break;
    }
  };

  var dbSheetPrototype = {

    // select this, that where that = %
    // converts to select A, C where C = %
    query: function (sheet, select, whereObj) {
      var url;
      url = 'https://docs.google.com/spreadsheets/d/' + this.ss.spreadsheetId + '/gviz/tq';
      return this.requests.get(url, {
        query: {tq: "select A, B"},
      });     
    },
  
    setDimensionAsColumns: function () {
      config.dimension = 'COLUMNS';
    },
    
    setDimensionAsRows: function () {
      config.dimension = 'ROWS'
    },

    /*
     * Called when something changed
     */
    updated: function () {
      this.ss = Sheets.Spreadsheets.get(this.getId());
    },

    ssUpdaterWrapper: function (fn) {
      return function () {
        fn.apply(this, arguments);
        this.updated();
      };
    },
      
    getId: function () {
      return this.ss.spreadsheetId;
    },
    
    api: {
    
      /* 
       * Returns the resource, for obj.ranges is specified then that means we are
       * attempting to retrieve values
       */
      get: function (spreadsheetId, obj) {
        try {
          return Sheets.Spreadsheets.get(spreadsheetId, obj);
        } catch (err) {
          processApiCall(err);
        }
      },
      batchUpdate: function (resource, spreadsheetId) {
        var response;
        try {
          response = Sheets.Spreadsheets.batchUpdate(resource, spreadsheetId);
        } catch (err) {
          processApiCall(err);
        }
        /*
         * updatedSpreadsheet is definiately not returned. Oi vey
         */
        //this.ss = Sheets.Spreadsheets.get(spreadsheetId);
      },
      
      /*
        This is a less efficient way of setting values, but supported
      */
      values: {
        batchUpdate: function (resource, spreadsheetId) {
          var response;
          try {
            response = Sheets.Spreadsheets.Values.batchUpdate(resource, spreadsheetId);
          } catch (err) {
            processApiCall(err);
          }
        },
      }
    },
    
    processBuilder: function (obj) {    
      var resolvedRequests;
      if (obj.headerRequests.length > 0) {
        var priorities;
        priorities  = obj.headerRequests.map(function (m) { 
          return m[1];
        }).sort()
          .filter(function (value, index, self) {
            return self.indexOf(value) === index;
          }
        );
        priorities.forEach(function (priority) {
          var requests; 
          requests = obj.headerRequests.reduce(function (acc, req) {
            var func, requestObj;
            if (req[1] === priority) {
              func = req[0];
              requestObj = func.call(this);
              acc.push(requestObj);
            }
            return acc;
          }.bind(this), []);
          if (requests.length > 0) {
            // Finally, send them up
            this.api.batchUpdate({requests:requests}, this.getId());
            this.updated();
          }
        }.bind(this));
        obj.headerRequests = [];
      }
      
      if (obj.bodyRequests.length > 0) {
        resolvedRequests = obj.bodyRequests.reduce(function (acc, item) {
          var requestObj;
          requestObj = item.call(this);
          acc.push(requestObj);
          return acc;
        }.bind(this), []);

        if (resolvedRequests.length > 0) {
          this.api.batchUpdate({requests:resolvedRequests}, this.getId());
        }
      }
      
      if (obj.valueRequests.length > 0) {
      
        // Check for which tabs to clear by looking through requests and inspecting the range property
        // Thus, only clears tabs that are manipulated in some way, not all tabs
        if (obj._tabsAutoClear) {
          var allSheets = obj.valueRequests.reduce(function (acc, item) {
            acc.push(item.call(this).range.match(/(.*)!/)[1]);  // resovlve it, and inspect
            return acc;
          }.bind(this), []);
          allSheets.filter(function (i, p, a) {
            return a.indexOf(i) == p;
          }).forEach(function (sheetName) {
            this.clearTab(sheetName);  // add the request to the top
          }.bind(this));
        }
        
        // resolve the requests
        resolvedRequests = obj.valueRequests.reduce(function (acc, item) {
          acc.push(item.call(this));
          return acc;
        }.bind(this), []);
        this.api.values.batchUpdate({
          valueInputOption: config.valueInputOption,
          data: resolvedRequests
        }, this.getId());
        
      }
      if (obj.footerRequests.length > 0) {
        resolvedRequests = obj.footerRequests.reduce(function (acc, item) {
          acc.push(item.call(this));
          return acc;
        }, []);
        this.api.batchUpdate({requests:resolvedRequests}, this.getId());  // TODO: What about "empty response" error
      }
    },
    
    makeRequestBuilder: function () {
      return new Session(this);
    }, 
    
  };
  
  var dbSheetPrototype2 = {
  
    valuesBatchUpdate: dbSheetPrototype.ssUpdaterWrapper(function (request) {
      return this.api.values.batchUpdate(request, this.getId());
    }),
    
    getValues: function (range, valueRenderOption) {
      valueRenderOption = valueRenderOption || config.valueRenderOption
      var response = Sheets.Spreadsheets.Values.get(this.getId(), range, {
        majorDimension: config.dimension,
        valueRenderOption: valueRenderOption
      });
      return response.values || [[]];
    },
    
    getFormattedValues: function (range) {
      this.getValues(range, 'FORMATTED_VALUE');
    },
    
    getUnformattedValues: function (range) {
      this.getValues(range, 'UNFORMATTED_VALUE');
    },
    
    getFormulaValues: function (range) {
      this.getValues(range, 'FORMULA');
    },
    
    getGridValues: function (a1Notation, mode) {
      mode = mode || 'userEnteredValue';
      // https://issuetracker.google.com/71334456
      // If --^ gets fixed, this would be a whole lot better

      var response;
      // NOTE: This api call saves back to this.ss, so no need to get the response
      response = this.api.get(this.getId(), {ranges: a1Notation, fields: "properties,sheets(data(startRow,startColumn,rowData(values("+ mode + "))))"});
      if (!response.sheets) {
        throw Error("No data found, does this sheet exist?");
      }
      if (!response.sheets[0].data[0].rowData) {
        throw Error("No row data found!");
      }
      return response.sheets[0].data[0].rowData.reduce(function (acc, row) {
        if (!row.values) return acc;
        var obj;
        obj = row.values.reduce(function (a, r) {
          var o;
          // from fields spec we know there will only be one property (stringValue or booleanValue or formulaValue)
          // so whatever that is, return its value
          for (var p in r[mode]) {
            o = r[mode][p];
          }
          a.push(o);
          return a;
        }, []);
        acc.push(obj);
        return acc;
      }, []);
    },
    getUserEnteredValues: function (a1Notation) {
      return this.getGridValues(a1Notation, 'userEnteredValue');
    },
    
    clearRange: function (range) {
      Sheets.Spreadsheets.Values.clear({}, this.getId(), range);
    },
    
    clearTab: function (tabTitle) {
      var targetTab;
      targetTab = this.getSheets().filter(function (sheet) {
        return sheet.properties.title == tabTitle;
      });
      if (targetTab && targetTab.length == 1) {
        this.clearRange(tabTitle + '!1:' + targetTab[0].properties.gridProperties.rowCount.toString());
      }
    },

    /*
      Converts a1notation used with "this" the spreadsheet so that it returns gridRange
      https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#GridRange
      Reminder that the endRowIndex and endColumnIndex are not defined if boundless, and are
      the open part of the "half open" (beware one-off errors!)
    */
    a1notation2gridrange: function (a1notation) {
      var data, co1, co2, sheetId;
      data = a1notation.match(/(^.+)!(.+):(.+$)/);
      if (data == null) {
        data = a1notation.match(/(.+):(.+$)/);
        if (data == null) {
          data = a1notation.match(/(^.+)!(.+$)/);
          if (data == null) return { sheetId: this.getSheetId(a1notation),};
          data.push("");   // make data[3] nothing so co2 will be null
        } else {
          data.splice(1, 0, null);  // insert null for sheet, as first match worked
        }
      }
      sheetId = (data[1] == null) ? null : this.getSheetId(data[1]);
      co1 = data[2].match(/(\D+)(\d+)/);
      co2 = data[3].match(/(\D+)(\d+)/);
      var gridRange, startColumnIndex, endColumnIndex;
      if (co1)
        startColumnIndex = self.utils.str_to10(co1[1]);
      else
        startColumnIndex = self.utils.str_to10(data[2]);
      if (co2)
        endColumnIndex = self.utils.str_to10(co2[1], 1);
      else
        if (data[3]) 
          endColumnIndex = self.utils.str_to10(data[3], 1);
        else
          endColumnIndex = null;
      gridRange = {
        sheetId: sheetId,
        startRowIndex: co1 ? parseInt(co1[2], 10) - 1 : null,
        endRowIndex: co2 ? parseInt(co2[2], 10) : null,
        startColumnIndex: startColumnIndex,
        endColumnIndex: endColumnIndex,
      };
      if (gridRange.startRowIndex == null) delete gridRange.startRowIndex;
      if (gridRange.endRowIndex == null) delete gridRange.endRowIndex;
      return gridRange;
    },
    
    /* 
      @param  {Number,String}  sheet    if number, returns the sheet at index
                                        if name, return the sheet that has that name
      @throws {Error}                   if sheet is not a number or not a string
      @return {Object}                  returns the target sheet object
      
      @TODO: Use network call to update
    */
    getSheet: function (sheet) {
      if (typeof sheet == "number") {
        for (var i = 0; i < this.ss.sheets.length; i++) {
          if (this.ss.sheets[i].properties.sheetId == sheet) return this.ss.sheets[i];
        }
        return null;
      }
      if (typeof sheet == "string") {
        var sheetName = sheet.split("!")[0];  // take out the
        for (var i = 0; i < this.ss.sheets.length; i++) {
          if (this.ss.sheets[i].properties.title == sheetName) return this.ss.sheets[i];
        }
        return null;
      }
      throw new Error("Passed in " + typeof sheet + " into getSheet");
    },
    getSheetId: function (sheet) {
      var ret;
      ret = this.getSheet(sheet);
      if (!ret) throw Error("No sheet '" + sheet + "'");
      return ret.properties.sheetId;
    },
    getSheets: function () {
      return this.ss.sheets;
    },

    /* 
      toRange: Convenience function to convert variables into a A1Notation string
      @return {String}     Legal A1Notation
    */
    toRange: function (title, left, right) {
      if (title.indexOf(' ') !== -1)
        title = "'" + title + "'";
      if (typeof right === 'undefined')
        return title + '!' + left.toString() + ':' + left.toString();
      else
        return title + '!' + left.toString() + ':' + right.toString();
    },
    
    /*
     * Returns an object useful 
     */
    getActiveInfo: function () {
      var ss, sheet, range, col, row;
      ss = SpreadsheetApp.getActiveSpreadsheet();
      sheet = SpreadsheetApp.getActiveSheet();
      range = SpreadsheetApp.getActiveRange();
      col = range.getA1Notation().match(/[A-Z]+/)[0];
      row = range.getA1Notation().match(/[0-9]+/)[0];
      
      return {
        iAmActive: ss.getId() == this.getId(),
        sheet: sheet,
        range: range,
        ss: ss,
        activeSsId: ss.getId(),
        activeRange: range.getA1Notation(),
        activeA1Notation: sheet.getName() + '!' + range.getA1Notation(),
        activeSheet: sheet.getName(),
        activeRow: row,
        activeColumn: col,
      }
    },

    getHeaders: function (sheet) {
      var sht, numHeaders, values
      sht = this.getSheet(sheet);
      if (!sht) // may be either undefined or null
        return [[]];
      numHeaders = sht.properties.gridProperties.frozenRowCount || 1;
      if (numHeaders == 0) 
        return [[]];
      
      // Fill in the remaining in case of empty spaces
      values = this.getValues(this.toRange(sht.properties.title, 1, numHeaders));
      if (values.length < numHeaders) {
        var emptyRow = [], howManyColumns;
        howManyColumns = Math.max(values.reduce(function (acc, row) {
          acc.push(row.length);
          return acc;
        }, []));
        for (var i = 0; i < howManyColumns; i++) {
          emptyRow.push("");
        }
        for (var j = 0; j < (numHeaders - values.length); i++) {
          values.push(emptyRow);          
        }
      }
      return values;
    },
    
    getRange: function ( ) {
      var ss = SpreadsheetApp.openById(this.getId());
      return ss.getRange.apply(ss, arguments);
    },
    
    argsToGrid: function () {
      if (arguments.length == 1 && typeof arguments[0] == 'string')
        return this.a1notation2gridrange(arguments[0]);
      else if (arguments.length == 1 && typeof arguments[0] == 'object')
        return arguments[0];
      else
        throw Error("Unknown args sent to argsToGrid");
    },
    
    gridToA1Notation: function (grid) {
      var sheetDef, left, right;
      if (Object.keys(grid).length == 1 && typeof grid.sheetId != undefined)
        return this.getSheet(grid.sheetId).properties.title;
      sheetDef = grid.sheetId == null ? "" : this.getSheet(grid.sheetId).properties.title;
      // handle A:A and 1:2 types
      if (grid.startRowIndex == null && grid.endRowIndex == null) {
        var col = self.utils.zeroIndexedToColumnName(grid.startColumnIndex);
        return sheetDef + '!' + col + ":" + col;
      } else if (grid.startColumnIndex == undefined && grid.endColumnIndex == undefined) {
        return sheetDef + '!' + grid.startRowIndex + ":" + grid.startRowIndex;
      }
      left = self.utils.zeroIndexedToColumnName(grid.startColumnIndex) + (grid.startRowIndex + 1).toString();
      right = self.utils.zeroIndexedToColumnName(grid.endColumnIndex-1) + (grid.endRowIndex ? grid.endRowIndex : "");  // one off potential here...
      return sheetDef + '!' + left + (right == "" || left == right ? "" : ":" + right);
    },
    
    expandGridToDataTable: function (grid) {
      // FIXME: This doesn't do the same as getDataRange
      var sheet;
      sheet = this.getSheet(grid.sheetId);
      grid.startColumnIndex = 0;
      grid.endColumnIndex = sheet.properties.gridProperties.columnCount + 1;
      var fr = sheet.properties.gridProperties.frozenRowCount;
      grid.startRowIndex = fr != null ? fr : 0;
      grid.endRowIndex = sheet.properties.gridProperties.rowCount + 1;
      return grid;
    },
    
    toObject: function () {
      var grid, a1notation, headers, obj, objGrid, heading;
      grid = this.argsToGrid.apply(this, arguments);
      a1notation = this.gridToA1Notation(grid);
      headers = this.getHeaders(grid.sheetId);
      headings = headers[config.keyHeaderRow];  // headings to use as keys
      obj = {columns: {}};
      for (var h = 0; h < headers.length; h++) {
        heading = headings[h];
        obj[heading] = {
          value: this.getUserEnteredValues(a1notation),
          a1Notation: a1notation,
          grid: grid,
          headers: headers[h],
          c: grid.startColumnIndex,
          r: grid.startRowIndex,
          column: self.utils.zeroIndexedToColumnName(h),
          row: (grid.startRowIndex+1).toString(),
        }
        obj.columns[heading] = self.utils.zeroIndexedToColumnName(h) + (grid.startRowIndex+1).toString();
      }
     
      return obj;
    },
    
    /*
      Uses the sheet's headers and range values and converts them into the properties
      
      @param {string} rangeA1Notation    The range string 
      @param {object} sheet, left, right
      @returns {List[Object]}
    */
    toObjects: function () {
      var grid, a1notation, headers, numHeaders, headings, values, range, rowOffset, columnOffset;
      grid = this.argsToGrid.apply(this, arguments);
      grid = this.expandGridToDataTable(grid);
      a1notation = this.gridToA1Notation(grid);
      
      headers = this.getHeaders(grid.sheetId);
      numHeaders = headers.length;
      headings = headers[config.keyHeaderRow];  // headings to use as keys
      values = this.getUserEnteredValues(a1notation);
      
      // Ensure to adjust the offset to enture it is after headers
      if (grid.startRowIndex == undefined || grid.startRowIndex < headers.length) {
        rowOffset = numHeaders;
        values = values.slice(numHeaders);
      } else {
        rowOffset = grid.startRowIndex || numHeaders;
      }
      columnOffset = grid.startColumnIndex || 0;
      headers = self.utils.transpose(headers);  // transpose so we can refehence by column below
      var ro, co, header, heading, obj, objGrid, ret = [];
      
      // Loop through the values
      // We need to use headings.length in nested loop to ensure that
      // even columns at the end that are blank come through
      for (var r = 0; r < values.length; r++) {
        ro = r + rowOffset;
        obj = {columns: {}};
        for (var c = 0; c < headings.length; c++) {
          co = c + columnOffset;
          heading = headings[c];
          objGrid = {
            sheetId: grid.sheetId,
            startRowIndex: ro,
            startColumnIndex: c,
            endRowIndex: ro + 1,
            endColumnIndex: c + 1
          },
          obj[heading] = {
            value: values[r][c],
            a1Notation: this.gridToA1Notation(objGrid),
            grid: objGrid,
            headers: headers[c],
            c: co,
            r: ro,
            column: self.utils.zeroIndexedToColumnName(c),
            row: (ro+1).toString(),  /* one-off errors are a real bleep */
          };
          obj.columns[heading] = self.utils.zeroIndexedToColumnName(c) + (ro+1).toString();
        }
        ret.push(obj);
      }
      return ret;
    },

    setKeyHeadingRow: function (value) {
      config.keyHeaderRow = value - 1;  // a1notation is 1-index, might as well keep that part consistent
    },
     
    registerPlugin: function (description, func) {
      this.plugins.push({description: description, func: func});
    },
    
    clearPlugins: function () {
      this.plugins = [];
    },
  
    /* FIXME: This is WRONG and confusing */
    insertRow: function (range, row) {
      return Sheets.Spreadsheets.Values.append({
        majorDimension: config.dimension,
        values: [row]
      }, this.getId(), range, {
        valueInputOption: config.valueInputOption,
        insertDataOption: "INSERT_ROWS",
      });
    },
      
    getPluginsOverwriteBuildRequests: function (rangeA1Notation) {
      var objs, grid, ret = [];
      objs = this.toObjects(rangeA1Notation);  // convert to A1
      grid = this.a1notation2gridrange(rangeA1Notation);

      // Cycle through the plugins
      var plugin, res;
      for (var pluginIndex = 0; pluginIndex < this.plugins.length; pluginIndex++) {
        plugin = this.plugins[pluginIndex];
        res = objs.reduce(function (a, obj) {
          var prop, objValue, targetHeader, regexp, match, newValue;
          for (prop in obj) {
            if (prop == 'columns')
              continue;
            
            objValue = obj[prop];
            targetHeader = objValue.headers[plugin.description.entryPoint.header - 1];
            if (typeof targetHeader == 'undefined') {
              throw Error("No target header found for headers: " + objValue.headers);
            }
            if (plugin.description.match)
              regexp = new RegExp(plugin.description.match);
            else
              regexp = new RegExp('^' + plugin.description.name + '$');
            match = targetHeader.match(regexp);
            if (match) {
              newValue = plugin.func(objValue, {header: targetHeader, objects: objs}, self.utils);
              var type = typeof newValue;
              if (type === 'object') {
                newValue = JSON.stringify(newValue);
              } else if ((type === 'string') || (newValue instanceof String)) {
                newValue = self.utils.format(newValue, objValue);  // overwrites
                newValue = self.utils.format(newValue, obj.columns);
              }
              a.push({
                values: [[newValue]],
                a1Notation: objValue.a1Notation,
                grid: objValue.grid
              });
            }
          }
          return a;
        }, []);
        ret.push(res);
      }
      
      return ret.reduce(function (acc, row) {
        var objs;
        objs = row.filter(function (obj) { /* filter out those not within the range of a1notation */
          if (grid.endColumnIndex === undefined && grid.endRowIndex === undefined)
            return grid.startColumnIndex == grid.startColumnIndex && grid.startColumnIndex == grid.startRowIndex;
          else
            return ((grid.startColumnIndex === undefined) || (obj.grid.startColumnIndex >= grid.startColumnIndex)) && 
                   ((grid.endColumnIndex === undefined) || (obj.grid.endColumnIndex <= grid.endColumnIndex)) && 
                   ((grid.startRowIndex === undefined) || (obj.grid.startRowIndex >= grid.startRowIndex)) &&
                   ((grid.endRowIndex === undefined) || (obj.grid.endRowIndex <= grid.endRowIndex));
        });
        if (objs.length > 0) acc.push(objs);
        return acc;
      }, []);
    },

    overwriteWithPlugins: function (rangeA1Notation) {
      var requests = this.getPluginsOverwriteBuildRequests(rangeA1Notation);

      // Add value requests from results and allow the sheet to update
      this.withSession(function (session) {
        requests.forEach(function (pluginItems) {
          pluginItems.forEach(function (item) {
            session.setValues(item.a1Notation, item.values);
          });
        });
      });
    },

    inputValues: function (rangeNotation, values) {
      var request = {
        valueInputOption: config.valueInputOption,
        data: [
          {
            range: rangeNotation,
            majorDimension: config.dimension,
            values: values
          }
        ]
      };
      return this.valuesBatchUpdate(request);
    },

    getFormattedValues: function (range) {
      return this.getValues(range, 'FORMATTED_VALUE');
    },

    getUnformattedValues: function (range) {
      return this.getValues(range, 'UNFORMATTED_VALUE');
    },
 
    getFormulaValues: function (range) {
      return this.getValues(range, 'FORMULA_VALUE');
    },
      
    getColumnValues: function (range, column) {
      saved = config.dimension;
      this.setDimensionAsColumns();
      var values = this.getValues(range);
      config.dimension = saved;
      return values[column].slice();
    },
      
    addSheets: function (sheets) {
      //Logger.log(_ss.sheets);
    },
      
    getDestinationInfo: function () {
      return config.destInfo;
    },
      
    setDestinationForForm: function (formCreationFunc) {
      var before = [];
        
      var ctx = self.contextManager({
        enter: function (form) {
          this.getSheets().forEach(function (b) {
            var id = b.properties.sheetId;
            before.push(id);
          });
          return form;
        },
        exit: function (form) {
          if (typeof form === 'undefined') {
            config.destInfo.push({id: null, sheetId: null, error: "Did not pas form into exit"});
            return;
          }
          form.setDestination(FormApp.DestinationType.SPREADSHEET, this.getId());
          var after = null;
          this.getSheets().forEach(function (a) {
            if (before.indexOf(a.properties.sheetId) === -1) {
              after = a;
              }
          });
          if (after == null) {
            config.destInfo.push({id: null, sheetId:null, error: "Could not detect after creation."});
          } else {
            config.destInfo.push({id: this.getId(), sheet: after, sheetId: after.properties.sheetId, index: after.properties.index, error: false});
          }
        }
      });
      ctx.call(this, formCreationFunc);
        
      return config.destInfo;
    },
    
    withSession: dbSheetPrototype.ssUpdaterWrapper(Import.ContextManager().call(this, {
      enter: function (obj) {
        obj.bodyRequests = [];
        obj.headerRequests = [];
        obj.valueRequests = [];
        obj.footerRequests = [];
        return [obj];
      },
      exit: dbSheetPrototype.processBuilder,
      onError: function (err, obj) {
        /* Check to see if it's a TypeError, which probably means that something like
           session.wrong was used. If not thrown here, results in confusing message later down in the stack */
        if (err instanceof TypeError)
          throw TypeError('Session object: ' + err.message);
      },
      params: function () { return [this.makeRequestBuilder()]; },  // new Session(this)
    })),
    
  };  // DbSheet()

  DbSheet.prototype = self.utils.assign(dbSheetPrototype, dbSheetPrototype2);
  
  /*
     customBuilder allows end user devs define a function that has 'this'
     as the builder object
  */
  self.extend.customBuilder = function (definition) {    
    var namespace;
    for (namespace in definition) {
      Session.prototype[namespace] = definition[namespace];
    }
  };
  
  return new DbSheet(config.spreadsheetResource);

},

{ // plugins!
  extend: {
    registered: [],
    registerInit: function (func) {
      this.registered.push(func);
    },
    execInitCallbacks: function (dbObj) {
      if (this.registered) {
        this.registered.forEach(function (func) {
          func.call(this, dbObj);
        });
      }
    }
  },

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
  
    /*
      http://www.{name}.com, {name: 'hey'} => http://www.hey.com
    */
    format: function (template /*, objs */) {
      //  ValueError :: String -> Error
      var transformers = {}; // TODO: Do we need transformers? If so, need to refactor
      var ValueError = function(message) {
        var err = new Error(message);
        err.name = 'ValueError';
        return err;
      };
    
      //  defaultTo :: a,a? -> a
      var defaultTo = function(x, y) {
        return y == null ? x : y;
      };
      
      var lookup = function(obj, path) {
        if (!/^\d+$/.test(path[0])) {
          path = ['0'].concat(path);
        }
        for (var idx = 0; idx < path.length; idx += 1) {
          var key = path[idx];
          obj = typeof obj[key] === 'function' ? obj[key]() : obj[key];
        }
        return obj;
      };
    
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
          } else if (Object.prototype.hasOwnProperty.call(transformers, xf)) {
            return transformers[xf](value);
          } else {
            throw ValueError('no transformer named "' + xf + '"');
          }
        }
      );
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
      return (str.length > 1) ? this.utils.str_to10(str.substr(1, str.length - 1), val) : val;
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
        headerColor: this.utils.hexToColor(headerHex),
        firstBandColor: this.utils.hexToColor(firstBandHex),
        secondBandColor: this.utils.hexToColor(secondBandHex),
        footerColor: this.utils.hexToColor(footerHex),
      }
    },
  },
},

{  // creators

  withTempSpreadsheet: function (/* arg1, arg2 */) {
    var func, config;
    if (arguments.length === 2) {
      func = arguments[1];
      config = arguments[0];
    } else if (arguments.length == 1) {
      func = arguments[0];
      config = {};
    }

    var makeTemp = function (title) {
      title = title || "Temporary";
      return [this.new_(title, config)];
    }.bind(this);
    
    var destroyTemp = function (tmp) {
      /*
        Interface with the drive api and delete the temporary file
        Add the oauth scope in the manifest
      */
      var global = function () { return this; }.apply(null, []);
      UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files/" + tmp.getId(), {
        headers: {
          Authorization: "Bearer " + global["Script" + "App"].getOAuthToken(),
        },
        method: 'delete',
        muteHttpExceptions: false
      });
    };
    
    Import.ContextManager().apply(this, [func, {
      enter: makeTemp,
      exit: destroyTemp
    }]);
  },
  withTempDontDelete: function (func) {
    var makeTemp = function (title) {
      title = title || "Temporary";
      return [this.new_(title, config)];
    }.bind(this);

    Import.ContextManager().apply(this, [func, {enter: makeTemp}]);
  },
  
  fromId: function (spreadsheetId, config) {
    config = config || {};
    config.spreadsheetResource = Sheets.Spreadsheets.get(spreadsheetId);
    return this({config: config});
  },
  fromRange: function (range, config) {
    config = config || {};
    return this.fromId(range.getSheet().getParent().getId(), config);
  },
  fromProperties: function (resource, config) {
    config = config || {};
    config.spreadsheetResource = Sheets.Spreadsheets.create(resource);
    return this({config: config});
  },
  new_: function (title, config) {
    title = title || "Untitled";
    config = config || {};
    return this.fromProperties({properties: {title: title}}, config);
  },
  fromActiveSpreadsheet: function (config) {
    var ss;
    ss = SpreadsheetApp.getActiveSpreadsheet();
    return this.fromId(ss.getId(), config);
  }
}

);