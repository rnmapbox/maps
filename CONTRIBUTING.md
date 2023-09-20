# Contributing

## Setup for creating pull requests
- Fork this project
- In your fork, create a branch, for example: `fix/camera-update`
- Add your changes
- Push and open a PR with your branch

## Testing my changes
The metro bundler under `/example` is set up to use the libraries files under root.  
Which means, when you change something within `src/components/UserLocation.js`  
it will be reflected in any scene in example that uses that component.

## Best practices for PR's
- If you add a feature, make sure you add it to the documentation
- If you add an objective-c or java method, make sure you update the declaration file: `index.d.ts`.
- Make sure to use small concise commits
- Use meaningful commit messages
- Make sure to update/ add new tests for your changes
- If you add a new feature make sure to add a scene in `/example` for others to see/ test it

## Documentation
Documentation is generated from code blocks and comments.  
It will be auto-generated when you commit changes.  
If any changes are generated from your edits, the changed files will need to be added using `git add` before attempting the commit again.  
To manually generate the changes, run `npm run generate`.  

Notice, that changing the documentation in the individual <COMPONENT>.md within `/docs` will not suffice.  
The correct way is the above described

## Generated Java files

`android/src/main/old-arch/` contains files generated with codegen scripts from `src/specs` to update those use the `codegen-old-arch.sh` script
