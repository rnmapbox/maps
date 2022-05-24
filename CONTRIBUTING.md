# Contributing

## Creating pull requests

- Fork this project
- In your fork, create a branch, for example: `fix/camera-update`
- Add your changes
- Push and open a PR with your branch

## Testing changes

The metro bundler under `/example` is set up to use the libraries files under root. Which means, when you change something within `javascript/components/UserLocation.js`, it will be reflected in any scene in `/example` that uses that component.

The library is a combination of Typescript and Javascript, which gets compiled into `/lib` for consumption by the `/example` project. This should work fine, but if you have any difficulty with the example trying to read the files in `/javascript` (outside of `/lib`), as a last resort you can run `npm pack` in the root, and then in `/example`, run `npm install ../rnmapbox-maps-<version>.tgz`.

## Best practices for PR's

- If you add a feature, make sure you add it to the documentation
- If you add an objective-c or java method, make sure you update the declaration file: `definitions.d.ts`.
- Make sure to use small concise commits
- Use meaningful commit messages
- Make sure to update/ add new tests for your changes
- If you add a new feature make sure to add a scene in `/example` for others to see/ test it

## Documentation

Documentation is generated from code blocks and comments. It will be auto-generated when you commit changes. If any changes are generated from your edits, the changed files will need to be added using `git add` before attempting the commit again. To manually generate the changes, run `npm run generate`.