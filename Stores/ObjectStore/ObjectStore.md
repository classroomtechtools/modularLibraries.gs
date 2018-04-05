# ObjectStore.gs

Make the temporary storage of very large objects in apps scripting a cinch. 

## ObjectStore Quickstart

Copy the [code](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Stores/ObjectStore/ObjectStore.gs) into your project. Store and retrieve very large jsons into the store.

```js
store = Import.ObjectStore();
store.set('key', { /* some large object which gets stringified and stored in sequential keys in CacheServices */ );
var retrieve = store.get('key');
```  

## Motivation

Originally written to overcome difficulties with concurrent processing. When using the combination of `UrlFetchAll.fetchAll` and Apps Scripts API (as (Requests.gs)[https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Requests/Requests.md] can do for you), the child script only runs for a minute and then times out. As a workaround, store all the processing into a cache and continue from where you left off. But the built-in CacheService has a limitation of 100kb per key ...

## Limitations

ObjectStore's maximum size of stringified json that can currently be stored at a single key is: 65434500 characters. Testing revealed that anything larger was somewhat infeasible due to long runtimes. If you really need more space, though, just split up your code and do it concurrently!

## Implementation details

It works by splitting up the json string and spreading it out on keys such as `key000`, `key001` etc, and stored in the cache with by default a maximum length of 6 hours. They array of keys that are used to "zip up" when a retrieveal is requested is stored in a special key. 
