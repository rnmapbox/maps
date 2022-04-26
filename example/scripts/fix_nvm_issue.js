// fix ios build issue related to nvm
// error message: `nvm is not compatible with the "PREFIX" environment variable: currently set to "/usr/local"`
// see detailed discussion here => https://github.com/facebook/react-native/issues/31181
// see detailed discussion here => https://github.com/facebook/react-native/issues/31259

const fs = require('fs');

// solution as described here: https://github.com/facebook/react-native/issues/31181#issuecomment-815913541
const anchorLine = /set -e/;
const replacementContent = 'unset npm_config_prefix\nunset PREFIX\nset -e\n';
const problemFilePath = './node_modules/react-native/scripts/find-node.sh';
const problemFileContent = fs.readFileSync(problemFilePath, 'utf8');
fs.writeFileSync(
  problemFilePath,
  problemFileContent.replace(anchorLine, replacementContent),
  'utf8',
);

console.log('🙏🏻 nvm with iOS should work 🙏🏻');
