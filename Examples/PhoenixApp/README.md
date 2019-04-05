# PhoenixApp, made with Google AppMaker

## Video Tour

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/pjJADJQoAjw/0.jpg)](http://www.youtube.com/watch?v=pjJADJQoAjw)

This is an early version of PhoenixApp, whose main features are visible.

## Defining the problem

I was given the opportunity to create a suite of web apps to solve various workflow problems. This software was developed during the time afforded through a reduced teaching load at a new international school. The main issue I was trying to solve was how can I build software, quickly, with a tool that non-developers (such as Principals) can comprehend the technical debt incurred.

While it may be possible to buy off-the-shelf software that does similar jobs, I wanted to figure out how feasible was it for me to just build most of it on my own. I wanted my bosses to understand the implications of the whole project: Where do we need to continue to invest in? Why are we doing it this way? Since we used GSuite extensively, and our school's mindshare with Google increased over time, the problem eventually became whether I can build such software with GSuite. And then AppMaker was released, and it then became a matter of that.

## Before AppMaker

For the first few years, I used a range of solutions. The major projects that were completed before AppMaker was around were:

- Splash Page, a web app written in Python. A bookmarking tool that allows the community to publish links to various locations in Google Drive, or external links. For example, a new staff member has been told that to communicate with colleagues to use the Daily Notices, but she doesn't know where to go to do that. She will then go to the Splash Page and look for the corresponding button. It is a web application written from "scratch" with Pyramid web framework.

- Daily Notices, a way for staff members to submit their notices into a system, and community members receive them, collated every morning. This was developed in order to implement the Communications policy that had been developed. It is an Apps Script that is triggered once a day, where it reads in the spreadsheet info, updates the web site and sends an email to staff in the morning.

- Report Format, no longer in use. Our gradebook system is effective but lacks customization of reports. In the elementary school, there was a strong emphasis on formatting it for consumption by parents. It used Scrapy to scrape the information from the gradebook, and output PDFs.

- I also built a student directory, medical display, assessment display with spreadsheets and AwesomeTable. In order to make AwesomeTable more powerful, I coded [atjs](https://github.com/classroomtechtools/classroomtechtools.github.io/tree/master/atjs) in order to introduce more advanced features. (This is no longer maintained.) 

- Since I was developing all of these tools, I found it difficult to keep track of my own code. It was time to start identifying some design patterns, and refactor to incorporate them to ensure code reuse. This led me to writing [modularLibraries.gs](https://github.com/classroomtechtools/modularLibraries.gs).

- I decided that I needed to move away from Python, and instead stay within the AppScripts ecosystem. While I found the Python ecosystem much more powerful and easier for *me*, I found that the target audience was much more appreciative if I could find tools such as AppsScripts and Google-endorsed platforms.


## After AppMaker

Once AppMaker was released to the education domains, I immediately saw the ramifications to my long-term project. Even though I did not know about its development until it was released, it was clear that I was a target audience, almost as if it was my problem they had in mind and wanted to provide me a springboard to solve it. I then spent a few months learning the stack, which I found straight-forward compared to other stacks.

The main takeaway I have about AppMaker is that it is powerful enough for an experienced developer to make sophisticated web applications, in very little time. There have been days where a colleague approached me about an idea, and I was able to implement it after just a few days. Previously it would have taken me at least a few weeks.

There is definitely a learning curve with AppMaker involved, but I think it is hitting the "sweet spot" that my problem requires.

## Design, Decisions, and Code

### Where does the data for PhoenixApp come from?

PhoenixApp does not store any of the student information in any localized database; they come entirely from API calls to a public API resource. Any updates that occur from that store are reflected in PhoenixApp within 10 minutes. My bosses like this as it is not duplicating data, and the source of truth is from a source which we do not have to maintain.

For AppMaker, this means I use a calculated datastore that retrieves the information with a server-side script. In order to ensure code reuse, I have a AppsScripts project/library that has a function `callAPIendpoint` which handles the actual interactions and returns the results.

This library is very sophisticated (but not publicly available). The results are cached and can be invalidated if a `modifiedSince` trip indicates the data is dirty. If not cached, the results are collected with concurrent processing. In that way, you can query for all students, teachers, and parents of the entire community and the response time is very performant:

```js
var options = {};
var response = callAPIendpoint(['students', 'teachers', 'parents'], options);
```

Options available are:

* `protect` boolean, which randomizes the data with the [chancejs](https://chancejs.com/) library.
*  `live` boolean; if true then guaranteed to return un-cached, latest information


### How does PhoenixApp know what role the individual has?

It is possible with AppMaker to define roles by adding groups in the deployment settings. Individuals who are in those groups will have specific roles while the application is running. So for example you can define users as administrators, who can see more settings or do specific actions. Importantly, you can also tie these roles into permissions in the data modeling. 

This is a great feature, except that in my case:

* I would have to maintain Google Groups of just teachers, just students, and just admin support staff.
* This information is already available through the OUs
* Since my data model comes almost entirely from external information exposed via public APIs, there is no need to manage permissions based on these roles (although I do use admin role for other things).

Our school, like most organizations, utilizes Organizational Units (OU — a term that is derived from LDAP) and is stored in GSuite and is accessible [via an API](https://developers.google.com/admin-sdk/directory/v1/guides/manage-org-units). With AppsScripts, you can use `AdminDirectory.Users.get` [method](https://developers.google.com/admin-sdk/directory/v1/reference/users/get) to retrieve this info. As both a practical matter and in terms of best practices, it was imperative that I figure out how to use the OUs as the source of truth to know what role the user was to have.

AppMaker has another useful feature, the `Directory` datasource, but sadly this does not include organizational unit information.

So therefore I decided to write the [OuService](https://github.com/classroomtechtools/modularLibraries.gs/tree/master/Examples/OuService) script that runs as a web app externally to the AppMaker instances, thus accessible from within an AppMaker server-side script, though not client-side (due to CORS limitation). Since I will want to be able to invoke from the client-side, I'll need to implement a server-side script that can be called with `google.script.run`:

```js
function getOu(email) {
  var response;
  try {
    response = UrlFetchApp.fetch('https://script.google.com/a/YOURWEBURL/exec?secret=YOURSECRET&user=' + email);
  } catch (e) {
    console.log(e.message);
    return null;
  }
  response = JSON.parse(response);
  return response.orgUnitPath.split('/')[1]; // TODO handle errors
}
```


Now that I've exposed the data, I have to figure out how to utilize it from within AppMaker, thus the next question.

### How do you expose the OUs so they can be utilized as bindings?

-or-

### How do you implement application-wide settings, accessible even in server-side datastore scripts

Now that I have a way to call a service to get the required information, we need a way to be able to, on a user interface widget, which we can already do with this neat trick which will make a widget visible or invisible depending on whether or not the logged-in user is an administrator.

```js
// Label:Display:visible
@user.role.Admin
```

I solved this by creating a `Settings` datastore, and set it up on the `onAppLoad` trigger. 

When the application loads up, loading is suspended and, if required, creates a record that has for the `UserEmail` field the user's email address field, and any settings fields (such as `ProtectData` boolean and `Ou` string). In that way we guarantee that there is one and only one record in Settings for each application user:

```js
// App:Datastores:Settings:queryRecords
query.filters.UserEmail._equals = query.parameters.UserEmail;
return query.run();
```

Processing continues by running looping all of the application's datastores available at `app.datastores` and seeing if there is a `SettingsKey` property available on it. If so, it sets it to the `_key` of that unique record. In that way, all of my calculated datastores which is responsible for fetching the raw information has access to information about the currently enrolled user.

```js
// inside Calculated datastore
var settings;
settings = GetSettings(query);
callAPIEndpoint(['students'], {protect: settings.ProtectData});
...
```

```js
// inside server-side script
function GetSettings(query) {
  return app.models.Settings.getRecord(query.parameters.SettingsKey);
}
```

This all comes together in the `onAppLoad` function that is invoked at application launch `AppSettings:OnAppStart`. The following code is necessary to ensure the `Settings` datastore contains one record associated to the logged-in user, and that the datastores have `SettingsKey` set (assuming that it has already been manually added as a property in the datastore):

```js
function SetUpSettings(loader) {
  var settingsKey = app.datasources.Settings.item._key;
  Object.keys(app.datasources).filter(function (key) {
    return key.indexOf('_') !== 0;  // weed out internal properties
  }).forEach(function (name) {
    var ds;
    ds = app.datasources[name];
    if (ds.properties && ds.properties.hasOwnProperty('SettingsKey'))
      ds.properties.SettingsKey = settingsKey;
  });
  loader.resumeLoad();
}

function onAppLoad(loader) {
  loader.suspendLoad();
  app.datasources.Settings.properties.UserEmail = app.user.email;
  app.datasources.Settings.load(function () {
    // first time this user launched this app
    var create, draft;
    var response, record, ou;
    if (app.datasources.Settings.items.length === 0) {
      create = app.datasources.AllSettings.modes.create;
      draft = create.item;
      draft.UserEmail = app.user.email;
      draft.ProtectData = false;
      google.script.run
        .withSuccessHandler(function (ou) {
        if (!ou) {
          console.log("Did not get ou");
          SetUpSettings(loader);
          return;
        }
        draft.Ou = ou;
        create.createItem(function (record) {
          app.datasources.Settings.load(function () {
            // record created, now we're all good to continue
            SetUpSettings(loader);
          });
        });
      })
        .getOu(app.user.email);
    } else {
      // already set up, continue
      SetUpSettings(loader);
    }
  });
}
```