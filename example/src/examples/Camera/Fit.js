import React from 'react';
import { View, Text } from 'react-native';
import { isEqual } from 'lodash';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../../styles/sheet';
import BaseExamplePropTypes from '../common/BaseExamplePropTypes';
import { TouchableOpacity } from 'react-native-gesture-handler';
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

class Fit extends React.Component {
  static propTypes = {...BaseExamplePropTypes};

  constructor(props) {
    super(props);

    // this.options = [
    //   {
    //     label: 'House (none)',
    //     data: {bounds: houseBounds, padding: buildPadding()},
    //   },
    //   {
    //     label: 'House (bottom)',
    //     data: {bounds: houseBounds, padding: buildPadding([40, 40, 200, 40])},
    //   },
    //   {
    //     label: 'House (top)',
    //     data: {bounds: houseBounds, padding: buildPadding([200, 40, 40, 40])},
    //   },
    //   {
    //     label: 'Town',
    //     data: {bounds: townBounds, padding: buildPadding()},
    //   },
    //   {
    //     label: 'Town (bottom)',
    //     data: {bounds: townBounds, padding: buildPadding([40, 40, 200, 40])},
    //   },
    //   {
    //     label: 'Town (top)',
    //     data: {bounds: townBounds, padding: buildPadding([200, 40, 40, 40])},
    //   },
    // ];

    this.state = {
      fitType: 'bounds', // 'bounds' | 'centerCoordinate'
      containType: 'house', // 'house' | 'town'
      zoomLevel: undefined,
      padding: buildPadding(),
      animationDuration: 500,
    };
  }

  renderSection = (title, key, buttons) => {
    return (
      <View style={{paddingBottom: 5}}>
        <Text>{title}</Text>
        <View style={{flex: 0, flexDirection: 'row', width: '100%', paddingVertical: 10}}>
          {buttons.map(button => (
            <TouchableOpacity
              key={`${button.value}`}
              style={{flex: 0, padding: 5, marginRight: 5, backgroundColor: isEqual(this.state[key], button.value) ? 'coral' : '#d8d8d8', borderRadius: 5}}
              key={button.title}
              onPress={() => this.setState({ [key]: button.value })}
            >
              <Text>{button.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  }

  render() {
    const { fitType, containType, zoomLevel, padding, animationDuration } = this.state;

    let cameraProps = {
      bounds: undefined,
      centerCoordinate: undefined,
      zoomLevel: undefined,
      padding,
      animationDuration,
    };
    if (fitType === 'bounds') {
      cameraProps.bounds = containType === 'house' ? houseBounds : townBounds;
    } else if (fitType === 'centerCoordinate') {
      cameraProps.centerCoordinate = containType === 'house' ? houseBounds.ne : townBounds.ne;
    }
    if (zoomLevel !== undefined) {
      cameraProps.zoomLevel = zoomLevel;
    }

    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          styleURL={MapboxGL.StyleURL.Satellite}
          style={sheet.matchParent}>
          <MapboxGL.Camera {...cameraProps} />
          <View style={{flex: 1, ...padding}}>
            <View style={{flex: 1, borderColor: 'white', borderWidth: 4}} />
          </View>
        </MapboxGL.MapView>

        <View style={{flex: 0, width: '100%', padding: 10, paddingBottom: 20, backgroundColor: 'white'}}>
          {this.renderSection('Fit Type', 'fitType', [
            { title: 'Bounds', value: 'bounds' },
            { title: 'Center Coordinate', value: 'centerCoordinate' },
          ])}
          {this.renderSection('Contain Type', 'containType', [
            { title: 'House', value: 'house' },
            { title: 'Town', value: 'town' },
          ])}
          {this.renderSection('Zoom' + (fitType === 'bounds' ? ' (Not used when bounds is set)' : ''), 'zoomLevel', [undefined, 14, 15, 16, 17, 18, 19, 20].map(n => {
            return { title: `${n}`, value: n };
          }))}
          {this.renderSection('Padding', 'padding', [
            { title: 'None', value: buildPadding() },
            { title: 'Top', value: buildPadding([200, 40, 40, 40]) },
            { title: 'Bottom', value: buildPadding([40, 40, 200, 40]) },
          ])}
        </View>
      </Page>
    );
  }
}

export default Fit;
