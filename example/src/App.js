import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {Icon} from 'react-native-elements';

// Components
import MapHeader from './components/common/MapHeader';
// Styles
import sheet from './styles/sheet';
import colors from './styles/colors';
// Utils
import {IS_ANDROID} from './utils';
import config from './utils/config';
// Examples
import ShowMap from './components/ShowMap';
import SetPitch from './components/SetPitch';
import SetBearing from './components/SetBearing';
import ShowClick from './components/ShowClick';
import FlyTo from './components/FlyTo';
import FitBounds from './components/FitBounds';
import SetUserTrackingModes from './components/SetUserTrackingModes';
import SetUserLocationVerticalAlignment from './components/SetUserLocationVerticalAlignment';
import ShowRegionDidChange from './components/ShowRegionDidChange';
import CustomIcon from './components/CustomIcon';
import YoYo from './components/YoYo';
import EarthQuakes from './components/EarthQuakes';
import GeoJSONSource from './components/GeoJSONSource';
import WatercolorRasterTiles from './components/WatercolorRasterTiles';
import TwoByTwo from './components/TwoByTwo';
import IndoorBuilding from './components/IndoorBuilding';
import QueryAtPoint from './components/QueryAtPoint';
import QueryWithRect from './components/QueryWithRect';
import ShapeSourceIcon from './components/ShapeSourceIcon';
import CustomVectorSource from './components/CustomVectorSource';
import ShowPointAnnotation from './components/ShowPointAnnotation';
import CreateOfflineRegion from './components/CreateOfflineRegion';
import DriveTheLine from './components/DriveTheLine';
import ImageOverlay from './components/ImageOverlay';
import DataDrivenCircleColors from './components/DataDrivenCircleColors';
import ChoroplethLayerByZoomLevel from './components/ChoroplethLayerByZoomLevel';
import PointInMapView from './components/PointInMapView';
import TakeSnapshot from './components/TakeSnapshot';
import TakeSnapshotWithMap from './components/TakeSnapshotWithMap';
import GetZoom from './components/GetZoom';
import GetCenter from './components/GetCenter';
import UserLocationChange from './components/UserLocationChange';

const styles = StyleSheet.create({
  noPermissionsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
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

MapboxGL.setAccessToken(config.get('accessToken'));

class ExampleItem {
  constructor(label, Component) {
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
  new ExampleItem(
    'Set User Location Vertical Alignment',
    SetUserLocationVerticalAlignment,
  ),
  new ExampleItem('Show Region Did Change', ShowRegionDidChange),
  new ExampleItem('Custom Icon', CustomIcon),
  new ExampleItem('Yo Yo Camera', YoYo),
  new ExampleItem('Clustering Earthquakes', EarthQuakes),
  new ExampleItem('GeoJSON Source', GeoJSONSource),
  new ExampleItem('Watercolor Raster Tiles', WatercolorRasterTiles),
  new ExampleItem('Two Map Views', TwoByTwo),
  new ExampleItem('Indoor Building Map', IndoorBuilding),
  new ExampleItem('Query Feature Point', QueryAtPoint),
  new ExampleItem('Query Features Bounding Box', QueryWithRect),
  new ExampleItem('Shape Source From Icon', ShapeSourceIcon),
  new ExampleItem('Custom Vector Source', CustomVectorSource),
  new ExampleItem('Show Point Annotation', ShowPointAnnotation),
  new ExampleItem('Create Offline Region', CreateOfflineRegion),
  new ExampleItem('Animation Along a Line', DriveTheLine),
  new ExampleItem('Image Overlay', ImageOverlay),
  new ExampleItem('Data Driven Circle Colors', DataDrivenCircleColors),
  new ExampleItem('Choropleth Layer By Zoom Level', ChoroplethLayerByZoomLevel),
  new ExampleItem('Get Pixel Point in MapView', PointInMapView),
  new ExampleItem('Take Snapshot Without Map', TakeSnapshot),
  new ExampleItem('Take Snapshot With Map', TakeSnapshotWithMap),
  new ExampleItem('Get Current Zoom', GetZoom),
  new ExampleItem('Get Center', GetCenter),
  new ExampleItem('User Location Updates', UserLocationChange),
];

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFetchingAndroidPermission: IS_ANDROID,
      isAndroidPermissionGranted: false,
      activeExample: -1,
    };

    this.renderItem = this.renderItem.bind(this);
    this.onCloseExample = this.onCloseExample.bind(this);
  }

  async componentWillMount() {
    if (IS_ANDROID) {
      const isGranted = await MapboxGL.requestAndroidLocationPermissions();
      this.setState({
        isAndroidPermissionGranted: isGranted,
        isFetchingAndroidPermission: false,
      });
    }
  }

  getActiveItem() {
    if (
      this.state.activeExample < 0 ||
      this.state.activeExample >= Examples.length
    ) {
      return null;
    }
    return Examples[this.state.activeExample];
  }

  onExamplePress(activeExamplePosition) {
    this.setState({activeExample: activeExamplePosition});
  }

  onCloseExample() {
    this.setState({activeExample: -1});
  }

  renderItem({item, index}) {
    return (
      <View style={styles.exampleListItemBorder}>
        <TouchableOpacity onPress={() => this.onExamplePress(index)}>
          <View style={styles.exampleListItem}>
            <Text style={styles.exampleListLabel}>{item.label}</Text>
            <Icon name="keyboard-arrow-right" />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  renderActiveExample() {
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
          {modalProps.visible ? (
            <item.Component
              key={item.label}
              label={item.label}
              onDismissExample={this.onCloseExample}
            />
          ) : null}
        </View>
      </Modal>
    );
  }

  render() {
    if (IS_ANDROID && !this.state.isAndroidPermissionGranted) {
      if (this.state.isFetchingAndroidPermission) {
        return null;
      }
      return (
        <View style={sheet.matchParent}>
          <Text style={styles.noPermissionsText}>
            You need to accept location permissions in order to use this example
            applications
          </Text>
        </View>
      );
    }

    return (
      <View style={sheet.matchParent}>
        <MapHeader label="React Native Mapbox GL" />

        <View style={sheet.matchParent}>
          <FlatList
            style={styles.exampleList}
            data={Examples}
            keyExtractor={item => item.label}
            renderItem={this.renderItem}
          />
        </View>

        {this.renderActiveExample()}
      </View>
    );
  }
}

export default App;
