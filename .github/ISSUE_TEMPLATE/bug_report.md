---
name: Bug report
about: Create a report to help us improve
title: ''
labels: ''
assignees: ''

---


---------  

🚨🚨🚨
* Please respect and fill out the issue template
* Before you report, please make sure you tested on a physical device
* For build issues: Can you reproduce it on a clean install of the example app? Please include full steps to reproduce from `react-native init`
* Please include standalone code sample - a single component with one MapView in it. Use [one of our example](https://github.com/rnmapbox/maps/blob/master/example/src/examples/PointInMapView.js) screens as a starging point.
* Use [discussions](https://github.com/rnmapbox/maps/discussions) or gitter and/or stack overflow for questions.

If you want others to spend time on your issue, please make sure to first spend some time on the ticket. 

Not following the above will lead to the ticket being closed.
Thanks for understanding.  
Please understand that the project is run by volunteers on their own free time.  

🚨🚨🚨  

---------


**Describe the bug**  
A clear and concise description of what the bug is.

**To Reproduce**  
Steps to reproduce the behavior. 

Please include a single standalone React Native component.  
Use [our BugReportTemplate](https://github.com/rnmapbox/maps/blob/master/example/src/examples/BugReportTemplate.js) screens as a starting point.
Please simplify the example as much as possible!

Chances that a bug report will be investiagete and worked on are exponetially higher with a complete and _working_ repro BugTemplate!

Example:
```js
import React from 'react';
import {
  MapView,
  ShapeSource,
  LineLayer,
  Camera,
} from '@react-native-mapbox-gl/maps';

const aLine = {
  type: 'LineString',
  coordinates: [
    [-74.00597, 40.71427],
    [-74.00697, 40.71527],
  ],
};

class BugReportExample extends React.Component {
  render() {
    return (
      <MapView style={{flex: 1}}>
        <Camera centerCoordinate={[-74.00597, 40.71427]} zoomLevel={14} />
        <ShapeSource id="idStreetLayer" shape={aLine}>
          <LineLayer id="idStreetLayer" />
        </ShapeSource>
      </MapView>
    );
  }
}
```

If it's a build/startup issue please include full steps to reproduce from `react-native init ...`

Example:

```sh
react-native init sample --version react-native@0.60.5
cd sample
npm install rnmapbox/maps#main --save
# or released version `npm install @react-native-mapbox-gl/maps@8.0.0-rc1 --save`
react-native run-android
```

**Expected behavior**  
A clear and concise description of what you expected to happen.

**Actual behavior**  
A clear and concise description of what is currently happening.

**Screenshots**  
If applicable, add screenshots to help explain your problem.

**Versions (please complete the following information):**  
 - Platform: [e.g. Android, iOS]
 - Platform OS: [e.g. Android 9, iOS 10]
 - Device: [e.g. iPhone6]
 - Emulator/ Simulator: [yes/ no]
 - Dev OS: [e.g. OSX 11.0.1, Win10]
 - react-native-mapbox-gl Version [e.g. 7.0.9]
 - Mapbox GL version [e.g. 6.3.0]
 - React Native Version [e.g. 0.59]

**Additional context**  
Add any other context about the problem here.
