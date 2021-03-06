# PropertyStore.gs

Light wrapper to PropertyServices. Supports json values. Unlike the target API, does not support chaining.

## Quickstart

Copy the [code](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Stores/PropertyStore/PropertyStore.gs) into your project as a standalone file. Start using it:

```js
var store = Import.PropertyStore();  // default is script properties
store.set('key', {obj: "object"});
obj = store.get('key');
obj  // is {obj: "object"}
```

By default it uses scripts property services, but you can use user or document services as such:

```js
var userStore = Import.PropertyStore.user();
var docStore = Import.PropertyStore.document();
```

### API:

Implements the following, left side is API call and right side is [function equivalent to reference](https://developers.google.com/apps-script/reference/properties/properties)

- **set**: setProperty
- **get**: getProperty
- **setAll**: setProperties
- **setAllAndRemoveOthers**: setProperties (passing `true` as second parameter)
- **getAll**: getProperties
- **getKeys**: getKeys
- **remove**: deleteProperty
- **removeAll**: deleteAllProperties
