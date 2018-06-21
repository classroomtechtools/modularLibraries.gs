# modularLibraries.gs

A Google Apps Script solution for library management. 

This repo consists of:

- Foundational code that enables modular libraries
  - Import.gs provides the scaffolding needed for library usage and creation
  - Requests.gs allows you to interact with Google APIs, external APIs
- Sample libraries which extends Google APIs, by using the foundational code above
  - Sheets.gs is a light wrapper around the Spreadsheet APIs
  - SheetsDB.gs extends Sheets.gs by introducing sessions

All aspects are well documented, including tutorials.

## Foundations

### Import.gs

A Google Apps Script solution to writing and using modular libraries so that apps can better manage code reuse. All the below libraries use this as a framework. [[Link](http://example.com)]

### Requests.gs

A modular library for Google Apps Scripting wrapping `UrlFetchApp`. It also has support for interacting with Google APIs via the Discovery service, and support for concurrent processing. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Requests/Requests.md)]

## Testing and Debugging

### UnitTesting.gs

Assertion and unit testing of modular libraries. [[Link](http://example.com)]

### FormatLogger.gs

Make templated strings and log output with apps scripting a cinch. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/FormatLogger/FormatLogger.md)]

## Stores

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



