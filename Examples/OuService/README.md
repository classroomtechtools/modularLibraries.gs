# OuService

AppScripts web app service for returning user information from GSuite. Utilized to solve problem of getting the Organizational Unit information from, hence the name, but really is just a light wrapper for [this method](https://developers.google.com/admin-sdk/directory/v1/reference/users/get).

Uses `ObjectStore` to cache the results and returns that instead of calling out to the backend API. Illustrates a simple way of utilizing `ObjectStore` as a caching mechanism.

## Requirements

You need to have access to an account with permissions to access the method referenced above.

## Instructions

Copy and paste into a new project. Deploy as web app, run as a developer. Call it from another script:

```js
var email = '', response; 
response = UrlFetchApp.fetch('https://script.google.com/a/igbis.edu.my/macros/s/<scriptId>/exec?secret=YOURSECRET&user=' + email);
return response.orgUnitPath;
```

