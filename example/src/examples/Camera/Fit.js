import React from 'react';
import {View, Text} from 'react-native';
import {isEqual} from 'lodash';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../../styles/sheet';
import BaseExamplePropTypes from '../common/BaseExamplePropTypes';
import Page from '../common/Page';

const buildPadding = ([top, right, bottom, left] = [0, 0, 0, 0]) => {
  return {
    paddingLeft: left,
    paddingRight: right,
    paddingTop: top,
    paddingBottom: bottom,
  };
};

const houseBounds = {
  ne: [-74.135379, 40.795909],
  sw: [-74.135449, 40.795578],
};

const townBounds = {
  ne: [-74.12641, 40.797968],
  sw: [-74.143727, 40.772177],
};

const houseCenter = [
  (houseBounds.ne[0] + houseBounds.sw[0]) / 2,
  (houseBounds.ne[1] + houseBounds.sw[1]) / 2,
];
const townCenter = [
  (townBounds.ne[0] + townBounds.sw[0]) / 2,
  (townBounds.ne[1] + townBounds.sw[1]) / 2,
];

const paddingZero = buildPadding();
const paddingTop = buildPadding([200, 40, 40, 40]);
const paddingBottom = buildPadding([40, 40, 200, 40]);

class Fit extends React.Component {
  static propTypes = {...BaseExamplePropTypes};

  constructor(props) {
    super(props);

    this.state = {
      containType: 'house', // 'house' | 'town'
      fitType: undefined, // 'bounds' | 'centerCoordinate'
      zoomLevel: undefined, // number
      padding: paddingZero,
      animationDuration: 500,

      // For updating the UI in this example.
      cachedFlyTo: undefined, // 'house' | 'town'
      cachedZoomLevel: undefined, // number
    };

    this.camera = null;
  }

  componentDidUpdate(prevProps, prevState) {
    const changed = stateKey => {
      // Checking if final state is `undefined` prevents another round of zeroing out in
      // second `componentDidUpdate` call.
      return (
        !isEqual(prevState[stateKey], this.state[stateKey]) &&
        this.state[stateKey] !== undefined
      );
    };

    if (
      changed('fitType') ||
      changed('containType') ||
      changed('zoomLevel') ||
      changed('padding')
    ) {
      this.setState({
        cachedFlyTo: undefined,
        cachedZoomLevel: undefined,
      });
    } else if (changed('cachedFlyTo') || changed('cachedZoomLevel')) {
      this.setState({
        fitType: undefined,
        zoomLevel: undefined,
        padding: paddingZero,
      });
    }
  }

  renderSection = (title, buttons, fade = false) => {
    return (
      <View style={{paddingBottom: 5, opacity: fade ? 0.5 : 1}}>
        <Text>{title}</Text>
        <View
          style={{
            flex: 0,
            flexDirection: 'row',
            width: '100%',
            paddingVertical: 10,
          }}>
          {buttons.map(button => (
            <TouchableOpacity
              key={button.title}
              style={{
                flex: 0,
                padding: 5,
                marginRight: 5,
                backgroundColor: button.selected ? 'coral' : '#d8d8d8',
                borderRadius: 5,
              }}
              onPress={button.onPress}>
              <Text>{button.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  cameraProps = () => {
    const {fitType, containType, zoomLevel, padding, animationDuration} =
      this.state;

    let p = {
      bounds: undefined,
      centerCoordinate: undefined,
      zoomLevel: undefined,
      padding,
      animationDuration,
    };

    if (fitType === 'bounds') {
      p.bounds = containType === 'house' ? houseBounds : townBounds;
    } else if (fitType === 'centerCoordinate') {
      p.centerCoordinate = containType === 'house' ? houseCenter : townCenter;
    }

    if (zoomLevel !== undefined) {
      p.zoomLevel = zoomLevel;
    }

    return p;
  };

  render() {
    const {
      fitType,
      containType,
      zoomLevel,
      padding,
      cachedFlyTo,
      cachedZoomLevel,
    } = this.state;

    const zoomConfigButtons = [undefined, 14, 15, 16, 17, 18, 19, 20].map(n => {
      return {
        title: `${n}`,
        selected: zoomLevel === n,
        onPress: () => this.setState({zoomLevel: n}),
      };
    });

    const zoomToButtons = [14, 15, 16, 17, 18, 19, 20].map(n => {
      return {
        title: `${n}`,
        selected: cachedZoomLevel === n,
        onPress: () => {
          this.camera.zoomTo(n, 1000);
          this.setState({cachedZoomLevel: n});
        },
      };
    });

    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          styleURL={MapboxGL.StyleURL.Satellite}
          style={sheet.matchParent}>
          <MapboxGL.Camera
            ref={ref => (this.camera = ref)}
            {...this.cameraProps()}
          />
          <View style={{flex: 1, ...padding}}>
            <View style={{flex: 1, borderColor: 'white', borderWidth: 4}} />
          </View>
        </MapboxGL.MapView>

        <ScrollView
          style={{
            flex: 0,
            width: '100%',
            maxHeight: 350,
            backgroundColor: 'white',
          }}
          contentContainerStyle={{
            padding: 10,
            paddingBottom: 20,
          }}>
          {this.renderSection('Contain type', [
            {
              title: 'House',
              selected: containType === 'house',
              onPress: () => this.setState({containType: 'house'}),
            },
            {
              title: 'Town',
              selected: containType === 'town',
              onPress: () => this.setState({containType: 'town'}),
            },
          ])}

          {this.renderSection('Fit type', [
            {
              title: 'undefined',
              selected: fitType === undefined,
              onPress: () => this.setState({fitType: undefined}),
            },
            {
              title: 'Bounds',
              selected: fitType === 'bounds',
              onPress: () => this.setState({fitType: 'bounds'}),
            },
            {
              title: 'Center coordinate',
              selected: fitType === 'centerCoordinate',
              onPress: () => this.setState({fitType: 'centerCoordinate'}),
            },
          ])}

          {this.renderSection(
            'Zoom' +
              (fitType !== 'centerCoordinate'
                ? ' (not used if center coordinate is not set)'
                : ''),
            zoomConfigButtons,
            fitType !== 'centerCoordinate',
          )}

          {this.renderSection('Fly to (imperative)', [
            {
              title: 'House',
              selected: cachedFlyTo === 'house',
              onPress: () => {
                this.camera.flyTo(houseCenter);
                this.setState({cachedFlyTo: 'house'});
              },
            },
            {
              title: 'Town',
              selected: cachedFlyTo === 'town',
              onPress: () => {
                this.camera.flyTo(townCenter);
                this.setState({cachedFlyTo: 'town'});
              },
            },
          ])}

          {this.renderSection('Zoom to (imperative)', zoomToButtons)}

          {this.renderSection('Padding', [
            {
              title: 'None',
              selected: isEqual(padding, paddingZero),
              onPress: () => this.setState({padding: paddingZero}),
            },
            {
              title: 'Top',
              selected: isEqual(padding, paddingTop),
              onPress: () => this.setState({padding: paddingTop}),
            },
            {
              title: 'Bottom',
              selected: isEqual(padding, paddingBottom),
              onPress: () => this.setState({padding: paddingBottom}),
            },
          ])}
        </ScrollView>
      </Page>
    );
  }
}

export default Fit;
