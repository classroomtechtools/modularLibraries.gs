/*
Imported via dev.gs
 */

function testing_utgs() {
  Import.UnitTesting.init();

  /* 
    Under the hood, the describe and it functions, as well as the assert.throws* methods,
    are implemented with a context manager, whose functionality is tested here
    (With describe and it methods!)
  */
  (function ContextManagerTests () {


      describe("Context manager", function () {
        it("Lists works", function () {
          var steps = [];

          assert.contextManager([
            function () {
              steps.push('one');
            },
            function () {
              steps.push('two');
            }
          ], {});

          assert.arrayEquals({comment: "equal arrays",
                                actual: steps,
                                expected: ['one', 'two']});
        });

        it("Returns a function when passed a single param", function () {
          var result = assert.contextManager( {} );
          assert.equals({actual:typeof result, expected:'function'});
        });

        it("Has an embedded mode", function () {
          var options = {};
          var result = assert.contextManager( function () {
               return 'blah';
          }, options );
          assert.equals({comment:"embedded mode",
                           actual:result,
                           expected:'blah'});
        });

        it("Returns argument when provided with two arguments", function () {
          var options = {};
          var factory = assert.contextManager(options);
          var result = factory(function () {
            return 'blah';
          });
          assert.equals({actual: result, expected:'blah'});
        });

        it("Throws error when three arguments passed", function () {
          assert.throwsError(function () {
            assert.contextManager('one', 'two', 'three');
          });
        });

        it("Throws error when no params are passed", function () {
          assert.throwsError(function () {
            assert.contextManager(); // no params
          });
        });

        it("Options argument throws TypeError for bad params value (must be a list)", function () {
          var options = {params:'notalist'};
          assert.throwsTypeError(function () {
            assert.contextManager(function () {
              ; // nothing
            }, options);
          });      
        });

        it("Calls enter and exit functions", function () {
          function enter (arr) {
            arr.push('enter');
            return arr;
          }
          function exit (arr) {
            arr.pop(0);
          }
          var factory = assert.contextManager({enter: enter, exit: exit, params:[ [] ]});

          factory(function (arg) {
            assert.arrayEquals({actual:arg,
                                  expected:['enter']});
          });  
        });

        it("Calls exit function on thrown error", function () {
          var testArray = [];

          function enter () {
            testArray.push('enter');
            return testArray;
          }  
          function exit (arr) {0
            arr.push('exit');
          }
          var factory = assert.contextManager({enter: enter, exit: exit});

          try {
            factory(function (arg) {
              throw new Error("I get swallowed");
            });
          } catch (err) {
            assert.arrayEquals({actual:testArray,expected:['enter', 'exit']});
          }
        });

        it("Passes arguments to enter function", function () {
          var testArray = [];
          var testArg = 'arg';

          function enter () {
            assert.equals({expected: testArg, actual:arguments[0]});
            testArray.push(testArg);
            return testArray;
          }  
          function exit (arr) {0
            arr.push('exit');
          }
          var factory = assert.contextManager({enter: enter, exit: exit, params: [testArg]});

          factory(function (arg) {
            ; // test occurs on enter
          });
          assert.arrayEquals({actual:testArray, expected:[testArg, 'exit']});
        });
      });  // end describe

      it("Use object to pass around", function () {
        var returned = assert.contextManager(function (obj) {
          throw new Error("woops");
        }, {
          enter: function (obj) {
            return obj;
          },
          onError: function (err, obj) {
            obj.result = 'modified';
            return null;
          },
          params: [{result:'modifyme'}]
        });

        assert.equals({expected:'modified',actual:returned.result});
      });

  })();


  /*
    Tests the assert* range of functions
  */
  (function AssertionTests () {

    describe("Pass when actual meets expected", function () {
      it("assertTrue", function () {
        assert.true_({actual:true});
      });

      it("assertFalse", function () {
        assert.false_({actual:false});
      });

      it("assertEquals", function () {
        assert.equals({actual:true,expected:true});
      });

      it("assertNotEquals", function () {
        assert.notEqual({expected:true,actual:false});
      });

      it("assertNull", function () {
        assert.null_({actual:null});
      });

      it("assertNotNull", function () {
        assert.notNull({actual:undefined});
        assert.notNull({actual:0});
      });

      it("assertUndefined", function () {
        assert.undefined_({actual:undefined});
      });

      it("assertNotUndefined", function () {
        assert.notUndefined({actual:null});
      });

      it("assertNaN", function () {
        assert.NaN_({actual:NaN});
      });

      it("assetNotNaN", function () {
        assert.notNaN({actual:0});
      });

      it("assertObjectEquals", function () {
        assert.objectEquals({expected:{hi:'hi'}, actual:{hi:'hi'}});
      });

      it("assertArrayEquals", function () {
        assert.arrayEquals({expected: ['hello', 'world'], actual: ['hello', 'world']});
      });

      it("assertEvaluatesToTrue", function () {
        assert.evaluatesToTrue({actual:1});
        assert.evaluatesToTrue({actual:true});
        assert.evaluatesToTrue({actual:'hi'});
      });

      it("assertEvaluatesToFalse", function () {
        assert.evaluatesToFalse({actual:0});
        assert.evaluatesToFalse({actual:false});
        assert.evaluatesToFalse({actual:''});
      });

      it("assertHashEquals", function () {
        assert.hashEquals({expected:{hi:'hi'}, actual:{hi:'hi'}});
      });

      it("assertRoughlyEquals", function () {
        assert.roughlyEquals({expected:1,actual:1.5,tolerance:1});
      });

      it("assertContains", function () {
        assert.contains({value: 1, collection:[1, 2]});
      });

      it("assertArrayEqualsIgnoringOrder", function () {
        assert.arrayEqualsIgnoringOrder({expected: [2, 1], actual:[1, 2]});
      });

      it("assertThrowsError", function () {
        assert.throwsError(function () {
          throw new TypeError("expected error thrown");
        });
      });
      
      it("assertDoesNotThrowError", function () {
        assert.doesNotThrowError(function () {
          "do nothing";
        });
      });

      it("assertThrowsTypeError", function () {
        assert.throwsTypeError(function () {
          throw new TypeError("error thrown!");
        });
      });

      it("assertThrowsTypeError", function () {
        assert.throwsTypeError(function () {
          throw new TypeError("error thrown!");
        });
      });

      it("assertThrowsRangeError", function () {
        assert.throwsRangeError(function () {
          throw new RangeError("error thrown!");
        });
      });    

    });


    describe("Fail when actual does not match expected", function () {
      it("assertTrue fails", function () {
        assert.throwsError(function () {
          assert.true_(false);
        });
      });

      it("assertFalse fails", function () {
        assert.throwsError(function () {
          assert.false_(true);
        });
      });

      it("assertEquals fails", function () {
        assert.throwsError(function () {
          assert.equals(true, false);
        });
      });

      it("assertNotEquals fails", function () {
        assert.throwsError(function () {
          assert.notEqual(true, true);
        });
      });

      it("assertNull fails", function () {
        assert.throwsError(function () {
          assert.null_('');
        });
      });

      it("assertNotNull", function () {
        assert.throwsError(function () {
          assert.notNull(null);
        });
      });

      it("assertUndefined", function () {
        assert.throwsError(function () {
          assert.undefined_(null);
        });
      });

      it("assertNotUndefined", function () {
        assert.throwsError(function () {
          assert.notUndefined(undefined);
        });
      });

      it("assertNaN", function () {
        assert.throwsError(function () {
          assert.NaN_(0);
        });
      });

      it("assetNotNaN", function () {
        assert.throwsError(function () {
          assert.notNaN(NaN);
        });
      });

      it("assertObjectEquals", function () {
        assert.throwsError(function () {
          assert.objectEquals({hi:'hi'}, {hi:'hi', something:'hi'});
        });
      });

      it("assertArrayEquals", function () {
        assert.throwsError(function () {
          assert.arrayEquals(['hello', 'world'], ['hello']);
        });
      });

      it("assertEvaluatesToTrue", function () {
        assert.throwsError(function () {
          assert.evaluatesToTrue(false);
        });
      });

      it("assertEvaluatesToFalse", function () {
        assert.throwsError(function () {
          assert.evaluatesToFalse(true);
        });
      });

      it("assertHashEquals", function () {
        assert.throwsError(function () {
          assert.hashEquals({expected: {hi:'hi'}, actual:{hi:'hello'}});
        });
      });

      it("assertRoughlyEquals", function () {
        assert.throwsError(function () {
          assert.roughlyEquals({expected: 1,
                                  actual:2,
                                  tolerance:1});
        });
      });

      it("assertContains", function () {
        assert.throwsError(function () {
          assert.contains(1, [0, 2]);
        });
      });

      it("assertArrayEqualsIgnoringOrder", function () {
        assert.throwsError(function () {
          assert.arrayEqualsIgnoringOrder([2, 1], [1, 2, 3]);
        });
      });

      it("assertThrowsError fails when non-Error thrown", function () {
        assert.throwsError(function () {
          throw new TypeError("expected error thrown");
        });
      });

      it("assertThrowsTypeError fails when non-TypeError thrown", function () {
        assert.throwsError("I am prepared", function () {
          assert.throwsTypeError("throws error", function () {
            throw new Error("wrong error thrown!");
          });
        });
      });

      it("assertThrowsTypeError fails when non-ReferenceError thrown", function () {
        assert.throwsError(function () {
          assert.throwsReferenceError(function () {
            throw new TypeError("wrong error thrown!");
          });
        });
      });

      it("assertThrowsRangeError fails when non-RangeError thrown", function () {
        assert.throwsError(function () {
          assert.throwsRangeError(function () {
            throw new Error("wrong error thrown!");
          });
        });
      });    
    });

  })();
  
}