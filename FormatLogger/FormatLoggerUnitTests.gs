function testing___log() {
  
  Import.UnitTesting.init();
  Import.FormatLogger.initWithLogger(); // can NOT use stackdriver for this, as current testing uses Logger.getLog()
  
  function getLog_() {
    var log, index;
    log = Logger.getLog();
    index = log.indexOf('INFO: ');
    if (index == -1)
      throw Error("Wonky log: " + log);
    log = log.slice(index + 'INFO: '.length, log.length-1);
    return log;
  }

  /*
    These tests can only be run if the Logger output is clear
  */
  if (Logger.getLog() != "")   
    return;

  describe("format, __print__, __pprint__, __log__", function () {
    Logger.clear();
    
    it("__print__ echoes to log all properties of an object", function () {
  
      var obj = {hello: "Hello", world: "World!"};
      obj.__print__;
  
      assert.objectEquals({
        expected: '<{"hello":"Hello","world":"World!"}> (Object)',
        actual: getLog_(),
      });
    });
    Logger.clear()
    it("__print__ converts integer keys into strings (because json)", function () {
  
      var obj = {0: "Hello", 1: "World!"};
      obj.__print__;
  
      assert.objectEquals({
        comment: "Note the number literals have become strings",
        expected: '<{"0":"Hello","1":"World!"}> (Object)',
        actual: getLog_(),
      });
    });
    
    Logger.clear();
  
    it("__print__ echoes to log all elements of an array", function () {
  
      var arr = [1, 2, "3", {info: 'info'}];
      arr.__print__;
  
      assert.objectEquals({
        expected: '<[1,2,"3",{"info":"info"}]> (Array)',
        actual: getLog_(),
      });
    });
    
    Logger.clear();
  
    it("__print__ echoes to log the string", function () {
  
      var str = "This is a testing string";
      str.__print__;
  
      assert.objectEquals({
        expected: '<"This is a testing string"> (String)',
        actual: getLog_(),
      });
    });
    
    Logger.clear();
  
    it("__print__ echoes to log the number", function () {
  
      var num = 2342342.34223;
      num.__print__;
  
      assert.objectEquals({
        comment: "Notice that literal numbers turn into strings",
        expected: "<2342342.34223> (Number)",
        actual: getLog_(),
      });
    });
    
    Logger.clear();
  
    it("__pprint__ echoes to log pretty print of all properties of an object", function () {
  
      var obj = {hello: "Hello", world: "World!", 0: "zero"};
      obj.__pprint__;
  
      assert.objectEquals({
        expected: '\n<{\n    "hello": "Hello",\n    "world": "World!",\n    "0": "zero"\n}> (Object)',
        actual: getLog_(),
      });
    });
    
    Logger.clear();
    
    it("__pprint__ echoes to log pretty print of all elements of an array", function () {
      
      var arr = [1, 2, "3", {info: 'info'}];
      arr.__pprint__;
      
      assert.objectEquals({
        expected: '\n<[\n    1,\n    2,\n    "3",\n    {\n        "info": "info"\n    }\n]> (Array)',
        actual: getLog_(),
      });
    });
    
    Logger.clear();
    
    it("__pprint__ echoes to log pretty print of the string", function () {
      
      var str = "This is a testing string";
      str.__pprint__;
      
      assert.objectEquals({
        expected: '\n<"This is a testing string"> (String)',
        actual: getLog_(),
      });
    });
    
    Logger.clear();
    
    it("__pprint__ echoes to log pretty print of the number", function () {
      
      var num = 2342342.34223;
      num.__pprint__;
      
      assert.objectEquals({
        expected: '\n<2342342.34223> (Number)',
        actual: getLog_(),
      });
    });
    
    Logger.clear();
    
    it("__log__ echoes same as __print__ to log templated strings", function () {
      
      var obj = {that:"this", will: [1, 23, {hi:'hi'}], 0: "zero"};
      "{0.print}".__log__(obj);
      
      assert.objectEquals({
        comment: "Notice the zero literal became a string",
        expected: '<{"that":"this","will":[1,23,{"hi":"hi"}],"0":"zero"}> (Object)',
        actual: getLog_(),
      });
    });
    
    Logger.clear();
    
    it("__log__ echoes with explicit keys and dot properties", function () {
      
      var obj = {that:"this", will: [1, 23, {hi:'hi'}], 0: "zero"};
      var arr = [1, 2, 3, 4];
      "{0.print}\n{1.length}: {1.pprint}".__log__(obj, arr);
      
      assert.objectEquals({
        comment: "Notice the zero literal became a string",
        expected: '<{"that":"this","will":[1,23,{"hi":"hi"}],"0":"zero"}> (Object)\n' + '4: \n<[\n    1,\n    2,\n    3,\n    4\n]> (Array)',
        actual: getLog_(),
      });
    });
  
    it("array?", function () {
      var str = "{0.0} {0.1}".__format__(["hi", "hello"]);
      assert.objectEquals({
        comment: "Notation for this is a bit strange",
        expected: 'hi hello',
        actual: str
      });
    });
      
    Logger.clear();
      
    it("array with __log__", function () {
      "{0.0} {0.1}".__log__(["hi", "hello"]);
      assert.objectEquals({
        comment: "",
        expected: "hi hello",
        actual: getLog_(),
      });
    });
    
    Logger.clear();
    
    it("array2 with __print__", function () {
      ["hi", "hello"].__print__;
      assert.objectEquals({
        comment: "",
        expected: '<["hi","hello"]> (Array)',
        actual: getLog_(),
      });
    });
    
    Logger.clear();
    
    it("object", function () {
      var str = "{0.hi} => {0.zup}".__format__({hi:"hi", zup:'zup'});
      assert.objectEquals({
        expected: 'hi => zup',
        actual: str,
      });
    });
  
    it("format", function () {
      var str = "{0}".__format__("hi");
      assert.objectEquals({
        expected: "hi",
        actual: str
      });
      var str = "{0.hi} {0.zup}".__format__({hi:"hi", zup:'zup'});
      assert.objectEquals({
        expected: 'hi zup',
        actual: str,
      });
    });

    it("transformers", function () {
      Import.FormatLogger({
        config: {
          transformers: {
            upper: function (s) { return s.toUpperCase(); }
          }
        }
      });

      var str = "{0.0!upper}".__format__(["this should be in upper case"]);
      assert.objectEquals({
        expected: 'THIS SHOULD BE IN UPPER CASE',
        actual: str,
      });
    });
  
  });
  
}