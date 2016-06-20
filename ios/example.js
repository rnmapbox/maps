'use strict';

import React, { Component } from 'react';
import Mapbox from 'react-native-mapbox-gl';
import {
  AppRegistry,
  StyleSheet,
  Text,
  StatusBar,
  View
} from 'react-native';

const accessToken = 'your-mapbox.com-access-token';

class MapExample extends Component {
  state = {
    center: {
      latitude: 40.72052634,
      longitude: -73.97686958312988
    },
    zoom: 11,
    annotations: [{
      coordinates: [40.72052634, -73.97686958312988],
      'type': 'point',
      title: 'This is marker 1',
      subtitle: 'It has a rightCalloutAccessory too',
      rightCalloutAccessory: {
        url: 'https://cldup.com/9Lp0EaBw5s.png',
        height: 25,
        width: 25
      },
      annotationImage: {
        url: 'https://cldup.com/CnRLZem9k9.png',
        height: 25,
        width: 25
      },
      id: 'marker1'
    }, {
      coordinates: [40.714541341726175,-74.00579452514648],
      'type': 'point',
      title: 'Important!',
      subtitle: 'Neat, this is a custom annotation image',
      annotationImage: {
        url: 'https://cldup.com/7NLZklp8zS.png',
        height: 25,
        width: 25
      },
      id: 'marker2'
    }, {
      'coordinates': [[40.76572150042782,-73.99429321289062],[40.743485405490695, -74.00218963623047],[40.728266950429735,-74.00218963623047],[40.728266950429735,-73.99154663085938],[40.73633186448861,-73.98983001708984],[40.74465591168391,-73.98914337158203],[40.749337730454826,-73.9870834350586]],
      'type': 'polyline',
      'strokeColor': '#00FB00',
      'strokeWidth': 4,
      'strokeAlpha': .5,
      'id': 'foobar'
    }, {
      'coordinates': [[40.749857912194386, -73.96820068359375], [40.741924698522055,-73.9735221862793], [40.735681504432264,-73.97523880004883], [40.7315190495212,-73.97438049316406], [40.729177554196376,-73.97180557250975], [40.72345355209305,-73.97438049316406], [40.719290332250544,-73.97455215454102], [40.71369559554873,-73.97729873657227], [40.71200407096382,-73.97850036621094], [40.71031250340588,-73.98691177368163], [40.71031250340588,-73.99154663085938]],
      'type': 'polygon',
      'fillAlpha':1,
      'strokeColor': '#fffff',
      'fillColor': 'blue',
      'id': 'zap'
    }]
  };

  onRegionChange = (location) => {
    this.setState({ currentZoom: location.zoom });
  };
  onRegionWillChange = (location) => {
    console.log(location);
  };
  onUpdateUserLocation = (location) => {
    console.log(location);
  };
  onOpenAnnotation = (annotation) => {
    console.log(annotation);
  };
  onRightAnnotationTapped = (e) => {
    console.log(e);
  };
  onLongPress = (location) => {
    console.log('long pressed', location);
  };
  onTap = (location) => {
    console.log('tapped', location);
  };
  onOfflineProgressDidChange = (progress) => {
    console.log(progress);
  };
  onOfflineMaxAllowedMapboxTiles = (hitLimit) => {
    console.log(hitLimit);
  };

  render() {
    StatusBar.setHidden(true);
    return (
      <View style={styles.container}>
        <Text onPress={() => this._map && this._map.setDirectionAnimated(0)}>
          Set direction to 0
        </Text>
        <Text onPress={() => this._map && this._map.setZoomLevelAnimated(6)}>
          Zoom out to zoom level 6
        </Text>
        <Text onPress={() => this._map && this._map.setCenterCoordinateAnimated(48.8589, 2.3447)}>
          Go to Paris at current zoom level {parseInt(this.state.currentZoom)}
        </Text>
        <Text onPress={() => this._map && this._map.setCenterCoordinateZoomLevelAnimated(35.68829, 139.77492, 14)}>
          Go to Tokyo at fixed zoom level 14
        </Text>
        <Text onPress={() => this._map && this._map.addAnnotations([{
          coordinates: [40.73312,-73.989],
          type: 'point',
          title: 'This is a new marker',
          id: 'foo'
        }, {
          'coordinates': [[40.749857912194386, -73.96820068359375], [40.741924698522055,-73.9735221862793], [40.735681504432264,-73.97523880004883], [40.7315190495212,-73.97438049316406], [40.729177554196376,-73.97180557250975], [40.72345355209305,-73.97438049316406], [40.719290332250544,-73.97455215454102], [40.71369559554873,-73.97729873657227], [40.71200407096382,-73.97850036621094], [40.71031250340588,-73.98691177368163], [40.71031250340588,-73.99154663085938]],
          'type': 'polygon',
          'fillAlpha': 1,
          'fillColor': '#000',
          'strokeAlpha': 1,
          'id': 'new-black-polygon'
        }])}>
          Add new marker
        </Text>
        <Text onPress={() => this._map && this._map.updateAnnotation({
          coordinates: [40.714541341726175,-74.00579452514648],
          'type': 'point',
          title: 'New Title!',
          subtitle: 'New Subtitle',
          annotationImage: {
            url: 'https://cldup.com/7NLZklp8zS.png',
            height: 25,
            width: 25
          },
          id: 'marker2'
        })}>
          Update marker2
        </Text>
        <Text onPress={() => this._map && this._map.selectAnnotationAnimated('marker1')}>
          Open marker1 popup
        </Text>
        <Text onPress={() => this._map && this._map.removeAnnotation('marker2')}>
          Remove marker2 annotation
        </Text>
        <Text onPress={() => this.removeAllAnnotations(mapRef)}>
          Remove all annotations
        </Text>
        <Text onPress={() => this._map && this._map.setVisibleCoordinateBoundsAnimated(40.712, -74.227, 40.774, -74.125, 100, 0, 0, 0)}>
          Set visible bounds to 40.7, -74.2, 40.7, -74.1
        </Text>
        <Text onPress={() => this._map && this._map.setUserTrackingMode(Mapbox.userTrackingMode.follow)}>
          Set userTrackingMode to follow
        </Text>
        <Text onPress={() => this._map && this._map.getCenterCoordinateZoomLevel((location)=> {
            console.log(location);
          })}>
          Get location
        </Text>
        <Text onPress={() => this._map && this._map.getDirection((direction)=> {
            console.log(direction);
          })}>
          Get direction
        </Text>
        <Text onPress={() => this._map && this._map.getBounds((bounds)=> {
            console.log(bounds);
          })}>
          Get bounds
        </Text>
        <Text onPress={() => this._map && this._map.addPackForRegion({
            name: 'test',
            type: 'bbox',
            bounds: [0, 0, 0, 0],
            minZoomLevel: 0,
            maxZoomLevel: 0,
            metadata: {},
            styleURL: Mapbox.mapStyles.emerald
          })}>
          Create offline pack
        </Text>
        <Text onPress={() => this._map && this._map.getPacks((err, packs)=> {
            if (err) console.log(err);
            console.log(packs);
          })}>
          Get offline packs
        </Text>
        <Text onPress={() => this._map && this._map.removePack('test', (err, info)=> {
            if (err) console.log(err);
            if (info) {
              console.log('Deleted', info.deleted);
            } else {
              console.log('No packs to delete');
            }
          })}>
          Remove pack with name 'test'
        </Text>
        <Mapbox
          ref={map => { this._map = map; }}
          style={styles.container}
          direction={0}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
          showsUserLocation={true}
          accessToken={accessToken}
          styleURL={Mapbox.mapStyles.emerald}
          userTrackingMode={Mapbox.userTrackingMode.none}
          centerCoordinate={this.state.center}
          zoomLevel={this.state.zoom}
          onRegionChange={this.onRegionChange}
          onRegionWillChange={this.onRegionWillChange}
          annotations={this.state.annotations}
          onOpenAnnotation={this.onOpenAnnotation}
          onRightAnnotationTapped={this.onRightAnnotationTapped}
          onUpdateUserLocation={this.onUpdateUserLocation}
          onLongPress={this.onLongPress}
          onTap={this.onTap}
          onOfflineProgressDidChange={this.onOfflineProgressDidChange}
          onOfflineMaxAllowedMapboxTiles={this.onOfflineMaxAllowedMapboxTiles} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

AppRegistry.registerComponent('YourAppName', () => MapExample);
