# CacheStore

A light wrapper for CacheServices.

## Quickstart

Copy the [code](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Stores/CacheStore/CacheStore.gs) into your project. Use it:

```js
var cacheStore = Import.CacheStore({
  config: {
    expiry: 'max',  // default is 10 minutes
    jsons: true,    // default is true
  }
});
```
