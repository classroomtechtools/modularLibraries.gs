# ObjectStore.gs

Make the temporary storage of very large objects in apps scripting a cinch. Leverages both PropertyService and CacheService for fast implementation.

## Motivation

Originally written to overcome difficulties with concurrent processing. When using the combination of `UrlFetchAll.fetchAll` and Apps Scripts API (as Requests.gs can do for you), the child script only runs for a minute and then times out. Wouldn't it be nice to store the result of all the processing into a cache and continue from where you left off?

CacheService has limit of 100kb at a single key; annoyingly tiny.

## Limitations

The maximum size of stringified json that can currently be stored at a single key is: 65434500 characters. Testing revealed that anything larger was somewhat infeasible due to long runtimes. If you really need more space, though, just split up your code and do it concurrently!

## ObjectStore Quickstart

Store very large jsons into a cache for later retrieval. 


```js
store = Import.ObjectStore();
store.set('key', { /* some large object which gets stringified and stored in sequential keys in CacheServices */ );
var retrieve = store.get('key');
```  
