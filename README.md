# modularLibraries.gs

This repo consists of:

- Import.gs which is boilerplate code used to write other libraries, and provides the project the `Import` global object
- Sample libraries and documentation for writing libraries that can be imported via the `Import.NameOfLibrary`

## Main

### Import.gs

A Google Apps Script solution to writing and using modular libraries so that apps can better manage code reuse. All the below libraries use this as a framework. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Import/Import.md)]

### Requests.gs

A modular library for Google Apps Scripting that makes external requests a cinch by wrapping `UrlFetchApp`. Has support for interacting with Google APIs via the Discovery service, and support for concurrent processing. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Requests/Requests.md)]

## Testing and Debugging

### UnitTesting.gs

Assertion and unit testing of modular libraries. [[Link](http://example.com)]

### FormatLogger.gs

Make templated strings and log output with apps scripting a cinch. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/FormatLogger/FormatLogger.md)]

## Stores.gs

### CacheStore.gs

A light wrapper for CacheServices. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Stores/CacheStore/CacheStore.md)]

### PropertyStore.gs

A light wrapper for PropertyServices. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Stores/PropertyStore/PropertyStore.md)]

### ObjectStore.gs

Make the temporary storage of very large objects in apps scripting a cinch. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Stores/ObjectStore/ObjectStore.md)]

## Spreadsheet Libraries

### Sheets.gs

Interacting with Google Sheets api, made a cinch. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Sheets/Sheets.md)]

### SheetsDB.gs

Interact with Google Spreadsheets as a database. Create sessions that sorts out the Sheets API implementation details, update any apsect of a sheet. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/SheetsDB/SheetsDB.md)]

### Dotmitizer.gs

Convert an array of json objects into spreadsheet-friendly array of arrays, where the first row represents the column headers, and the remaining rows are the respective values per each json. The column names use dot (and brace) notation to specify the path for nested objects, hence the name. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Dotmitizer/Dotmitizer.md)]


## Design Patterns

### Context Manager.gs

Create a block of code in apps scripts that is guaranteed to do something before its execution, and after its execution — even if an error occurred. Optionally handle or swallow errors, and pass parameters onto each stage. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/ContextManager/ContextManager.md)]



