import {
  NativeModules,
  NativeEventEmitter,
  AppState,
  NativeEventSubscription,
  EmitterSubscription,
  type AppStateStatus,
  Platform,
  EventSubscription,
} from 'react-native'

import NativeRNMBXLocationModule from '../../specs/NativeRNMBXLocationModule'

const MapboxGL = NativeModules.RNMBXModule
const MapboxGLLocationManager: typeof NativeRNMBXLocationModule = Platform.select({ios: NativeModules.RNMBXLocationModule, android:  NativeRNMBXLocationModule})

export const LocationModuleEventEmitter = new NativeEventEmitter(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MapboxGLLocationManager as any,
);

/**
 * Location sent by locationManager
 */
export interface Location {
  coords: Coordinates;
  timestamp?: number;
}

/**
 * Coorinates sent by locationManager
 */
interface Coordinates {
  /**
   * The heading (measured in degrees) relative to true north.
   * Heading is used to describe the direction the device is pointing to (the value of the compass).
   * Note that on Android this is incorrectly reporting the course value as mentioned in issue https://github.com/rnmapbox/maps/issues/1213
   * and will be corrected in a future update.
   */
  heading?: number;

  /**
   * The direction in which the device is traveling, measured in degrees and relative to due north.
   * The course refers to the direction the device is actually moving (not the same as heading).
   */
  course?: number;

  /**
   * The instantaneous speed of the device, measured in meters per second.
   */
  speed?: number;

  /**
   * The latitude in degrees.
   */
  latitude: number;

  /**
   * The longitude in degrees.
   */
  longitude: number;

  /**
   * The radius of uncertainty for the location, measured in meters.
   */
  accuracy?: number;

  /**
   * The altitude, measured in meters.
   */
  altitude?: number;
}

/**
 * LocationManager is a singleton, see `locationManager`
 */
export class LocationManager {
  _listeners: ((location: Location) => void)[];
  _lastKnownLocation: Location | null;
  _isListening: boolean;
  _requestsAlwaysUse: boolean;
  subscription: EmitterSubscription | EventSubscription | null;
  _appStateListener: NativeEventSubscription;
  _minDisplacement?: number;

  constructor() {
    this._listeners = [];
    this._lastKnownLocation = null;
    this._isListening = false;
    this._requestsAlwaysUse = false;
    this._onUpdate = this._onUpdate.bind(this);
    this.subscription = null;

    this._appStateListener = AppState.addEventListener(
      'change',
      this._handleAppStateChange.bind(this),
    );
  }

  async getLastKnownLocation() {
    if (!this._lastKnownLocation) {
      let lastKnownLocation;

      // as location can be brittle it might happen,
      // that we get an exception from native land
      // let's silently catch it and simply log out
      // instead of throwing an exception
      try {
        lastKnownLocation =
          await MapboxGLLocationManager.getLastKnownLocation();
      } catch (error) {
        console.warn('locationManager Error: ', error);
      }

      if (!this._lastKnownLocation && lastKnownLocation) {
        this._lastKnownLocation = lastKnownLocation;
      }
    }

    return this._lastKnownLocation;
  }

  addListener(listener: (location: Location) => void) {
    if (!this._isListening) {
      this.start();
    }
    if (!this._listeners.includes(listener)) {
      this._listeners.push(listener);

      if (this._lastKnownLocation) {
        listener(this._lastKnownLocation);
      }
    }
  }

  removeListener(listener: (location: Location) => void) {
    this._listeners = this._listeners.filter((l) => l !== listener);
    if (this._listeners.length === 0) {
      this.stop();
    }
  }

  removeAllListeners() {
    this._listeners = [];
    this.stop();
  }

  _handleAppStateChange(appState: AppStateStatus) {
    if (!this._requestsAlwaysUse) {
      if (appState === 'background') {
        this.stop();
      } else if (appState === 'active') {
        if (this._listeners.length > 0) {
          this.start();
        }
      }
    }
  }

  start(displacement = -1) {
    let validDisplacement = 1;
    if (
      displacement === -1 ||
      displacement === null ||
      displacement === undefined
    ) {
      validDisplacement = this._minDisplacement || -1;
    } else {
      validDisplacement = displacement;
    }

    if (!this._isListening) {
      MapboxGLLocationManager.start(validDisplacement);

      if (Platform.OS === 'ios') {
        this.subscription = LocationModuleEventEmitter.addListener(
          MapboxGL.LocationCallbackName.Update,
          this._onUpdate,
        );
      } else {
        this.subscription = MapboxGLLocationManager.onLocationUpdate((location) => {
          this._onUpdate(location.payload);
        });
      }

      this._isListening = true;
    }
  }

  stop() {
    MapboxGLLocationManager.stop();

    if (this._isListening && this.subscription) {
      this.subscription.remove();
    }

    this._isListening = false;
  }

  setMinDisplacement(minDisplacement: number) {
    this._minDisplacement = minDisplacement;
    MapboxGLLocationManager.setMinDisplacement(minDisplacement);
  }

  setRequestsAlwaysUse(requestsAlwaysUse: boolean) {
    MapboxGLLocationManager.setRequestsAlwaysUse(requestsAlwaysUse);
    this._requestsAlwaysUse = requestsAlwaysUse;
  }

  _onUpdate(location: Location) {
    this._lastKnownLocation = location;

    this._listeners.forEach((l) => l(location));
  }

  /**
   * simulates location updates, experimental  [V10, iOS only]
   */
  _simulateHeading(changesPerSecond: number, increment: number) {
    MapboxGLLocationManager.simulateHeading(changesPerSecond, increment);
  }

  /**
   * Sets the period at which location events will be sent over the React Native bridge.
   * The default is 0, aka no limit. [V10, iOS only]
   *
   * @example
   * locationManager.setLocationEventThrottle(500);
   *
   * @param {Number} throttleValue event throttle value in ms.
   * @return {void}
   */
  setLocationEventThrottle(throttleValue: number) {
    MapboxGLLocationManager.setLocationEventThrottle(throttleValue);
  }
}

export default new LocationManager();
