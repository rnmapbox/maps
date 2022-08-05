---
name: Bug
about: This template should be used for reporting bugs and defects.
title: ''
labels: 'bug :beetle:'
assignees: ''

---


## Environment

- Mapbox (GL) implementation: [e.g. v10, MapLibre, MapboxGL]
- Mapbox (GL) version: [e.g. 6.3.0]
- @rnmapbox/maps Version [e.g. #main]
- Platform: [e.g. Android, iOS]
- React Native Version [e.g. 0.59]
- Platform OS: [e.g. Android 9, iOS 10]
- Device: [e.g. iPhone6]
- Emulator/ Simulator: [yes/ no]
- Dev OS: [e.g. OSX 11.0.1, Win10]

## Standalone component to reproduce

<!--- Use [our BugReportTemplate](https://github.com/rnmapbox/maps/blob/main/example/src/examples/BugReportExample.js) screens as a starting point. --->
<!--- Component should be self contained - no extra libraries, external data, no parameters --->
<!--- Do not include setAccessToken or access token istelf. ---->


```js
import React from 'react';
import {
  MapView,
  ShapeSource,
  LineLayer,
  Camera,
} from '@rnmapbox/maps';

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

## Observed behavior and steps to reproduce

<!--- Please include as much evidence as possible (traces, videos, screenshots etc.) --->

## Expected behavior

<!--- Please include the expected behavior and any resources supporting this expected behavior. --->

## Notes / preliminary analysis

<!--- include your initial analysis, if available --->

## Additional links and references

<!--- Links to traces, videos et --->
