# Contributing

## Setup for creating pull requests

1. You'll first need to go through a normal [react-native setup](https://facebook.github.io/react-native/docs/getting-started.html#content)
1. Create a new react-native project with `react-native init <YOUR-PROJECT-NAME>`
1. `cd` into your project
1. You have 2 options for linking `react-native-mapbox-gl`
  * Use `react-native link`
  * Clone `@react-native-mapbox-gl/maps` into the `node_modules` folder
1. Go through a normal install process for your platform

Once installed, you can edit any file in `@react-native-mapbox-gl/maps`,  
commit the changes and push them to a fork for creating a pull request.

## Best practices for PR's

1. If you add a feature, make sure you add it to the documentation
1. If you add an objective-c or java method, make sure you update the declaration file: `index.d.ts`.

## Documentation

Documentation is generated from code blocks and comments.
It will be auto-generated when you commit changes.
If any changes are generated from your edits, the changed files will need to be added using `git add` before attempting the commit again.
To manually generate the changes, run `npm run generate`.
