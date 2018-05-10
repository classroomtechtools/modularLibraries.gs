## Sheets.gs

Interacting with Google Sheets api, made a cinch.

## Quickstart

Copy [this library's code](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Sheets/Sheets.gs), also copy the [Requests.gs library code](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Requests/Requests.md) (it's a dependency), enable the sheets api in the console. Use it:

```js
var Sheets, sheet, response;
sheet = Import.Sheets.new_();
response = sheet.api.spreadsheets.values.update('Sheet1!1:1', [['hello', 'world']]);
```

`response` is an instance of the Request.gs response object, whose content is determined by the response from the endpoint.

```js
response.ok;      // true because statusCode == 200
response.json();  // { /* standard response object for this api endpoint /* } 
response.json().updatedRange;  // "Sheet1!A1:B1"
```

## Motivation

The Sheets API endpoints are a bit confusing and multifaceted, with options that have natural default settings. A library that made it easier to interact with these settings seemed like a natural thing to build. For instance, with this library, you only need to set the spreadsheet ID once, which is used for every call (except for `create`).

I also wanted to show how a library can be built entirely with Requests.gs ability to utilize the Discovery API, and build plain javascript objects that connects to various endpoints.

## API at a glance

You may also check out the unit tests for practical use cases. The namespaces follow the naming conventions of the raw API endpoints. For all code below, `sheet` can be assumed to have been derived from either of these two methods:

```js
var sheet = Import.Sheets.new_();  // from scratch
var sheet = Import.Sheets.fromId(spreadsheeetId);  // from existing
```

### Top-level spreadsheet endpoints:

[spreadsheets.get](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/get):

```js
/**
 * Returns the spreadsheet at the given ID
 * @returns {Spreadsheet} - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#Spreadsheet
 */
sheet.api.spreadsheets.get();
```

[spreadsheets.create](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/create):

```js
/**
 * Creates a spreadsheet, returning the newly created spreadsheet
 * @param   {Spreadsheet} [spreadsheet] - A spreadsheet resource object, which
 *                        can be used to define a new spreadsheet declaratively (useful for
 *                        testing)
 * @returns {Spreadsheet} - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#Spreadsheet 
 */
sheet.api.spreadsheets.create(spreadsheet);
```

[spreadsheets.batchUpdate](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/batchUpdate):

```js
/**
 * Applies one or more updates to the spreadsheet
 * @param   {Request[]}   requests - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/request#Request
 * @param   {Object}      [opt]
 * @param   {Bool}        [opt.includeSpreadsheetInResponse=false] - true if you want values back 
 * @param   {Bool}        [opt.responseIncludeGridData=false]
 * @param   {String[]}    [opt.responseRanges=[]] - Info to return in response
 * @returns {Object}      responseObject
 *          {Response[]}  responseObject.replies - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/response#Response
 *          {Spreadsheet} response.updatedSpreadsheet - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#Spreadsheet
 */
sheet.api.spreadsheets.batchUpdate(requests, opt);
```

[spreadsheets.getByDataFilter](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/getByDataFilter):

```js
/**
 * Returns the spreadsheet at the given ID.
 *  This method differs from spreadsheets.get in that it allows selecting 
 *  which subsets of spreadsheet data to return by specifying a dataFilters parameter.
 * @param   {DataFilter[]} dataFilters - https://developers.google.com/sheets/api/reference/rest/v4/DataFilter
 * @returns {Spreadsheet}  - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#Spreadsheet 
 */
sheet.api.spreadsheets.getByDataFilter(dataFilters);
```

### Values endpoints:

[spreadsheets.values.get](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get):

```js
/**
 * Returns a range of values from a spreadsheet.
 * @param   {String}     range - a1notation of range to get
 * @returns {ValueRange} - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values#ValueRange
 */
sheet.api.spreadsheets.values.get(range);
```

[spreadsheets.values.update](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update):

```js
/**
 * Sets values in a range of a spreadsheet.
 * @param   {String}               range - a1notation
 * @param   {Any[][]}              values
 * @returns {UpdateValuesResponse} - https://developers.google.com/sheets/api/reference/rest/v4/UpdateValuesResponse
 */
sheet.api.spreadsheets.values.update(range, values);
```

[spreadsheets.values.append](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append):

```js
/**
 * Returns the spreadsheet at the given ID: 
 * @param   {String}     table - a1notation for range "table" to append (can be just sheet name)
 * @param   {Any[][]}    values - The raw values to append
 * @returns {ValueRange} - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values#ValueRange
 */
sheet.api.spreadsheets.values.append(table, values);
```

[spreadsheets.values.clear](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/clear):

```js
/**
 * Appends values to a spreadsheet. The input range is used to search for existing data 
 * and find a "table" within that range. Values will be appended to the next row of the 
 * table, starting with the first column of the table.
 * @param   {String} range - a1notation of range to clear
 * @returns {Object} responseObject
 *          {String} responseObject.clearedRange - a1notation
 */
sheet.api.spreadsheets.values.clear(range);
```

[spreadsheets.values.batchGet](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchGet):

```js
/**
 * Returns one or more ranges of values from a spreadsheet. 
 * @param   {...String}     ranges - a1notation of ranges
 * @returns {ValueRanges[]} - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values#ValueRange
 */
sheet.api.spreadsheets.values.batchGet(ranges);
```

[spreadsheets.values.batchUpdate](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchUpdate):

```js
/**
 * Sets values in one or more ranges of a spreadsheet.
 * @param   {Object}        data - Keys are ranges, values are values
 * @returns {Object}        responseObj 
 *          {Number}        responseObj.totalUpdated(Rows/Columns/Cells/Sheets)}
 * {UpdateValuesResponse[]} responseObj.responses - https://developers.google.com/sheets/api/reference/rest/v4/
 */
sheet.api.spreadsheets.values.batchUpdate(data);
```

[spreadsheets.values.batchClear](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchClear):

```js
/**
 * Clears one or more ranges of values from a spreadsheet.
 * @param   {...String} clearRanges - a1Notation for range to clear
 * @returns {Object}    responseObj
 *          {String[]}  responseObj.clearedRanges
 */
sheet.api.spreadsheets.values.batchClear(clearRanges);
```

[spreadsheets.values.batchGetByDataFilter](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchClearByDataFilter):

```js
/**
 * Returns one or more ranges of values that match the specified data filters.
 * @param    {...DataFilter} dataFilters - https://developers.google.com/sheets/api/reference/rest/v4/DataFilter
 * @returns  {Object}        responseObj
 * {MatchedValueRange[]}     responseObj.valuesRanges - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchGetByDataFilter#MatchedValueRange
 */
sheet.api.spreadsheets.values.batchGetByDataFilter(dataFilters);
```

[spreadsheets.values.batchUpdateByDataFilter](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchUpdateByDataFilter):

```js
/**
 * Sets values in one or more ranges of a spreadsheet.
 * @param   {...DataFilter}             dataFilters - https://developers.google.com/sheets/api/reference/rest/v4/DataFilter
 * @returns {Object}                    responseObj
 * {UpdateValuesByDataFilterRepsonse[]} responseObj.response - https://forward2.herokuapp.com/developers/sheets/api/reference/rest/v4/spreadsheets.values/batchUpdateByDataFilter#UpdateValuesByDataFilterResponse
 */
sheet.api.spreadsheets.values.batchUpdateByDataFilter(dataFilters);
```

[spreadsheets.values.batchClearByDataFilter](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchClearByDataFilter):

```js
/**
 * Clears one or more ranges of values from a spreadsheet.
 * @param   {...DataFilter} dataFilters - https://developers.google.com/sheets/api/reference/rest/v4/DataFilter
 * @returns {Object}        responseObj
 *          {String[]}      responseObj.clearedRanges
 */
sheets.api.spreadsheets.values.batchClearByDataFilter(dataFilters);
```

### Developer metadata endpoints:

[spreadsheets.developerMetadata.get](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.developerMetadata/get):

```js
/**
 * Returns the developer metadata with the specified ID.
 * Get the developer metadata info by id
 * @param   {Number}            id
 * @returns {DeveloperMetadata} - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.developerMetadata#DeveloperMetadata
 */
sheet.api.spreadsheets.developerMetadata.get(id);
```

[spreadsheets.developerMetadata.search](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.developerMetadata/search):

```js
/**
 * Returns the developer metadata with the specified ID.
 * @param   {...DataFilter}   - https://developers.google.com/sheets/api/reference/rest/v4/DataFilter
 * @returns {Object}          responseObj
 * {MatchedDeveloperMetadata} responseObj.matchedDeveloperMetadata - https://forward2.herokuapp.com/developers/sheets/api/reference/rest/v4/spreadsheets.developerMetadata/search#MatchedDeveloperMetadata
 */
sheet.api.spreadsheets.developerMetadata.search(dataFilters);
```

### Spreadsheet.sheets endpoints:

[spreadsheets.sheets.copyTo](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.sheets/copyTo):

```js
/**
 * Copies a single sheet from a spreadsheet to another spreadsheet
 * @param   {Number}          sheetId
 * @param   {Number}          destinationSpreadsheetId
 * @returns {SheetProperties} - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#SheetProperties
 */
api.spreadsheets.sheets.copyTo(sheetId, destinationSpreadsheetId);
```

## Standard Query Parameters

Throughout the library, you can define the standard query parameters (such as `fields`) for specific endpoints by using the `.setOption` method attached to each function itself. For example:

```js
sheet.api.spreadsheets.get.setOption('fields', 'sheets');  // only return sheet property in response
```
