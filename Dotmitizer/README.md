# Dotmitizer.gs

Convert an array of json objects into spreadsheet-friendly array of arrays, where the first row represents the column headers, and the remaining rows are the respective values per each json. The column names use dot (and brace) notation to specify the path for nested objects, hence the name.

Rows that do not originally contain values for columns that appear in other objects are assigned as `null`.

With thanks to [dotize](https://github.com/vardars/dotize/blob/master/src/dotize.js).

## Known limitations

Nested objects that contain more than one array causes breakage. Further investigation to resolve is planned, but for now (April 2018) supporting such complexity is not needed by this author. Contributions welcome. See the unit tests for more information. All hail unit tests.

## Quickstart

Copy the [code](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Dotmitizer/DotmitizerUnitTests.gs) into your project. Use it:

```js
var dotmizer, data;
dotmitizer = Import.Dotmitizer();
date = dotmitizer.jsonsToSheetRows([
  { /* json */ },
  { /* json */ },
  { /* nested objects also okay */ }
]);
```
`date` is then equal to:

```js
[
  [ /*
       "header" array of all column names, 
       in alphabetical order -- with id first (if present in any object) 
       columns of nested object have dot.notation (for objects) and braces[0] (for arrays)
    */ ],
  [ /* first row, with any "missing" columns as null value */ ],
  [ /* second row, ditto */ ]
  ... etc
]
```

## Less of a Quickstart

The below demonstrates the patterns this library produces:

```js
var dotmizer, arrayOfJsons, data;
dotmitizer = Import.Dotmitizer();
arrayOfJsons = [{
  id: 34242,
  name: {
    firstName: 'Happy',
    lastName: "Student",
  },
  current: true,
  startDate: 'now',
  endDate: new Date(),
  parent_ids: [
    1, 2, 3 
  ],
  classes: [{
    teacher_id: 10, class_id:20, info: {name:"Computer Science"}
  }]
},{
  column: "value"
}]);
data = dotmizer.jsonsToSheetRows(arrayOfJsons);
```

Data is now an object with `columns` and `rows`:

```js
[
  [ /* the columns */
   "id", "classes[0].class_id", "classes[0].info.name",
   "classes[0].teacher_id", "column", "current", 
   "endDate", "name.firstName", "name.lastName",
   "parent_ids[0]", "parent_ids[1]", "parent_ids[2]",
    "startDate"
  ],
  [ /* first row */
   34242,20,"Computer Science",
   10, null, true,
   1524484729834, "Happy" , "Student",
   1, 2, 3,
   "now"
  ],
  [ /* second row */
   null, null, null,
   null, "value", null,
   null, null, null,
   null, null, null,
   null
  ]
]
```

## Overview of methods

The following two are used internally, but can be called if you wish to handle things specially (type conversions, maybe?):

* `.convert` Takes an object and turns it into an object of one depth, with keys as path with dot (and brace) notation

* `.revert` Opposite of `convert`

These are the two main convenience functions:

* `jsonsToSheetRows` See above

* `sheetRowsToJsons` Opposite of `jsonsToSheetRows`
