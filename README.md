# modularLibraries.gs

A native Google Apps Script solution for library creation, usage, and development. 

This readme consists of:

- Documentation of how it works:
    - The global `Import` namespace
    - Package instantiation and namespacing
    - How to write your own libraries following this pattern

- Sample libraries which extends Google APIs, by using the foundational code above
 
  - Sample HelloWorld library
  - Requests.gs is a heavy wrapper around UrlFetchApp, which allows granular control of Google API interactions
  - Sheets.gs is a light wrapper around the Spreadsheet APIs
  - SheetsDB.gs extends Sheets.gs by introducing sessions

- How to write your own libraries


## Motivation

I love the Python/Github ecosphere but I have to use AppsScripts at work. In particular, **D**on't **R**epeat **Y**ourself. Be able to do reuse code that solves particular problems, but you only have to understand how to interact with it. The library should just encapsulate a particular functionality. 

I use these libraries for several daily scripts and for AppMaker projects.

## HelloWorld

The sample HelloWorld library illustrates the essential features. Interact with it like this:

```js
function myFunction() {
  var lib, chi;
  lib = Import.HelloWorld();
  lib.sayHi();  // Hello, World
  chi = Import.HelloWorld.chinese({
    noun: 'shijie'  // shijie = world in chinese
  });
  chi.sayHi();  // Ni hao, shijie
}
```

## Documentation

### Terms

The library is the code that the library writer exposes to the end developer. The package is the wrapped library. We have to instantiate the package in order to get a library instance. The package can accept configuration settings which are passed to the library, and the package can also derive namespaces. These are explained below.


### The `Import` namespace

When you use any of the modular libraries in this repo, you gain the the `Import` global variable which acts as a namespace to access the library you pasted in. Any library pasted in will add a property onto the `Import` variable, and is the entry point to accessing and interacting with the target library. The name of the property added is defined in the library itself in the packaging code (#2 below in "Anatomy of a Library).

The library references are only guaranteed to be available in the `Import` namespace from within a function that is called in the editor, or invoked through triggers, etc.

#### Using `Import` Examples

Copying and pasting a SampleLibrary.gs example:

```js
function MyFunction () {
    var lib, ss;
    
    // instantiate a package with default settings
    lib = Import.SampleLibrary();
    lib.sayHi();  // 'hi'

    // instantiate a package with passed configuration (long form)
    lib = Import.SampleLibrary({
        config: {
            lang: 'ch'
        }
    });
    lib.sayHi();  // 'ni hao'

    // instantiate a package from a creator method (short form)
    lib = Import.SampleLibrary.create({
        lang: 'ch'
    });
    lib.sayHi();  // 'ni hao'
        
    // instantiate a package from a creator method
    ss = Import.SampleLibrary.fromId('<spreadsheetId>');
    ss.withSheet('Sheet1', function (sheet) {
        sheet.write('B3', ['b3']);
        sheet.write('B4', ['b4']);
    });    
}
```



### Anatomy of a Library

All libraries can only be one file long. They all follow a boilerplate pattern, and any of them will provide the project in which they are copied into with the global `Import` variable. 

A modularLibrary.gs library, in code, consists of:

1. `(function (global, name, Package, helpers, creators) { /* code */ } (this, `
2. `"SampleLibrary",`
3. `function Package_(config) { return {}; },`
4. `{ /* helpers */ },`
5. `{ /* creators */ }`
6. `)`

Explanation:

1. The first part is the Import.gs code that gives the project the `Import` global. The `/* code */` portion is about 50 lines of code that can be found in the package. Notice that trailing `(this,` which gets passed as the `global` parameter in the anonymous function. This is how Import.gs gains access to the global context.
2. The name of the package, which is used to expose the entry point into the library in the project as `Import.SampleLibrary`. This is passed to Import.gs in the `name` variable.
3. The package itself, which is just a function that takes one variable, `config`. When the entry point to the library is invoked, such as `Import.SampleLibrary({config: {}})` this function is run with `this` keyword referring to itself and contents of `config` are passed to it.
4. The first of two convenience functions: helper functions. These are intended to be functions that are self-contained that the package itself uses to implement its features, but also intended to be exposed to the project as well. These functions have no access to the library or to any of the other entry points, for these are on the library instance, or `Import.SampleLibrary().helper()`. 
5. The second of two convenience functions: the creators. These are methods that are used to instantiate the library itself, such as `Import.SampleLibrary.create`

### Instantiation

Using these libraries requires the developer to copy and paste into their project. Then, you use either `Import.SampleLibrary` that resolved into a library reference, or `Import.SampleLibrary({config:{}})` that returns a library instance initiated with configuration options, which is how libraries expose its features and APIs.

Libraries can define convenient methods for instantiation. These **creator methods** are a convienient method that lives on the top-level library reference. They are typically called `.fromX` or just `.create`. For example:

```js
var ss = Import.Sheets.fromId('<spreadsheetid>');
var ce = Import.CustomErrors.create('Custom Error');
```

These creator methods are the preferred way to instantiate things. The first one creates an object and have a longer-form equivalents:

```js
var ss = Import.Sheets({
  config: {
    spreadsheetId: '<spreadsheetid>'
  }
});
var ce = Import.CustomErrors({
  config: {
    name: 'Custom Error'
  }
});
```

An important concept is remembering a **library reference** is what is provided as a property of the `Import` global. There is nothing exposed there except for creator functions. The developer writing a creator has the `this` keyword which is itself a library reference. When you invoke (or call) the library reference you end up with a **library instance** which exposes the core functionality (usually with an object, but can be anything). The developer writing the library returns that object in the Package function.

### Configuration Options



### Namespacing 

The `Import` variable also has other powers: You can build namespaces with it for use in your application:

```js
var app = {};
app.libraries = {};
Import.SampleLibrary({
  base: app.libraries,
  attr: lib1,
  config: {}
});
Import.OtherLibrary({
  base: app.libraries,
  attr: lib2,
  config: {}
});
```

Now you have `app.libraries.lib1` and `app.libraries.lib2`.

An interesting feature of namespace though, is that you can actually define global variables if you choose to do so. You do that using the `namespace` property.

```js
Import.SampleLibrary({
  namespace: 'app.libraries.lib1',
  config: {}
});
```

The `config` property is passed to the library itself as the first parameter in the library definition. 

## Writing a library

### Helper methods

The other kind of convenient methods are *helper methods* that live on the library instance and are availble from within the library code as well. This is how developers can write a useful function inside their package and expose it to the end developer. For example the CustomErrors.gs library contains a useful function that it uses to derive stack information, which it uses to provide features. It is exposed as a helper function

## Code

### Foundational Libraries:

Import.gs below is intended to be used as framework for writing a library, and Requests.gs is a very versatile library for interacting with endpoints, including Google ones.

#### Import.gs

A Google Apps Script solution to writing and using modular libraries so that apps can better manage code reuse. All the below libraries use this as a framework. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/tree/master/Import)]

#### Requests.gs

A modular library for Google Apps Scripting wrapping `UrlFetchApp`. It also has support for interacting with Google APIs via the Discovery service, and support for concurrent processing. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Requests)]

### Testing and Debugging Libraries:

Ideally modular libraries need to have unit tests that come along with the project. Tests are useful for building out improvements, and can even serve as useful insight into how the library works.

#### UnitTesting.gs

Assertion and unit testing of modular libraries. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/tree/master/UnitTesting)]

#### FormatLogger.gs

Make templated strings and log output with apps scripting a cinch. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/FormatLogger)]

### Storage:

#### CacheStore.gs

A light wrapper for CacheServices. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Stores/CacheStore)]

#### PropertyStore.gs

A light wrapper for PropertyServices. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Stores/PropertyStore)]

#### ObjectStore.gs

Make the temporary storage of very large objects in apps scripting a cinch. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Stores/ObjectStore)]

### For Spreadsheets:

#### Sheets.gs

Interacting with Google Sheets api, made a cinch. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Sheets)]

#### SheetsDB.gs

Interact with Google Spreadsheets as a database. Create sessions that sorts out the Sheets API implementation details, update any apsect of a sheet. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/SheetsDB)]

#### Dotmitizer.gs

Convert an array of json objects into spreadsheet-friendly array of arrays, where the first row represents the column headers, and the remaining rows are the respective values per each json. The column names use dot (and brace) notation to specify the path for nested objects, hence the name. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Dotmitizer)]


### Design Patterns:

#### Context Manager.gs

Create a block of code in apps scripts that is guaranteed to do something before its execution, and after its execution — even if an error occurred. Optionally handle or swallow errors, and pass parameters onto each stage. [[Link](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/ContextManager)]

## Discussion

Why this project? Mainly I wanted a way to be productive in larger projects. Writing libraries is key to ensure code reuse. Coming from the Python ecosphere — which has a jaw-dropping amount of actively maintained open source libraries — the number of libraries available for GAS pales in comparison.

One of the reasons for the lack of libraries in this stack may well be due to its poor implementation.

### Criticism

The current library implementation available in the Google Apps Scripting stack is inadequate for today's open source scripting needs, making development less productive than the ideal. Consider:

- The library is stored in a gas project with limited version and collaboration options
- Library source code are often not made available to other developers for improvements or issues
- In Google's documentation, you are repeatedly warned against using libraries in production, although it sounds like people ignore that policy (which proves it is broken)
- There are no hooks available to write package management software with libraries
- Unit testing seems to not really be a priority in app scripting, which can be blamed in part on poor library support
- While we're at it, the debugging tool itself is kinda buggy (stepping in and out can get the debugger seemingly lost)

These are further nit-picks:

- Exposing functionality and APIs is awkward — can only do so via JDOC
- There is a big upside standardizing how GAS libraries are written, tested, published, and used. While it's tantalizing to use node's idioms, it's not suitable for the GAS stack (which you'll understand when you try converting some of them).

Furthermore:

- This is actually just the first piece of a "package manager" solution I have in mind. The major layer that is missing is a way of declaring which libraries are required for the project, downloading them — and *their* dependencies — and making them available for use in the project for importing.

### Response

I can attest that using modularLibraries.gs has indeed made me more productive:

- These libraries are all stored on github, for the moment in one repository (for convenience)
- The source code is released under MIT license
- It uses is own conventions suitable to this particular stack instead of using node ones
- We forgo the built-in library mechnanism entirely in favor of having the code actually in the project itself. This means we can run unit tests and develop iteratively
- The Import.gs boilerplate code allows the library writer to expose functionality to the end user developer, not just through
- There is a tool for debugging, FormatLogger.gs which just makes using Logger.log more convenient
- Unit Testing framework is available, inspired by mocha, so you can deploy Test-Driven Development for your libraries (and app code)
- Narrative and tutorial documentation is preferred, which is provided









