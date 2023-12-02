# How to create a release for this repo

## Make sure `main` builds correctly

Are all our [actions](https://github.com/rnmapbox/maps/actions) passing successfully?  
If not, make sure to investigate the issue and fix it prior to a release.

## Bump the version in our package.json

Once you verified, that `main` isn't broken, go on and increase the `version` within our `package.json`. This should be done by `Bump version` workflow

## Draft a new release on GitHub

Within the [releases](https://github.com/rnmapbox/maps/releases) section of the repo you can [`Draft a new release`](https://github.com/rnmapbox/maps/releases/new).


Select a tag, and press `Generate release notes`

Edit generated `release notes` if needed

`Tag version` & `Release title` should be the same.  

## Monitor the repos issues for updates

Once the release is out the door (on [npm](https://www.npmjs.com/package/@rnmapbox/maps)), make sure to monitor the [issues](https://github.com/rnmapbox/maps/issues) closely for problems the community might encounter
