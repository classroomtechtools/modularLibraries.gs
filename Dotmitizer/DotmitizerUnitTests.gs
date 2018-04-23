function testing_reverseDotize_() {
  Import.UnitTesting.init();
  Import.FormatLogger.init();
  var dotize = Import.Dotmitizer();
  
  describe('rows', function () {
    var tested_objects = [
      {
        it: "first column is list of columns, second, etc is rows, missing values are null",
        original: [{one: 'one'},{two: 'two'}],
        converted: [["one","two"],["one",null],[null,"two"]]
      }
    ];

    tested_objects.forEach(function (obj, index) {
      it(obj.it, function () {
        assert.objectEquals({
          actual: dotize.jsonsToSheetRows(obj.original),
          expected: obj.converted,
          comment: "{0.print}".__format__(obj.original)
        });
      });
    });
  });

  describe('reversions', function () {
    var tested_objects = [
      {
        it: "simple case with no array notations",
        original: {"this.has.nothing": 0, "this.has.string": 'string'},
        converted: {"this": {"has": {"string": 'string', "nothing": 0}}}
      },
      {
        it: "object then array then array",
        original: {"independent": 'value', "first.second": 'yo', "first.third": 'hello', 'parent_ids[0][0]': 2, 'parent_ids[0][1]': 100},
        converted: {independent: 'value', first: {second: 'yo', third: 'hello'}, parent_ids: [[2, 100]]}
      },
      {
        it: "object then array, then object",
        original: {"parents[0].name.firstName": "Adam", "parents[0].name.lastName": "Morris"},
        converted: {parents: [{name: {firstName: 'Adam', lastName: 'Morris'}}]},
      },
      {
        it: "array then array",
        original: {"[0]": 1, "[1]": 2, "[2][0]": 3, "[2][1]": 4, "[3]": 5},
        converted: [1, 2, [3, 4], 5],
      },
      {
        it: "object then array, then object then array",
        original: {"parents[0]": 1, "parents[1]": 2, "parents[2].telephones[0].prefix": 3, "parents[2].telephones[0].postfix": 4, "parents[3]": 5},
        converted: {"parents":[1,2, {"telephones":[{"prefix":3,"postfix":4}]},5]},
      },
//    These two fail: CONTRIBUTIONS WELCOME
//      {
//        it: "object then array, then object, object then array",
//        original: {"parents[0]": 1, "parents[1]": 2, "parents[2].tele.phones[0].prefix": 3, "parents[2].tele.phones[0].postfix": 4, "parents[3]": 5},
//        converted: {"parents":[1,2, {"tele": {"phones":[{"prefix":3,"postfix":4}]}},5]},
//      },
//      {
//        it: "object then array, then object, object then array",
//        original: {"parents[0]": 1, "parents[1]": 2, "parents[2][0].prefix": 3, "parents[2][0].postfix": 4, "parents[3]": 5},
//        converted: {"parents":[1,2, [{"prefix":3,"postfix":4}], 5]},
//      },
    ];
    
    tested_objects.forEach(function (obj, index) {
      it(obj.it, function () {
        assert.objectEquals({
          actual: dotize.revert(obj.original),
          expected: obj.converted,
          comment: "from {0.print} to {1.print}".__format__(obj.original, obj.converted)
        });
      });
    });
    
    it("maintains transivity", function () {
      // go through all cases and ensure transivity
      tested_objects.forEach(function (obj, index) {
        assert.objectEquals({
          actual: dotize.convert(dotize.revert(obj.original)),
          expected: obj.original,
          comment: "{0.print}".__format__(dotize.convert(dotize.revert(obj.original)))
        });
        assert.objectEquals({
          actual: dotize.revert(dotize.convert(obj.converted)),
          expected: obj.converted,
          comment: "{0.print}".__format__(dotize.revert(dotize.convert(obj.converted)))
        });
      });
    });
  });
  
  describe('conversions', function () {
    it('what about dates', function () {
      var theDate = new Date();
      assert.objectEquals({
        actual: dotize.convert({startDate: theDate}),
        expected: {"startDate": theDate}
      });
    });
    it('outputs arrays as subscripts', function () {
      var data = [1, [2, 3], 3];
      var result = dotize.convert(data);
      assert.objectEquals({
        expected: {"[0]": 1, "[1][0]": 2, "[1][1]": 3, "[2]": 3},
        actual: result
      });
    });
    it('outputs arrays as subscripts with prefix', function () {
      var data = [1, [2, 3], 3];
      var result = dotize.convert(data, 'pre_');
      assert.objectEquals({
        expected: {"pre_[0]": 1, "pre_[1][0]": 2, "pre_[1][1]": 3, "pre_[2]": 3},
        actual: result
      });
    });
    it('outputs arrays of more than 9 items with left zero padding', function () {
      var data = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      var result = dotize.convert(data);
      assert.objectEquals({
        expected: {"[00][00]": 0, "[00][01]": 1, "[00][02]": 2, "[00][03]": 3, "[00][04]": 4, "[00][05]": 5, "[00][06]":6, "[00][07]":7, "[00][08]":8, "[00][09]":9, "[00][10]":10, "[00][11]":11, "[01]": 1, "[02]": 2, "[03]": 3, "[04]": 4, "[05]": 5, "[06]": 6, "[07]": 7, "[08]": 8, "[09]": 9, "[10]": 10, "[11]": 11},
        actual: result
      });
    });    
    it('outputs object of arrays', function () {
      var data = {'first': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 'second': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]};
      var result = dotize.convert(data);
      assert.objectEquals({
        expected: {"first[00]": 0, "first[01]": 1, "first[02]": 2, "first[03]": 3, "first[04]": 4, "first[05]": 5, "first[06]":6, "first[07]":7, "first[08]":8, "first[09]":9, "first[10]":10, "first[11]":11, "second[00]": 0, "second[01]": 1, "second[02]": 2, "second[03]": 3, "second[04]": 4, "second[05]": 5, "second[06]": 6, "second[07]": 7, "second[08]": 8, "second[09]": 9, "second[10]": 10, "second[11]": 11},
        actual: result
      });
    });    
  });
}
