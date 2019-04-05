var SECRET = '';  // ensure that you have some sort of passcode for a simple layer of security

function doGet(e) {
  var jsonString, store, cache, result;
  
  if (!e.parameter.secret || e.parameter.secret !== SECRET) return ContentService.createTextOutput('{error: "No permission"}').setMimeType(ContentService.MimeType.JSON);
  if (!e.parameter.user) return ContentService.createTextOutput('{error: "No permission"}').setMimeType(ContentService.MimeType.JSON);

  if (e.parameter.cache !== 'off') {
    store = Import.ObjectStore({
      config: {
        jsons: false  // I'll handle the conversions
      }
    });
  }
  cache = store ? store.get(e.parameter.user) : null;
  if (cache) return ContentService.createTextOutput(cache).setMimeType(ContentService.MimeType.JSON);
  
  try {
    result = AdminDirectory.Users.get(e.parameter.user);
  } catch (e) {
    return ContentService.createTextOutput('{error: "' + e.message.replace(/"/g, ' ') + '"}').setMimeType(ContentService.MimeType.JSON)
  }
  
  jsonString = JSON.stringify(result);  
  if (store) store.set(e.parameter.user, jsonString);
  return ContentService.createTextOutput(jsonString).setMimeType(ContentService.MimeType.JSON);
}

function testDoGet() {
  var e = {};
  e.parameter = {user: '<enter test user email address>'};
  e.parameter.secret = SECRET;
  e.parameter.cache = 'on';
  var result = JSON.parse(doGet(e).getContent());
  Logger.log(typeof result);
  Logger.log(result.orgUnitPath);
}
