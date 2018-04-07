(function(global,name,Package,helpers,creators){name = name.replace(/ /g,"_");var ref=function wrapper(args){var wrapped=function(){return Package.apply(Import._import(name),arguments)};for(i in args){wrapped[i]=args[i]};return wrapped}(helpers);global.Import=global.Import||{};Import.register=Import.register||function(uniqueId,func){Import.__Packages=Import.__Packages||{};Import.__Packages[uniqueId]=func};Import._import=Import._import||function(uniqueId){var ret=Import.__Packages[uniqueId];if(typeof ret==='undefined')throw Error("Import error! No library called "+uniqueId);return ret};global.Import[name]=function wrapper(args){var wrapped=function(options){options=options||{};options.namespace=options.namespace||!1;options.base=options.base||!1;options.config=options.config||{};options.params=options.params||[];var makeIt=function(){var params,ret;params=options.config?[options.config]:options.params;return ref.apply(null,params)}.bind(this);var ret;if(options.namespace){var p=global,g=global,last;options.namespace.split('.').forEach(function(ns){g[ns]=g[ns]||{};p=g;g=g[ns];last=ns});ret=p[last]=makeIt()}else if(options.base){if(options.base==='global'){options.base=global};options.attr=options.attr||name;ret=options.base[options.attr]=makeIt()}else{ret=makeIt()};return ret};for(var c in creators){wrapped[c]=creators[c]};return wrapped}(creators);Import.register(name,ref)})(this,

"Requests",

function RequestsPackage_ (config) {  
  var self = this, discovery, discoverUrl;
  var scriptApp = function gimmeglobal() {
    return this;
  }.apply(null, [])['Script' + 'App'];
  
  discovery = function (name, version) {
    return self().get('https://www.googleapis.com/discovery/v1/apis/' + name + '/' + version + '/rest');
  };

  discoverUrl = function (name, version, resource, method) {
    var data;
    data = discovery(name, version).json();
    return data.baseUrl + data.resources[resource].methods[method].path;
  };

  config = config || {};
  config.baseUrl = config.baseUrl || "";
  config.method = typeof config.method !== 'undefined' ? config.method.toLowerCase() : null;
  if (config.method && ['get', 'put', 'post', 'head', 'options', 'delete_'].indexOf(config.method) === -1) {
    throw Error("Illegal method passed into Requests");
  }
  config.body = config.body || {};
  config.headers = config.headers || null;
  config.query = config.query || {};  
  config.oauth = config.oauth || false;
  config.basicAuth = config.basicAuth || false;
  config.discovery = config.discovery || null;
  if (config.discovery && config.discovery.name && config.discovery.version && config.discovery.resource && config.discovery.method) {
    config.baseUrl = discoverUrl(config.discovery.name, config.discovery.version, config.discovery.resource, config.discovery.method);
  }
  
  if (config.oauth) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = "Bearer " + (config.oauth === 'me' ? scriptApp.getOAuthToken() : config.oauth);
  }
  
  if (config.basicAuth) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = "Basic " + config.basicAuth;
  }
  
  var Response = function (_resp) {
  
    return {
    
      json: function () {
        try {
          return JSON.parse(this.text());
        } catch (err) {
          Logger.log(this.text());
          throw Error("Response did not return a parsable json object");
        }
      },
      
      text: function () {
        return _resp.getContentText();
      },
      
      statusCode: function () {
        return _resp.getResponseCode();
      },

      getAllHeaders: function () {
        return _resp.getAllHeaders();
      },

      /*
        Return true if encounted rate limit
      */
      hitRateLimit: function () {
        if (this.statusCode() === 429) {
          var headers = this.getAllHeaders();
          var header_reset_at = headers['x-ratelimit-reset'];
          header_reset_at = header_reset_at.replace(" UTC", "+0000").replace(" ", "T");
          var reset_at = new Date(header_reset_at).getTime();
          var utf_now = new Date().getTime();
          var milliseconds = reset_at - utf_now + 10;
          if (milliseconds > 0) {
            console.log("Sleeping for " + (milliseconds/1000).toString() + " seconds.");
            Utilities.sleep(milliseconds);
          } 
          return true;
        }
        return false;
      },

      /*
      */
      paged: function (rootKey) {
        if (typeof rootKey === 'undefined') throw Error('Specify path');
        var json;
        json = this.json();
        var page, batch, req, rawRequest;
        batch = new BatchRequests();
        page = 2;
        while (json.meta.total_pages >= page) {
          req = this.request;
          req.setQuery('page', page);
          rawRequest = req.toRequestObject();
          batch.add( rawRequest );
          page++;
        }
        var fetchResult = batch.fetchAll();
        var zipResult = fetchResult.zip(rootKey, json);
        return zipResult;
      },
      
      pageByTokens: function (rootKey, next, query) {
        next = next || 'nextPageToken';
        query = query || 'pageToken';
        if (typeof rootKey === 'undefined') throw Error('Specify root key');
        var json;
        json = this.json();
        var token, collection = [], req, result, j;
        Array.prototype.push.apply(collection, json[rootKey]);
        token = json[next];
        while (token) {
          req = this.request;
          req.setQuery(query, token); 
          result = req.fetch();
          if (!result.ok) {
            // "If the token is rejected for any reason, it should be discarded, and pagination should be restarted from the first page of results."
            req.clearQuery();
            result = req.fetch();
            if (!result.ok) {
              throw Error("Unable to reach " + req.getUrl() + " status code: " + req.statusCode());
            }
          }
          j = result.json();
          Array.prototype.push.apply(collection, j[rootKey]);
          token = j[next];
        }
        return collection;
      },
      
      ok: _resp.getResponseCode() == 200
      
    }
  };
  
  var BatchResponses = function (_responses) {
    _responses = _responses || [];
    return {
      /*
        Used to process when a single object is returned and need it to be a list
      */
      objects: function (rootKey, options) {
        var objectList;
        options = options || {};
        objectList = options.initialValue || [];
        _responses.forEach(function (resp) {
          var j;
          j = resp.json();
          objectList.push(j[rootKey]);
        });
        return objectList;
      },
   
      /*
        Used to process batch items that return a list at a particul rootKey
      */
      zip: function (rootKey, options) {
        var json;
        options = options || {};
        json = options.initialValue || [];
        options.everyObj = options.everyObj || {};

        _responses.forEach(function (resp) {
          var j, req, match, key;
          j = resp.json();
          req = resp.request;
          if ((j[rootKey] || {length: 0}).length > 0) {
            j[rootKey].forEach(function (o) {
              for (key in options.everyObj) {
                if (options.everyObj[key] instanceof RegExp) {
                  match = req.getUrl().match(options.everyObj[key]);
                  o[key] = parseInt(match[1]);  // FIXME: Need to be able to define a callback function to process
                } else if (options.everyObj[key] instanceof Object && options.everyObj[key].query) {
                  o[key] = req.getQuery()[options.everyObj[key].query];
                } else {
                  o[key] = options.everyObj[key];
                }
              }
            });
            Array.prototype.push.apply(json, j[rootKey]);
          }
        });
        return json;
      },      
    
      getResponses: function () {
        return _responses;
      }
    };
  };
  BatchResponses.empty = function () {
    return new this([]);
  };

  var BatchRequests = function(_list) {
    _list = _list || [];
    return {

      fetchAll: function (expandForPages) {
        expandForPages = expandForPages || false;
        var responses, expandedRequests;
        if (_list.length === 0) return BatchResponses.empty();

        expandedRequests = new BatchRequests();
        responses = UrlFetchApp.fetchAll(_list).reduce(function (acc, response, index) {
          var resp, origRequest ,url;
          origRequest = _list[index];
          resp = new Response(response);
          resp.request = new Request(origRequest);

          if (resp.hitRateLimit()) {
            var request, r;
            r = resp.request;
            resp = resp.request.fetch();
            resp.request = r;
          }
          acc.push(resp);
          if (expandForPages && (function (r, er) {
            var json, page, req, rawRequest;
            json = r.json();
            page = 2;
            while ((json.meta || {total_page: -1}).total_pages >= page) {
              req = r.request;
              req.setQuery('page', page);
              rawRequest = req.toRequestObject();
              er.add( rawRequest );
              page++;
            }
          })(resp, expandedRequests));
          return acc;
        }, []);
        
        if (expandForPages && (function (resps) {
          var newResponses;
          if (expandedRequests.length === 0) return;  // no need to continue
          newResponses = expandedRequests.fetchAll(false);
          Array.prototype.push.apply(resps, newResponses.getResponses());
        })(responses));
        
        return new BatchResponses(responses);
      },
      
      add: function (item) {
        item.muteHttpExceptions = true;
        _list.push(item);
      },
      
      length: function (item) {
        return _list.length;
      }
    };
  };

  /**
   * Represents a request. 
   *
   * @constructor
   * @param {object} [_options={}] - Options object
  */
  var Request = function (_options) {
    _options = _options || {};
    _options.url = _options.url || config.baseUrl;
    if (typeof _options.url === 'object' && config.baseUrl) {
      _options.url = self.format(config.baseUrl, _options.url);
    }
    _options.body = _options.body || {};
    _options.headers = _options.headers || null;
    _options.query = _options.query || {};

    var toParams;

    return {
    
      params: function (includeUrl) {
        if (typeof includeUrl === 'undefined') includeUrl = false;
        
        var params = {};
        params.muteHttpExceptions = true;
        params.method = _options.method.toLowerCase() || 'get';
  
        if (_options.headers || config.headers) {
          params.headers = self.utils.extend(true, config.headers, _options.headers);
        }
        
        if ( ['put', 'post'].indexOf(params.method) !== -1 ) {
          params.payload = self.utils.extend(true, config.body, _options.body);
          params.payload = JSON.stringify(params.payload);
          params.contentType = 'application/json';
        }
        
        if (includeUrl) params.url = this.getUrl();
        return params;
      },
    
      /*
        Prepares the params parameter of UrlFetchApp.fetch and returns 
        custom response object
      */
      build: function () {
        var params, resp, reply;

        params = this.params();
        reply = UrlFetchApp.fetch(this.getUrl(), params);
        resp = new Response(reply);
        resp.request = this;
        resp.raw = UrlFetchApp.getRequest(this.getUrl(), params);
        return resp;
      },

      /*
        Fetches external resource, handling any API rate limitations
      */
      fetch: function () {
        var resp;
        resp = this.build();
        if (resp.hitRateLimit()) {
          resp = this.build();
        }
        return resp;
      },

      getUrl: function () {
        var obj = self.utils.extend(true, config.query, _options.query);
        if (typeof _options.url === 'object' && config.baseUrl) _options.url = self.format(_options.baseUrl, _options.url);
        if (_options.url.indexOf('?') !== -1) _options.url = _options.url.slice(0, _options.url.indexOf('?'));
        if (Object.keys(obj).length == 0) return _options.url;
        var ret = _options.url + "?" + Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&');
        return ret;
      },
      
      setQuery: function (key, value) {
        _options.query[key] = value;
      },
      
      getQuery: function () {
        return _options.query;
      },
      
      clearQuery: function () {
        _options.query = {};
      },

      toRequestObject: function () {
        // The last object is required to ensure query params are included
        return self.utils.extend(true, config, _options, {url: this.getUrl()});
      }
    };
  };

  var returnedObject = {
    
    /*
      Perform the same method on a pattern-identifying URL
    */
    batch: function (urlTemplate, items, options) {
      options = options || {};
      options.expandForPages = options.expandForPages || false;
      var requests, batchRequests;
      if (typeof urlTemplate === 'object' && config.baseUrl) {
        urlTemplate = self.format(config.baseUrl, urlTemplate);
      }
      requests = items.reduce(function (acc, item) {
        var url, req, reqObj;
        if (item.options) {
          // If the last item is an object, store it in the options area and remove it
          options = self.utils.extend(options, item.options);
          delete item[item.length-1];
        }
        url = self.format(urlTemplate, item);
        options.method = options.method || 'get';
        options.url = url;
        options.muteHttpExceptions = true;
        req = new Request(options);
        reqObj = req.toRequestObject();
        acc.push(reqObj);
        return acc;
      }, []);
      return new BatchRequests(requests).fetchAll(options.expandForPages);
    },
    
    get: function (url, options, fetchYN) {
      var req;
      if (typeof fetchYN === 'undefined') fetchYN = true;
      options = options || {};
      options.url = url;
      options.method = 'get';
      req = new Request(options);
      if (fetchYN) return req.fetch();
      return req;
    },

    post: function (url, options, fetchYN) {
      if (typeof fetchYN === 'undefined') fetchYN = true;
      options = options || {};
      options.url = url;
      options.method = 'post';
      req = new Request(options);
      if (fetchYN) return req.fetch();
      return req;
    },
    
    put: function (url, options, fetchYN) {
      if (typeof fetchYN === 'undefined') fetchYN = true;
      options = options || {};
      options.url = url;
      options.method = 'put';
      req = new Request(options);
      if (fetchYN) return req.fetch();
      return req;
    },
    
    delete_: function (url, options, fetchYN) {
      if (typeof fetchYN === 'undefined') fetchYN = true;
      options = options || {};
      options.url = url;
      options.method = 'delete';
      req = new Request(options);
      if (fetchYN) return req.fetch();
      return req;
    },
    
    head: function (url, options, fetchYN) {
      if (typeof fetchYN === 'undefined') fetchYN = true;
      options = options || {};
      options.url = url;
      options.method = 'head';
      req = new Request(options);
      if (fetchYN) return req.fetch();
      return req;
    },
    
    options: function (url, options, fetchYN) {
      if (typeof fetchYN === 'undefined') fetchYN = true;
      options = options || {};
      options.url = url;
      options.method = 'options';
      req = new Request(options);
      if (fetchYN) return req.fetch();
      return req;
    },
  };
  
  if (config.method) {
    return returnedObject[config.method];
  }
  return returnedObject;
},

{ /* helpers */

  fetchAll: function (/* arguments */) {
    var requestsParams = [];
    for (var a=0; a < arguments.length; a++) {
      requestsParams.push(arguments[a].params(true));
    }
    return UrlFetchApp.fetchAll(requestsParams);
  },
  
  /*
    http://www.{name}.com, {name: 'hey'} => http://www.hey.com
  */
  format: function (template /*, obj */) {
    //  ValueError :: String -> Error
    var ValueError = function(message) {
      var err = new Error(message);
      err.name = 'ValueError';
      return err;
    };
  
    //  defaultTo :: a,a? -> a
    var defaultTo = function(x, y) {
      return y == null ? x : y;
    };
    
    var lookup = function(obj, path) {
      if (!/^\d+$/.test(path[0])) {
        path = ['0'].concat(path);
      }
      for (var idx = 0; idx < path.length; idx += 1) {
        var key = path[idx];
        obj = typeof obj[key] === 'function' ? obj[key]() : obj[key];
      }
      return obj;
    };
  
    var args = Array.prototype.slice.call(arguments, 1);
    var idx = 0;
    var state = 'UNDEFINED';
    
    return template.replace(
      /([{}])\1|[{](.*?)(?:!(.+?))?[}]/g,
      function(match, literal, key, xf) {
        if (literal != null) {
          return literal;
        }
        if (key.length > 0) {
          if (state === 'IMPLICIT') {
            throw ValueError('cannot switch from ' +
                             'implicit to explicit numbering');
          }
          state = 'EXPLICIT';
        } else {
          if (state === 'EXPLICIT') {
            throw ValueError('cannot switch from ' +
                             'explicit to implicit numbering');
          }
          state = 'IMPLICIT';
          key = String(idx);
          idx += 1;
        }
        var value = defaultTo('', lookup(args, key.split('.')));
        
        if (xf == null) {
          return value;
        } else if (Object.prototype.hasOwnProperty.call(transformers, xf)) {
          return transformers[xf](value);
        } else {
          throw ValueError('no transformer named "' + xf + '"');
        }
      }
    );
  },
  
  utils: {

    /*
      https://github.com/cferdinandi/extend
    */
    extend: function () {
      var extend = function () {
  
        // Variables
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;
    
        // Check if a deep merge
        if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
            deep = arguments[0];
            i++;
        }
    
        // Merge the object into the extended object
        var merge = function ( obj ) {
            for ( var prop in obj ) {
                if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                    // If deep merge and property is an object, merge properties
                    if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                        extended[prop] = extend( true, extended[prop], obj[prop] );
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };
    
        // Loop through each object and conduct a merge
        for ( ; i < length; i++ ) {
            var obj = arguments[i];
            merge(obj);
        }
    
        return extended;
  
      }
      return extend.apply(extend, arguments);
    },

    
    /*
    Flatten list into of rows with objects into list, first row being headers
    */
    flatten: function (rows, options) {
    
      /*
        Dotize: https://github.com/vardars/dotize/blob/master/src/dotize.js
        Flatten an object that contains nested objects into an object with just one layer,
        with keys in dotted notation.
      */
      var dotize = function(obj, prefix) {
        var newObj = {};
        
        if ((!obj || typeof obj != "object") && !Array.isArray(obj)) {
          if (prefix) {
            newObj[prefix] = obj;
            return newObj;
          } else {
            return obj;
          }
        }
        
        function isNumber(f) {
          return !isNaN(parseInt(f));
        }
        
        function isEmptyObj(obj) {
          for (var prop in obj) {
            if (Object.hasOwnProperty.call(obj, prop))
              return false;
          }
        }
        
        function getFieldName(field, prefix, isRoot, isArrayItem, isArray) {
          if (isArray)
            return (prefix ? prefix : "") + (isNumber(field) ? "[" + field + "]" : (isRoot ? "" : ".") + field);
          else if (isArrayItem)
            return (prefix ? prefix : "") + "[" + field + "]";
          else
            return (prefix ? prefix + "." : "") + field;
        }
        
        return function recurse(o, p, isRoot) {
          var isArrayItem = Array.isArray(o);
          for (var f in o) {
            var currentProp = o[f];
            if (currentProp && typeof currentProp === "object") {
              if (Array.isArray(currentProp)) {
                newObj = recurse(currentProp, getFieldName(f, p, isRoot, false, true), isArrayItem); // array
              } else {
                if (isArrayItem && isEmptyObj(currentProp) == false) {
                  newObj = recurse(currentProp, getFieldName(f, p, isRoot, true)); // array item object
                } else if (isEmptyObj(currentProp) == false) {
                  newObj = recurse(currentProp, getFieldName(f, p, isRoot)); // object
                } else {
                  //
                }
              }
            } else {
              if (isArrayItem || isNumber(f)) {
                newObj[getFieldName(f, p, isRoot, true)] = currentProp; // array item primitive
              } else {
                newObj[getFieldName(f, p, isRoot)] = currentProp; // primitive
              }
            }
          }
          
          return newObj;
        }(obj, prefix, true);
      };
    
      options = options || {};
      options.pathDelimiter = options.pathDelimiter || '.';
      var headers;
      rows = rows.map(function (row) {
        return dotize(row);
      });
      headers = rows.reduce(function (everyHeader, row) {
        var prop;
        for (prop in row) {
          everyHeader.push( prop );
        }
        return everyHeader;
      }, []);
      
      var mappedHeaders, finalHeaders;
      mappedHeaders = headers.map(function (el, i) {
        return { 
          index: i, 
          value: el === 'id' ? '' : el.toLowerCase()
        }
      });
      mappedHeaders.sort(function (a, b) {
        if (a.value > b.value) return 1;
        if (a.value < b.value) return -1;
        return 0;
      });
      finalHeaders = mappedHeaders.map(function (el) {
        return headers[el.index];
      }).filter(function (value, index, me) {
        return me.indexOf(value) === index;
      });
      
      return rows.reduce(function (acc, obj) {
        var row, value;
        row = [];
        for (var h=0; h < finalHeaders.length; h++) {
          value = obj[finalHeaders[h]];
          if (typeof value === 'undefined' || value == null) value = "";
          row.push(value);
        }
        acc.push(row);
        return acc;
      }, [finalHeaders]);
      
    }
    
  },
},

{ /* creators */ 

  /*
    https://developers.google.com/apis-explorer/#search/discovery/discovery/v1/
  */
  discovery: function (name, version, resource, method) {
    return this({
      config: {
        oauth: 'me',
        discovery: {
          name: name,
          version: version,
          resource: resource,
          method: method
        }
      }
    });
  },

  runViaAppsScripts: function () {
    var run = this.discovery('script', 'v1', 'scripts', 'run');
    return function () {
      var devMode, func, params, request;
      devMode = arguments[0];
      func = arguments[1];
      params = Array.prototype.slice.call(arguments, 2);
      request = run.post({scriptId: this['Script' + 'App'].getScriptId()}, {
        body: {
          parameters: params,
          'function': func,
          devMode: devMode
        }
      }, false);
      return request;
    }.apply(null, arguments);  // null gives me the global object as 'this'
  },
  
  callMyFunction: function () {
    var request, response, params;
    params = [false].concat(Array.prototype.slice.call(arguments));
    request = this.runViaAppsScripts.apply(this, params);
    response =request.fetch().json();
    if (response.error) {
      Logger.log(response);
      throw Error("Cannot run function " + response.error.message);
    }
    return response.response.result;
  },
  
  callMyFunctionInDevMode: function () {
    var request, response, params;
    params = [true].concat(Array.prototype.slice.call(arguments));
    request = this.runViaAppsScripts.apply(this, params);
    response =request.fetch().json();
    if (response.error) {
      Logger.log(response);
      throw Error("Cannot run function");
    }
    return response.response.result;
  },
  
  concurrentlyInDevMode: function (/* arguments */) {
    // take on true so that it is the fourth argument
    var i, params = Array.prototype.slice.call(arguments);
    for (var i = arguments.length; i < 3; i++) {
      params.push(undefined);
    }
    params.push(true);
    return this.concurrently.apply(this, params);
  },
  
  concurrently: function (body, addCallback, initValue, devMode) {
    var self = this;
    if (typeof initValue === 'undefined') initValue = [];
    if (typeof devMode === 'undefined') devMode = false;
    addCallback = addCallback || function (acc, item) {
      acc.push(item);
      return acc;
    };
    var passObj = function () {
      var requests = [];
      return {
        add: function () {
          var funcName, params, rawRequest;
          funcName = arguments[0];  // Array.prototype.slice.call(arguments, 0, 1)[0];
          params = Array.prototype.slice.call(arguments, 1);
          rawRequest = self.runViaAppsScripts(devMode, funcName, params, null, false).params(true);
          requests.push(rawRequest);
        },
        reset: function () {
          requests = [];
        },
        responses: function () {
          var resps, acc = initValue;
          resps = UrlFetchApp.fetchAll(requests);
          resps.forEach(function (resp, index) {
            var request, obj, returned, tab;
            request = requests[index];
            obj = JSON.parse(resp);
            if (obj.error) {
              throw Error(JSON.stringify(obj.error) + " during request: " + JSON.stringify(request));
            }
            returned = obj.response.result ? obj.response.result[0] : undefined;
            acc = addCallback(acc, returned);
          });
          return acc;
        },
      }
    };
    var passO = passObj();
    body.call(null, passO);
    return passO.responses();
  },
}

);
