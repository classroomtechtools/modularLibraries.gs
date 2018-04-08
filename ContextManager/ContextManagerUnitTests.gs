
function testRunner () {

  Import.UnitTesting.init();
  var contextManager = Import.contextManager();

  describe("Meta", function () {
    it("Throws error when three arguments passed", function () {
      assert.throwsError(function () {
        contextManager('one', 'two', 'three');
      });
    });
    
    it("Options argument throws TypeError for bad params value (must be a function)", function () {
      var options = {params: 'notafunction'};
      assert.throwsTypeError(function () {
        contextManager(function () {
          ; // nothing
        }, options);
      });
    });
  });

  describe("Embedded mode", function () {
    it("param is passed to body even without enter function", function () {
      var result;
      [result, _] = contextManager(function (arg) {
        return [arg];
      }, {
        params: function () {
          return ['hi'];
        },
      });
      assert.equals({actual: result, expected: 'hi'});
    });
    
    it("returns result in body", function () {
      var options = {}, result;
      [result, _] = contextManager( function () {
        return ['blah'];
      }, options );
      assert.equals({actual: result, expected: 'blah'});
    });
    
    it("A list of functions are all executed", function () {
      var steps = [];
      
      contextManager([
        function () {
          steps.push('one');
        },
        function () {
          steps.push('two');
        }
      ], {});
      
      assert.arrayEquals({actual: steps, expected: ['one', 'two']});
    });
    
    it("Throws error when no params are passed", function () {
      assert.throwsError(function () {
        contextManager(); // no params
      });
    });
    
    
    it("Calls enter and exit functions", function () {
      function enter (arr) {
        arr.push('enter');
        return [arr];
      }
      function exit (arr) {
        arr.pop(0);
      }
      var factory = contextManager({enter: enter, exit: exit, params: function () { return [ [] ]; }});
      
      factory(function (arg) {
        assert.arrayEquals({actual: arg, expected: ['enter']});
      });  
    });
    
    it("handles a zero returned from enter", function () {
      function enter() {
        return [0];
      }
      
      function exit(value) {
        return [value + 1];
      }
      
      var [testResult, _] = contextManager(function (arr) {
        return [arr + 1];
      }, {enter: enter, exit: exit});
      
      assert.equals({actual: testResult, expected: 1});
    });
    
    it("handles a zero passed to params", function () {        
      function enter(value) {
        return [value + 1];
      }
      
      function exit(value) {
        return [value + 1];
      }
      
      var [testResult, _] = contextManager(function (arr) {
        return [arr + 1];
      }, {params: function () { return [0]; }, enter: enter, exit: exit});
      
      assert.equals({actual: testResult, expected: 2});
    });
    
    it("Calls exit function on thrown error", function () {
      var testArray = [];
      
      function enter () {
        testArray.push('enter');
        return [testArray];
      }
      function exit (arr) {
        arr.push('exit');
      }
      var factory = contextManager({enter: enter, exit: exit});
      
      try {
        factory(function (arg) {
          throw new Error("I get swallowed");
        });
      } catch (err) {
        assert.arrayEquals({actual: testArray, expected: ['enter', 'exit']});
      }
    });

  });  // end describe


  describe("Factory mode", function () { 
    it("Returns a function when passed a single param", function () {
      var result = contextManager( {} );
      assert.equals({actual: typeof result, expected: 'function'});
    });
    
    it("param is passed to body even without enter function", function () {
      var factory, result;
      factory = contextManager({
        params: function () {
          return ['hi'];
        },
      });
      [result, _] = factory(function (arg) {
        return [arg];
      });
      assert.equals({actual: result, expected: 'hi'});
    });

    it("returns result in body", function () {
      var factory = contextManager({});
      var [result2, _] = factory(function (arg) {
        return ['hi'];
      });
      assert.equals({actual: result2, expected: 'hi'});
    });
    
    it("Returns argument", function () {
      var options = {};
      var factory = contextManager(options);
      var [result, _] = factory(function () {
        return ['blah'];
      });
      assert.equals({actual: result, expected: 'blah'});
    });
    
    it("Passes arguments to enter function", function () {
      var testArray = [];
      var testArg = 'arg';
      
      function enter () {
        assert.equals({actual: testArg, expected: arguments[0]});
        testArray.push(testArg);
        return [testArray];
      }
      function exit (arr) {
        arr.push('exit');
      }
      var factory = contextManager({enter: enter, exit: exit, params: function () { return [testArg]} });
      
      factory(function (arg) {
        ; // test occurs on enter
      });
      assert.arrayEquals({actual: testArray, expected: [testArg, 'exit']});
    });        
    
    it("Use object to pass around", function () {
      var [returned, _] = contextManager(function (obj) {
        throw new Error("woops");
      }, {
        enter: function (obj) {
          return [obj];
        },
        onError: function (err, obj) {
          obj.result = 'modified';
          return null;
        },
        params: function () { return [{result:'modifyme'}]; }
      });
      
      assert.equals({actual: returned.result, expected: 'modified'});
    });
    
  });

}