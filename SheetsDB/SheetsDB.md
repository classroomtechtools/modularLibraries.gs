# SheetsDB.gs

Create and modify Google Spreadsheets via sessions.

## Quickstart

Several constructor methods are available:

```js 
var spreadsheet;
spreadsheet = Import.SheetsDB.fromActiveSpreadsheet();
spreadsheet = Import.SheetsDB.fromId("ID");
spreadsheet = Import.SheetsDB.fromProperties({ /* resource properties */ });
spreadsheet = Import.SheetsDB.new_("Title");
```

Retrieve the spreadsheet values:

```js
var data = spreadsheet.getValues('Sheet1!A1:A');
var data = spreadsheet.getFormattedValues('Sheet1!A1:A');
```

Send commands to the Sheets API using `.withSession` context manager. For example, create a new spreadsheet with two tabs and sample values:

```js
var spreadsheet = Import.SheetsDB.new_('Title');
spreadsheet.withSession(function (session) {
  session.addTab('Hello')
         .setValues('Hello!A1', [['first', 'row', 'of', 'first', 'tab']])
         .addTab('World')
         .setValues('World', 1, 1, [['second', 'row']]);
});
```

Create a spreadsheet that contains formulas:

```js
var spreadsheet, data;
spreadsheet = Import.SheetsDB.new_('Title');
spreadsheet.withSession(function (session) {
  session.newTab('Calc')
         .setValues('Calc!A1', [['1', 2, 3, 4, 5]])
         .setValues('Calc!A2', [['=SUM(A1:E1)']]);
  });
data = spreadsheet.getEffectiveValues('Calc!A2');  // [[15]]
```

For quick development, use `.withTempSpreadsheet`, which creates a new spreadsheet, attempt to execute the commands in the block, and destroy the file even if an error occurred. Very useful for testing.

```js
Import.SheetsDB.withTempSpreadsheet(function (temp) {
  temp.withSession(function (session) {
    session.newTab('Hi')
           .setValues('Hi!A1', 'hi')
           .ohNoSomethingHasGoneWrong();  // Error, but temp is deleted
  });	
});
```

## Session API

#####session.setValues("A1Notation", [['values'...]])
Set values, starting at the cell indicated by A1Notation. Values of null are skipped.

#####session.setValues("Tab", left, right, [['values'...]])


## Discussion

SheetSessions.md attempts to use sensible defaults and easy-to-remember idioms when interacting with it. However, there is a great deal of complexity that is abstracted away, and this section explains principal design decisions.

### Dimension

The `ROWS` or `COLUMNS` [dimension](https://developers.google.com/sheets/api/reference/rest/v4/Dimension) determines how the API understands the dataset (array of arrays) sent to it, for example via `.setValues`:

```js
var spreadsheet = Import.SheetSessions.fromId('id', {byRows: false});  // default is true
spreadsheet.withSession(function (session) {
  session.setValues('Sheet1!A1', [['A1', 'A2', 'A3']]);  // writes down, not across
});
```

The default value can be adjusted with `.setDimensionAsColumns` or `.setDimensionAsRows`.

```js
var spreadsheet = Import.SheetSessions.fromId('id', {byRows: false});  // default is true
spreadsheet.withSession(function (session) {
  session.setValues('Sheet1!A1', [['A1', 'A2', 'A3']]);  // writes down, not across
  session.setDimensionAsRows();
  session.setValues('Sheet2!A1, [['A1', 'B1', 'C1']]);   // writes across again
});
spreadsheet.withSession(function (session) {
  session.setValues('Sheet2!A1, [['A1', 'B1', 'C1']]);   // writes across ... still (the value is sticky)
})
```

But the recommended way would be to use `utils.transpose` that is connected to the sessions object that just adjusts the shape of the array you are working with, and keeping to the `byRows` default manner of working:

```js
var spreadsheet = Import.SheetSessions.fromId('id', {byRows: true});   
var data = [['A1', 'A2', 'A3']];
spreadsheet.withSession(function (session) {
  var data = session.utils.transpose(data);  // [['A1'], ['A2'], ['A3']]
  session.setValues('Sheet1!A1', data);   // writes down, not across, because the array is shaped as such
});
```


### Value Input Option



### Value Render Option


### Sessions

At the end of the `.withSession` block, SheetsDB.gs builds the minimum required requests and sends it on the Sessions API, via `.batchUpdate`. 

When interfacing with the raw API, tabs need to be created in a prior call before their cell values can be successfully updated — but when using SheetsDB this is handled for you. The code can be written into one "session" in any order. For the below "Hello World" actions:

```js
var spreadsheet = Import.SheetsDB.new_('Title');
spreadsheet.withSession(function (session) {
  session.addTab('Hello')
         .setValues('Hello!A1', [['first', 'row', 'of', 'first', 'tab']])
         .addTab('World')
         .setValues('World', 1, 1, [['second', 'row']]);
});
```

There are actually two requests made to the API:

- One call to create both tabs
- Another call, after the above, to update the values



### Input Value Option

Notice from examples in the quickstart that values passed in `.setValues` are from the API's point-of-view treated as `USER_ENTERED` — which means that there is a post processor equivalent to that present when a user inputs into the frontend UI. For example:

```js
session.setValues('Sheet!A1', [['1', 2, 3, 4, 5]]);
```

The string `'1'` passed in the first `.setValues` call becomes the number `1` in the cell. This becomes quite confusing, but also quite useful. This conversion is how you can write `=FORMULA()` and very easily define formulas. You can use the alternative `RAW` form, by using the config:

```js
// Demonstration using RAW for inputValueOption
var spreadsheet, data;
spreadsheet = Import.SheetsDB.new_({raw:true}, 'Title');
spreadsheet.withSession(function (session) {
  session.newTab('Sheet')
         .setValues('Sheet!A1', [['1', 2, 3, 4, 5]])
  });
data = spreadsheet.getEffectiveValues('Sheet!A1:E1');
```

The variable `data` is equal to `[['1', 2, 3, 4, 5]]`, i.e. the first string is not converted to a number as would occur if `raw:false`.

Workarounds available for text and dates:

```js
session.setValues('Sheet!A1', [['=T("45")']]);
```

This takes advantage of the fact that the `T` formula takes string arguments and guarantees the cell's effective value is the string `'45'`

You can use `DATEVALUE` formula to get a raw date object as the value in the cell (which can then be formatted).

```js
session.setValues('Sheet!A1', [['=DATEVALUE("01/30/2000")']]);
```




## Errors

###Invalid data
This occurs happen when you use `Session.setValues` and do not define it as a two-dimensional array.

###Session Object: Method x was not found in [Object object]

This occurs when you've attempted to use an undefined method on a sessin object:

```js
session.addTab('NewTab');   // Error: it's "newTab" not "addTab"
session.newTab('NewTab');
```


