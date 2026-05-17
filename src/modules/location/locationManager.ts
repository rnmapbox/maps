import {
  NativeModules,
  NativeEventEmitter,
  AppState,
  NativeEventSubscription,
  EmitterSubscription,
  type AppStateStatus,
  Platform,
  EventSubscription,
} from 'react-native';

import NativeRNMBXLocationModule from '../../specs/NativeRNMBXLocationModule';

const Mapbox = NativeModules.RNMBXModule;
const MapboxLocationManager: typeof NativeRNMBXLocationModule = Platform.select(
  {
    ios: NativeModules.RNMBXLocationModule,
    android: NativeRNMBXLocationModule,
  },
);

const IsTurbo: boolean =
  typeof MapboxLocationManager.onLocationUpdate === 'function';

export const LocationModuleEventEmitter =
  Platform.OS === 'ios' || (Platform.OS === 'android' && !IsTurbo)
    ? new NativeEventEmitter(MapboxLocationManager as any)
    : null;

/**
 * Location object sent by locationManager, containing geographic coordinates (a Coordinates object with latitude, longitude, altitude, accuracy, heading, course, and speed) and a Unix timestamp in milliseconds indicating when the location was determined.
 * The native SDK requests location with high accuracy by default: iOS uses kCLLocationAccuracyBest (the 2nd highest of 6 accuracy levels), and Android uses AccuracyLevel.HIGH (the 2nd highest of 5 levels) with a 1000ms update interval. These accuracy settings are not configurable from the React Native side.
 */
export interface Location {
  coords: Coordinates;
  timestamp?: number;
}

/**
 * Geographic coordinates sent by locationManager. Includes latitude and longitude in degrees, optional altitude in meters above sea level, optional accuracy as the horizontal radius of uncertainty in meters, heading and course in degrees, and the instantaneous speed in meters per second. Heading is the compass direction the device is facing and course is the direction of travel; these are distinct values, but on Android both currently return the same value because the Mapbox SDK does not expose a public compass engine API (see rnmapbox/maps issues 4063, 3391, and 3041 for context).
 */
interface Coordinates {
  /**
   * The heading (measured in degrees) relative to true north.
   * Heading is used to describe the direction the device is pointing to (the value of the compass).
   * Note that on Android this currently falls back to the course value because the Mapbox SDK does not expose
   * a public compass engine API. See related issues:
   * https://github.com/rnmapbox/maps/issues/4063, https://github.com/rnmapbox/maps/issues/3391,
   * https://github.com/rnmapbox/maps/issues/3041.
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
 * Singleton class that wraps the native Mapbox location manager.
 * Manages GPS location updates and distributes them to registered listeners, automatically pausing updates when the app moves to the background and resuming when it returns to the foreground (unless requestsAlwaysUse is enabled), and caches the last known location for immediate access.
 * Use the default export locationManager rather than instantiating this class directly.
 *
 * @example
 * import locationManager from '@rnmapbox/maps/modules/location/locationManager';
 *
 * locationManager.addListener((location) => {
 *   console.log(location.coords.latitude, location.coords.longitude);
 * });
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

  /**
   * Returns the last known location from the cache. If no cached location is available,
   * queries the native location manager for the most recent location.
   *
   * This method does not activate GPS or start location updates. To receive
   * continuous location updates, use addListener instead.
   *
   * @return {Promise<Location | null>} The last known location, or null if unavailable.
   *
   * @example
   * const location = await locationManager.getLastKnownLocation();
   * if (location) {
   *   console.log(location.coords.latitude, location.coords.longitude);
   * }
   */
  async getLastKnownLocation() {
    if (!this._lastKnownLocation) {
      let lastKnownLocation;

      // as location can be brittle it might happen,
      // that we get an exception from native land
      // let's silently catch it and simply log out
      // instead of throwing an exception
      try {
        lastKnownLocation = await MapboxLocationManager.getLastKnownLocation();
      } catch (error) {
        console.warn('locationManager Error: ', error);
      }

      if (!this._lastKnownLocation && lastKnownLocation) {
        this._lastKnownLocation = lastKnownLocation;
      }
    }

    return this._lastKnownLocation;
  }

  /**
   * Registers a callback to receive location updates. Automatically starts
   * location updates if not already listening.
   *
   * If a cached location is available, the listener is called immediately
   * with the cached value.
   *
   * @param {Function} listener Callback that receives a Location object on each update.
   *
   * @example
   * const onLocation = (location) => {
   *   console.log(location.coords.latitude, location.coords.longitude);
   * };
   * locationManager.addListener(onLocation);
   */
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

  /**
   * Removes a previously registered location listener. If no listeners remain,
   * location updates are automatically stopped.
   *
   * @param {Function} listener The listener callback to remove.
   *
   * @example
   * locationManager.removeListener(onLocation);
   */
  removeListener(listener: (location: Location) => void) {
    this._listeners = this._listeners.filter((l) => l !== listener);
    if (this._listeners.length === 0) {
      this.stop();
    }
  }

  /**
   * Removes all registered location listeners and stops location updates.
   *
   * @example
   * locationManager.removeAllListeners();
   */
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

  /**
   * Starts listening for native location updates. This is called automatically
   * by addListener when the first listener is registered, so you
   * typically do not need to call it directly.
   *
   * @param {number} displacement Minimum distance in meters the device must move
   *   before a location update is generated. Defaults to the value set by
   *   setMinDisplacement, or -1 (no minimum) if not set.
   */
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
      MapboxLocationManager.start(validDisplacement);
      //Determine if TurboModules (new architecture) are available.

      if (LocationModuleEventEmitter) {
        // Cast to match NativeEventEmitter's strict signature - runtime behavior is correct
        this.subscription = LocationModuleEventEmitter.addListener(
          Mapbox.LocationCallbackName.Update,
          this._onUpdate as (...args: readonly Object[]) => unknown,
        );
      } else {
        this.subscription = MapboxLocationManager.onLocationUpdate(
          (location: any) => {
            this._onUpdate(location.payload);
          },
        );
      }

      this._isListening = true;
    }
  }

  /**
   * Stops listening for native location updates. Called automatically when
   * all listeners are removed or when the app moves to the background
   * (unless requestsAlwaysUse is enabled).
   */
  stop() {
    MapboxLocationManager.stop();

    if (this._isListening && this.subscription) {
      this.subscription.remove();
    }

    this._isListening = false;
  }

  /**
   * Sets the minimum distance in meters the device must move before a location
   * update is generated. Defaults to 0 (no minimum, updates on every change).
   *
   * Maps to distanceFilter on iOS and displacement on Android.
   *
   * @param {number} minDisplacement The minimum displacement in meters.
   *
   * @example
   * locationManager.setMinDisplacement(10); // Only update after moving 10 meters
   */
  setMinDisplacement(minDisplacement: number) {
    this._minDisplacement = minDisplacement;
    MapboxLocationManager.setMinDisplacement(minDisplacement);
  }

  /**
   * Sets whether the app should request "always" location permission and continue
   * receiving updates in the background.
   *
   * Note: This is not implemented in Mapbox Maps SDK v11 and is currently a no-op
   * on both iOS and Android.
   *
   * @platform ios
   * @param {boolean} requestsAlwaysUse Whether to request always-on location.
   */
  setRequestsAlwaysUse(requestsAlwaysUse: boolean) {
    MapboxLocationManager.setRequestsAlwaysUse(requestsAlwaysUse);
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
    MapboxLocationManager.simulateHeading(changesPerSecond, increment);
  }

  /**
   * Sets the period at which location events will be sent over the React Native bridge.
   * The default is 0, which means no throttling (every update is sent immediately).
   *
   * @example
   * locationManager.setLocationEventThrottle(500);
   *
   * @param {number} throttleValue Event throttle value in milliseconds. Set to 0 to disable throttling.
   * @return {void}
   */
  setLocationEventThrottle(throttleValue: number) {
    MapboxLocationManager.setLocationEventThrottle(throttleValue);
  }
}

export default new LocationManager();
