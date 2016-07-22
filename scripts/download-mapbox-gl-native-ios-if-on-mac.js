var version = process.argv[2];

// only download iOS SDK if on Mac OS
if (process.platform === 'darwin') {
  var exec = require('child_process').exec;
  var cmd = './scripts/download-mapbox-gl-native-ios.sh ' + version;
  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      console.error(error);
      return;
    }
    console.log(stdout);
    console.log(stderr);
  });
}
