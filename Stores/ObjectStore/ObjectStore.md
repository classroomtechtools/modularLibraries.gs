# ObjectStore.gs

Store very large objects into a cache for later retrieval. Leverages both PropertyService and CacheService for fast implementation.

Originally written to overcome difficulties with concurrent processing.

```js
store = Import.ObjectStore();
store.set('key', { /* some large object which is stringified and stored in bunches in CacheServices */ );
var retrieve = store.get('key');
```  
