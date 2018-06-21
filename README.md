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

## Quickstart

To use the code here, the idea is to copy and paste from the Code section below into your project. A forthcoming package manager solution will automate this process. Note that some of these libraries have dependencies on other modular libraries.

## Code

### Foundations:

#### Import.gs

A Google Apps Script solution to writing and using modular libraries so that apps can better manage code reuse. All the below libraries use this as a framework. [[Link](http://example.com)]

#### Requests.gs

A modular library for Google Apps Scripting wrapping `UrlFetchApp`. It also has support for interacting with Google APIs via the Discovery service, and support for concurrent processing. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Requests/Requests.md)]

### Testing and Debugging:

#### UnitTesting.gs

Assertion and unit testing of modular libraries. [[Link](http://example.com)]

#### FormatLogger.gs

Make templated strings and log output with apps scripting a cinch. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/FormatLogger/FormatLogger.md)]

### Storage:

#### CacheStore.gs

A light wrapper for CacheServices. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Stores/CacheStore/CacheStore.md)]

#### PropertyStore.gs

A light wrapper for PropertyServices. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Stores/PropertyStore/PropertyStore.md)]

#### ObjectStore.gs

Make the temporary storage of very large objects in apps scripting a cinch. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Stores/ObjectStore/ObjectStore.md)]

### For Spreadsheets:

#### Sheets.gs

Interacting with Google Sheets api, made a cinch. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Sheets/Sheets.md)]

#### SheetsDB.gs

Interact with Google Spreadsheets as a database. Create sessions that sorts out the Sheets API implementation details, update any apsect of a sheet. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/SheetsDB/SheetsDB.md)]

#### Dotmitizer.gs

Convert an array of json objects into spreadsheet-friendly array of arrays, where the first row represents the column headers, and the remaining rows are the respective values per each json. The column names use dot (and brace) notation to specify the path for nested objects, hence the name. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Dotmitizer/Dotmitizer.md)]


### Design Patterns:

#### Context Manager.gs

Create a block of code in apps scripts that is guaranteed to do something before its execution, and after its execution — even if an error occurred. Optionally handle or swallow errors, and pass parameters onto each stage. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/ContextManager/ContextManager.md)]

## Discussion

### Criticism

Mainly I wanted a way to be productive in larger projects. Writing libraries is key to ensure code reuse. Coming from the Python ecosphere — which has a jaw-dropping amount of actively maintained open source libraries — the number of libraries available for GAS pales in comparison.

The current library implementation available in the Google Apps Scripting stack is inadequate for today's open source scripting needs, and makes me less productive. Consider:

- The library is stored in a gas project with limited version and collaboration options
- Library source code are often not made available to other developers for improvements or issues
- In Google's documentation, you are repeatedly warned against using libraries in production, although it sounds like people ignore that policy (which proves it is broken)
- There is no hooks avaialble to write package management software with libraries (that I can think of)
- Unit testing seems to not really be a priority in app scripting, which can be blamed in part on poor library support
- While we're at it, the debugging tool itself is kinda buggy (stepping in and out can get the debugger seemingly lost)

These are further nit-picks:

- Exposing functionality and APIs is awkward
- There is a big upside standardizing how GAS libraries are written, tested, published, and used. While it's tantalizing to use node's idioms, it's not suitable for the GAS stack (which you'll understand when you try converting some of them).

Furthermore:

- This is actually just the first piece of a "package manager" solution I have in mind. The major layer that is missing is a way of declaring which libraries are required for the project, downloading them — and *their* dependencies — and making them available for use in the project for importing.

### Response

I can attest that using modularLibraries.gs has indeed made me more productive:

- These libraries are all stored on github, for the moment in one repository (for convenience)
- The source code is released under MIT license
- It uses is own conventions suitable to this particular stack instead of using node ones
- We forgo the built-in library mechnanism entirely in favor of having the code actually in the project itself. This means we can run unit tests and develop iteratively
- There is a tool for debugging, FormatLogger.gs which just makes using Logger.log more convenient
- Unit Testing framework is available, inspired by mocha, so you can deploy Test-Driven Development for your libraries (and app code)
- Narrative and tutorial documentation is preferred, which is provided









