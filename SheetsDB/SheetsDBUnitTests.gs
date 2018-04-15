function testing_dbsheets() {
  var DBSheets;
  DBSheets = Import.SheetsDB;
  Import.UnitTesting.init();
  Import.FormatLogger.init();

  DBSheets.withTempSpreadsheet(function (tmp) {
    tmp.withRequestBuilder(function (rb) {
      // Make tabs that are needed below
      rb.newTab('newapi')
        .newTab('calcrows')
        .newTab('calccols')
        .newTab('headers')
        .newTab('Values')
        .newTab('appends')
        .newTab('autoclear')
        .newTab('plugin')
        .newTab('templates')
        .newTab('formulatemplates')
        .newTab('unique')
        .newTab('uber')
        .newTab('insert')
        .newTab('updateCells');
    });
  
    describe("setValues api with rb.transpose and formulas", function () {
      it("last definition holds, formulas resolve", function () {
        tmp.withSession(function (session) {
          session.setValues('newapi!A1', [['hi', 'there', 'everyone']])
                 .setValues('newapi', 'A2', [['hello']])
                 .setValues('newapi', 4, [['d4', 5, 6, 7]])
                 .setValues('newapi', 'D4', 'D', rb.transpose([[100, 5, 6, 7]]))
                 .setValues('newapi', 'D8', [['=SUM(D4:D7)']]);
        });
        var data = tmp.getEffectiveValues('newapi!A1:D8'); 
        assert.arrayEquals({
          expected: [['hi', 'there', 'everyone'], ['hello'], [], ['d4', 5, 6, 100], ['','','',5], ['','','',6], ['', '','', 7], ['','','', 118]],
          actual: data
        });
      });
    });
    
    describe("setValues api with new tab", function () {
      it("new tabs and long rows can be added in the same block", function () {
        var longRow = [];
        for (var l = 0; l < 50; l++) {
          longRow.push('hi');
        }
        tmp.withSession(function (rb) {
          rb.newTab('NewTab')
            .newTab('AnotherTab')
            .setValues('NewTab!A1', [['hi']])
            .setNumColumns('NewTab', 50)
            .setNumRows('NewTab', 1)
            .setValues('AnotherTab!A1', [['hi']])
            .setValues('NewTab', [longRow]);
        });
        var data = tmp.getEffectiveValues('NewTab!A1');
        assert.arrayEquals({
          expected: [['hi']],
          actual: data
        });
      });
    });
    
    describe("Initialization", function () {
      it("from range", function () {
        var range = tmp.getRange('Sheet1!A1:A');
        var result = DBSheets.fromRange(range);
        assert.equals({expected: tmp.getId(), actual: result.getId()});
      });  
    });    
    
    describe("Setting formulas", function () {
      it("Calculates with row dimension", function () {
        tmp.setDimensionAsRows();
        var a1Notation = 'calcrows!A1:D1';
        tmp.inputValues(a1Notation, [["Hey", "there", "=3+1"]]);
        var values = tmp.getEffectiveValues(a1Notation);
        assert.arrayEquals({expected: [["Hey", "there", 4]], actual: values});
        tmp.clearRange(a1Notation);
      });
      
      it("Calculates with columns dimension", function () {
        tmp.setDimensionAsColumns();
        var a1Notation = 'calccols!A1:D1';
        tmp.inputValues(a1Notation, [["Hey"], ["there"], ["=3+1"]]);
        var values = tmp.getEffectiveValues(a1Notation);
        assert.arrayEquals({expected: [["Hey"], ["there"], [4]], actual: values}); 
        tmp.setDimensionAsRows();  // TODO: Make this a context manager?
      });
      
      it("appends by moving down row", function () {
        tmp.inputValues('appends!A3:E3', [['this', 'is', 'the', 'third', 'row']]);
        
        var a1Notation = 'appends!1:1';
        var result = tmp.insertRow(a1Notation, ["Hey", "there", "=3+1"]);
        var values = tmp.getEffectiveValues(a1Notation);
        assert.arrayEquals({expected: [["Hey", "there", 4]], actual: values});
        values = tmp.getEffectiveValues('appends!A4:E4');
        assert.arrayEquals({expected: [['this', 'is', 'the', 'third', 'row']], actual: values});
      });
    });
    
    describe("defineHeaders", function () {
      it("Sets frozen columns and values", function () {
        var headers = [['First', 'Second']];
        tmp.withRequestBuilder(function (rb) {
          rb.freezeRows('headers', headers.length)
          .setValues('headers', 1, headers.length, headers)
        });
        var newHeaders = tmp.getHeaders('headers');
        assert.arrayEquals({expected: headers, actual: newHeaders});
      });
    });
    
    describe("requestBuilder", function () {
      it("Adds rows, headers, and colors, changes sheet title", function () {
        tmp.withRequestBuilder(function (rb) {
          rb.newTab('several')
          .setValues('several', 1, [['Column1', 'Column2']])
          .setValues('several', 2, [['Info1', 'Info2']])
          .freezeRows('several', 1)
          .setNumColumns('several', 4)
          .setNumRows('several', 4)
          .changeTabColor('several', 60, 0, 0, 1)
          .newTab('othertab');
        });
        
        var headers = tmp.getHeaders('several');
        assert.arrayEquals({expected: [['Column1', 'Column2']], actual: headers});
      });        
    });
    
    describe("Sort a column", function () {
      it("sorts!", function () {          
        // make it sort
        tmp.withRequestBuilder(function (rb) {
          [
            [1, 'One'],
            [0, 'Zero'],
            [500, 'Five hundred'],
            [10, 'Ten']
          ].forEach(function (row, index) {
            rb.updateCells('Values', 0, index, [row]);
          });
          
          rb.sort('Values!A:B')
        });
        // 
        
        // check that it is sorted
        var data = tmp.getEffectiveValues('Values!A:A');
        assert.arrayEquals({expected: [[0], [1], [10], [500]], actual: data});
        var data = tmp.getEffectiveValues('Values!B:B');
        assert.arrayEquals({expected: [['Zero'], ['One'], ['Ten'], ['Five hundred']], actual: data});
        //
      });
      
    });
    
    describe("autotab clears before writing", function () {
      
      it("clears!", function () {
        
        var data = null;
        
        tmp.inputValues('autoclear!1:4', [[500, 'B1', 101], [0, 'B2', ''], [1, 'B3', ''], [10, 'B3', '']]);
        
        tmp.withRequestBuilder(function (rb) {
          rb.tabsAutoClear();
          
          [["Just this and only this"]].forEach(function (row, index) {
            rb.setValues('autoclear', index+1, [row]); 
          });
        });
        
        data = tmp.getEffectiveValues('autoclear!A:Z');
        assert.arrayEquals({expected: [["Just this and only this"]], actual: data});
      });
    });
    
    describe("Registering plugin", function () {
      
      it("overwrites returned value", function () {
        tmp.clearPlugins();
        var values;
        tmp.withRequestBuilder(function (rb ) {
          rb.setValues('plugin!A1:2', [['Something'], ['Say Hello']])
          .freezeRows('plugin', 2);
        });
        var description = {
          entryPoint: {header: 2},  // second row
          name: 'Say Hello'
        };
        tmp.registerPlugin(description, function () {
          return 'Hello, world';  // should update
        });
        
        tmp.insertRow('plugin', ['overwrite me with Hello, World']);
        
        tmp.overwriteWithPlugins('plugin!A3:B3');
        values = tmp.getEffectiveValues('plugin!A3:B3');
        assert.arrayEquals({expected: [["Hello, world"]], actual: values});          
      });
      
      it("can be templates for formulas", function () {
        tmp.clearPlugins();
        tmp.withRequestBuilder(function (rb) {
          rb.freezeRows('templates', 2)
          .setValues('templates!A1:B2', [['Something', 'Wicked'], ['Calc', 'Base']]);
        });
        
        var description = {
          entryPoint: {header: 2},  // second row
          name: 'Calc'
        };
        tmp.registerPlugin(description, function () {
          return '=B3+1';  // should update
        });
        
        tmp.insertRow('templates', ['overwrite me with 4', 3]);
        
        tmp.overwriteWithPlugins('templates!A3:B3');
        var values = tmp.getEffectiveValues('templates!A3:B3');
        assert.arrayEquals({expected: [[4, 3]], actual: values});          
      });
      
      it("formulas can be templated with custom functions", function () {
        tmp.clearPlugins();
        tmp.withRequestBuilder(function (rb) {
          rb.setValues('formulatemplates!A1:C2', [['Something', 'Wicked', 'Thiswaycomes'], ['Inc', 'Base', 'IncBy10']])
          .freezeRows('formulatemplates', 2);
        });
        
        var Inc = {
          entryPoint: {header: 2},  // second row
          name: 'Inc'
        };
        tmp.registerPlugin(Inc, function (obj, extra, utils) {
          obj.columnPlusOne = function () {
            return utils.zeroIndexedToColumnName(obj.c + 1);
          }
          return '={columnPlusOne}{row} + 1';  // should update
        });
        
        var IncBy10 = {
          entryPoint: {header: 2},
          name: 'IncBy10'
        }
        tmp.registerPlugin(IncBy10, function (obj, extra, utils) {
          obj.columnMinusOne = function () {
            return utils.zeroIndexedToColumnName(obj.c - 1);
          }
          return '={columnMinusOne}{row} + 10';  // should update
        });
        
        tmp.insertRow('formulatemplates', ['overwrite me with 4', 3, 'overwrite me with 13']);
        tmp.insertRow('formulatemplates', ['overwrite me with 5', 4, 'overwrite me with 14']);
        
        tmp.overwriteWithPlugins('formulatemplates!A3:C4');
        
        var values = tmp.getEffectiveValues('formulatemplates!A3:C4');
        assert.arrayEquals({expected: [[4, 3, 13], [5, 4, 14]], actual: values});
      });
      
      it("formulas can be templated from second row items", function () {
        tmp.withRequestBuilder(function (rb) {
          rb.setValues('uber!A1:2', [['Base', 'Inc'], ['base', 'inc']])
          .freezeRows('uber', 2);
        });
        
        tmp.insertRow('uber', [100]);
        
        var Inc = {
          entryPoint: {header: 2},  // second row
          name: 'inc'
        };
        tmp.registerPlugin(Inc, function (obj, utils) {
          return '={{base}} + 1';  // should update based on "base" second header row
        });
        
        tmp.overwriteWithPlugins('uber!A3:C5');
        
        var values = tmp.getEffectiveValues('uber!A3:C5');
        assert.arrayEquals({expected:[[100, 101]], actual: values});
      });
      
      it("unique ID plugin handles empty and existing columns", function () {
        tmp.clearPlugins();
        tmp.withRequestBuilder(function (rb) {
          rb.setValues('unique!A1:D1', [['Something', 'Wicked', 'id', 'anotherId']])
          .freezeRows('unique', 1);
        });
        
        ['id', 'anotherId'].forEach(function (name) {
          var UniqueId = {
            entryPoint: {header: 1},  
            name: name,
          };
          
          var _ids = [];  // keep record of ids already used in this running
          var _minMax = 1;
          var colValuesCache = {};  // so we don't have to keep calling the same one
          var colValues;
          tmp.registerPlugin(UniqueId, function (obj, utils) {
            if (obj.c in colValuesCache) {
              colValues = colValuesCache[obj.c];
            } else {
              colValues = tmp.getColumnValues('unique', obj.c)
              .filter(function (item) {
                return typeof item == 'number';
              });
              colValuesCache[obj.c] = colValues;
            }
            
            var max = _minMax;
            if (colValues.length != 0)
              max = Math.max.apply(null, colValues);
            while (_ids.indexOf(max) != -1) {
              max += 1;
            }
            _ids.push(max);
            return max;
          });        
        });
        
        
        tmp.inputValues('unique!2:4', [['A1', 'B1', 101], ['A2', 'B2', ''], ['A3', 'B3', '']]);
        tmp.overwriteWithPlugins('unique!A2:D4');
        
        var values = tmp.getUserEnteredValues('unique!A2:D4');
        assert.arrayEquals({
          comment: "id and anotherId",
          expected: [["A1", "B1", 101, 1], ["A2", "B2", 102, 2], ["A3", "B3", 103, 3]],
          actual: values
        });
      });
    });  
    
    /* tests for future extensions ability
    describe("extensions", function () {
      it("rb extend", function () {
        var headers, data;
        headers = [['Header One', "Header Two"], ['info']];
        
        // Make a thing that calls two others
        DB.extend.customBuilder({
          'makeHeaders': function (range, headers) {
            this.setValues(range, headers);  // TODO: change column from "A" to number
            this.freezeRows(range, headers.length);
            return this;
          },
        });
        
        tmp.withRequestBuilder(function (rb) {
          rb.newTab('testExtensions')
          rb.makeHeaders('testExtensions!A1', headers); 
        });
        
        data = tmp.getEffectiveValues('testExtensions!A1:Z');
        assert.arrayEquals({
          expected: headers,
          actual: data
        });
      });
    });
    */
  
    describe("update cells", function () {
      it("updates with strings, numbers, boolean and formula", function () {
        var data;
        tmp.withRequestBuilder(function (rb) {
          rb.updateCells('updateCells', 0, 0, [['headerA', 'headerB'], ['infoA', 'infoB'], [3, '=A3+1'], [true, "=NOT(A4)"]]);
        });
        tmp.withRequestBuilder(function (rb) {
          rb.updateCells('updateCells', 0, 0, [['new', 'new'], [2, '=A2+1']]);
        });
        data = tmp.getEffectiveValues('updateCells!A1:B4');
        assert.arrayEquals({
          expected: [['new', 'new'], [2, 3], [3, 4], [true, false]],
          actual: data,
        });
      });
    });
    
    describe("update cells with clear", function () {
      it("updates with strings, numbers, boolean and formula", function () {
        var data;
        tmp.withRequestBuilder(function (rb) {
          rb.updateCellsWithClear('updateCells', 0, 0, [['clear', 'bitches']]);
        });
        data = tmp.getEffectiveValues('updateCells!A1:B3');
        assert.arrayEquals({
          expected: [['clear', 'bitches']],
          actual: data,
        });
      });
    });
  
    describe("insertrows", function () {
      it("Inserts rows after", function () {
        var data;
        tmp.withRequestBuilder(function (rb) {
          rb.setValues('insert!A1', [['headerA', 'headerB'], ['infoA', 'infoB']]);
        });
        tmp.withRequestBuilder(function (rb) {
          rb.insertRows('insert', 1, 2);
        });
        data = tmp.getEffectiveValues('insert!A1:B3');
        assert.arrayEquals({
          expected: [['headerA', 'headerB'], [], ['infoA', 'infoB']],
          actual: data
        });
      });
      
      it("Inserts columns after", function () {
        var data;
        tmp.withRequestBuilder(function (rb) {
          rb.setValues('insert!A1', [['headerA', 'headerB'], ['infoA', 'infoB'], ['infoA2', 'infoB2']]);
        });
        tmp.withRequestBuilder(function (rb) {
          rb.insertColumns('insert', 1, 2);
        });
        data = tmp.getEffectiveValues('insert!A1:C3');
        assert.arrayEquals({
          expected: [['headerA', '', 'headerB'], ['infoA', '', 'infoB'], ['infoA2', '', 'infoB2']],
          actual: data
        });
      });
      
      it("Inserts one row", function () {
        tmp.withRequestBuilder(function (rb) {
          rb.setValues('insert!A10', [['headerA', 'headerB'], ['infoA', 'infoB'], ['infoA2', 'infoB2']]);
        });
        tmp.withRequestBuilder(function (rb) {
          rb.insertRow('insert', 10);
        });
        
      });
    });

  });

}
