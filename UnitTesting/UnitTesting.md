# UnitTesting.gs

Assertion and unit testing of modular libraries.

## UnitTesting.gs Quickstart

Copy and paste the [code](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/UnitTesting/UnitTesting.gs), and initialize it so that it is live.

```js
Import.UnitTesting.init();  // can be safely executed multiple times during execution
  
describe("Tests", function () {
  it("This one fails", function () {
    assert.equals({
      comment: 'If it fails, it displays in the log',
      expected: 'Yes',
      actual: 'No'
    });
  });
});
```

The output (minus log info):

```
Tests
	✘ tests
		Error: Comment: This one fails  -- Failure: Expected Yes but was No	at pkg.utgs.Utgs:189
	at pkg.utgs.Utgs:157
	at pkg.utgs.Utgs:449
	at test:6
	at pkg.utgs.Utgs:263
	at pkg.utgs.Utgs:840
	at test:5
	at pkg.utgs.Utgs:263
	at pkg.utgs.Utgs:823
	at test:4 (myFunction)
```

List of available assertions. If there is a `{}` that means it is an object with `expected`, `actual` and optional `comment` properties. If `any` can be anything, if `func` must be a function.

```js
assert.equals({})
assert.true_(any)
assert.false_(any)
assert.null_(any);
assert.notNull(any)
assert.undefined_(any)
assert.notUndefined(any);
assert.NaN_(any);
assert.notNaN(any);
assert.evaluatesToTrue(any);
assert.evaluatesToFalse(any);

assert.arrayEquals({});
assert.arrayEqualsIgnoringOrder({});
assert.objectEquals({});
assert.hashEquals({});
assert.roughlyEquals({});  // also tolerance property required
assert.contains({value: any, collection: any});

assert.throwsError(func)
assert.throwsTypeError(func)
assert.throwsRangeError(func)
assert.throwsReferenceError(func)

assert.doesNotThrowError(func)


```

## Unit tests!

This package has unit tests on itself, which is also useful to check out how to use it.

## Motivation

Unit testing is worth it.

## Thanks

Much of the original code came from [GSUnit](https://sites.google.com/site/scriptsexamples/custom-methods/gsunit), with additional refactoring and the additional function assertions.
