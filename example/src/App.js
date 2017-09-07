import React from 'react';
import MapboxGL from 'react-native-mapbox-gl';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';

import { Icon } from 'react-native-elements';

// components
import MapHeader from './components/common/MapHeader';

// styles
import sheet from './styles/sheet';
import colors from './styles/colors';

// utils
import { IS_ANDROID } from './utils';
import config from './utils/config';

// examples
import ShowMap from './components/ShowMap';
import SetPitch from './components/SetPitch';
import SetBearing from './components/SetBearing';
import ShowClick from './components/ShowClick';
import FlyTo from './components/FlyTo';
import FitBounds from './components/FitBounds';
import SetUserTrackingModes from './components/SetUserTrackingModes';
import ShowRegionDidChange from './components/ShowRegionDidChange';
import YoYo from './components/YoYo';

const styles = StyleSheet.create({
  header: {
    marginTop: 48,
    fontSize: 24,
    textAlign: 'center',
  },
  exampleList: {
    flex: 1,
    marginTop: 60 + 12, // header + list padding,
  },
  exampleListItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  exampleListItem: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exampleListLabel: {
    fontSize: 18,
  },
  exampleBackground: {
    flex: 1,
    backgroundColor: colors.primary.pinkFaint,
  },
});

class ExampleItem {
  constructor (label, Component) {
    this.label = label;
    this.Component = Component;
  }
}

const Examples = [
  new ExampleItem('Show Map', ShowMap),
  new ExampleItem('Set Pitch', SetPitch),
  new ExampleItem('Set Bearing', SetBearing),
  new ExampleItem('Show Click', ShowClick),
  new ExampleItem('Fly To', FlyTo),
  new ExampleItem('Fit Bounds', FitBounds),
  new ExampleItem('Set User Tracking Modes', SetUserTrackingModes),
  new ExampleItem('Show Region Did Change', ShowRegionDidChange),
  new ExampleItem('Yo Yo Camera', YoYo),
];

class App extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      activeExample: -1,
    };

    this.renderItem = this.renderItem.bind(this);
    this.onCloseExample = this.onCloseExample.bind(this);
  }

  async componentWillMount () {
    if (IS_ANDROID) {
      await MapboxGL.requestPermissions();
    }
    MapboxGL.setAccessToken(config.get('accessToken'));
  }

  getActiveItem () {
    if (this.state.activeExample < 0 || this.state.activeExample >= Examples.length) {
      return null;
    }
    return Examples[this.state.activeExample];
  }

  onExamplePress (activeExamplePosition) {
    this.setState({ activeExample: activeExamplePosition });
  }

  onCloseExample () {
    this.setState({ activeExample: -1 });
  }

  renderItem ({ item, index }) {
    return (
      <View style={styles.exampleListItemBorder}>
        <TouchableOpacity onPress={() => this.onExamplePress(index)}>
          <View style={styles.exampleListItem}>
            <Text style={styles.exampleListLabel}>{item.label}</Text>

            <Icon name='keyboard-arrow-right' />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  renderActiveExample () {
    const item = this.getActiveItem();

    const modalProps = {
      visible: !!item,
      transparent: true,
      animationType: 'slide',
      onRequestClose: this.onCloseExample,
    };

    return (
      <Modal {...modalProps}>
        <View style={styles.exampleBackground}>
          {modalProps.visible  ? (
            <item.Component key={item.label} label={item.label} onDismissExample={this.onCloseExample} />
          ) : null}
        </View>
      </Modal>
    );
  }

  render () {
    return (
      <View style={sheet.matchParent}>
        <MapHeader label="React Native Mapbox GL" />

        <View style={sheet.matchParent}>
          <FlatList
            style={styles.exampleList}
            data={Examples}
            keyExtractor={item => item.label}
            renderItem={this.renderItem} />
        </View>

        {this.renderActiveExample()}
      </View>
    );
  }
}

export default App;
