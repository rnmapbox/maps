#!/usr/bin/env node

var version = process.argv[2];
var path = require('path');

// only download iOS SDK if on Mac OS
if (process.platform === 'darwin') {
  var exec = require('child_process').exec;
  var cmd = path.join(__dirname, 'download-mapbox-gl-native-ios.sh') + ' ' + version;
  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      console.error(error);
      return;
    }
    console.log(stdout);
    console.log(stderr);
  });
}
