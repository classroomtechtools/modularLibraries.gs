## Chance.gs

"A minimalist generator of random [1] strings, numbers, etc. to help reduce some monotony particularly while writing automated tests or anywhere else you need anything random." Modified for AppsScripts context, modular library usage. [chancejs](https://chancejs.com)

## Quickstart

Copy [this library's code](https://github.com/classroomtechtools/modularLibraries.gs/blob/master/Chance/Chance.gs) into your project. Use it:

```js
var chance;
Import.Chance({
    namespace: 'Chance'
});
Chance.name();  // random name
```

See [chancejs](https://chancejs.com) for full API details. Chance is also great for unit testing, because if you provide it the same exact seed, you are guaranteed to get the same result. Usage is a bit different for modular library usage:

```js
// If you need to use the seed feature:
chance = Import.Chance({
    namespace: 'Chance'
    config: {
        seed: ''  // put your seed here
    }
});
Chance.name();
```

## Motivation

Making some convenient functions available to the appscript stack is useful for me, for the following:

- Working at a school, I'd like to flip a button and instead of school info being displayed (student names, nationality info) you get randomized ones instead. Useful for conferences
- Potentially could be used in a testing framework
